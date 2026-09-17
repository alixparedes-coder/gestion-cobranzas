import { Readable } from "node:stream";
import ExcelJS from "exceljs";
import type { ErrorImportacion, FilaCarteraValidada, ResultadoValidacionCartera } from "@/types/importacion";

/**
 * Encabezados aceptados por campo (normalizados: minúsculas, sin tildes,
 * sin espacios de más). Cubre tanto el español "de negocio" del PRD como
 * variantes comunes. Ajustar aquí si el formato real del negocio usa otros
 * nombres de columna — no hace falta tocar el resto del parser.
 */
const ALIAS_COLUMNAS: Record<keyof Omit<FilaCarteraValidada, "fila" | "montoPagado">, string[]> = {
  codigoExterno: ["codigo cliente", "codigo"],
  nombreCliente: ["nombre cliente", "nombre"],
  nit: ["nit"],
  correo: ["correo", "correo electronico", "email"],
  telefono: ["telefono"],
  tipoServicio: ["tipo servicio", "tipo de servicio"],
  diasCredito: ["dias credito"],
  volumenNegocio: ["volumen negocio", "volumen de negocio"],
  antiguedadClienteMeses: ["antiguedad cliente meses", "antiguedad meses"],
  analistaAsignado: ["analista", "analista asignado"],
  numeroFactura: ["numero factura", "factura"],
  montoFacturado: ["monto facturado"],
  fechaVencimiento: ["fecha vencimiento", "fecha de vencimiento"],
};
// "montoPagado" es opcional y no tiene alias obligatorio para no romper el tipo Record; se busca aparte.
const ALIAS_MONTO_PAGADO = ["monto pagado"];

const CAMPOS_REQUERIDOS = [
  "codigoExterno",
  "nombreCliente",
  "numeroFactura",
  "montoFacturado",
  "fechaVencimiento",
] as const;

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

function construirMapaColumnas(encabezados: string[]): Map<number, string> {
  const mapa = new Map<number, string>();

  encabezados.forEach((encabezado, indice) => {
    const normalizado = normalizar(encabezado ?? "");
    if (!normalizado) return;

    if (ALIAS_MONTO_PAGADO.includes(normalizado)) {
      mapa.set(indice, "montoPagado");
      return;
    }

    for (const [campo, alias] of Object.entries(ALIAS_COLUMNAS)) {
      if (alias.includes(normalizado)) {
        mapa.set(indice, campo);
        return;
      }
    }
  });

  return mapa;
}

function celdaATexto(valor: ExcelJS.CellValue): string | undefined {
  if (valor === null || valor === undefined) return undefined;
  if (valor instanceof Date) return undefined;
  if (typeof valor === "object" && "text" in valor) return String(valor.text).trim() || undefined;
  const texto = String(valor).trim();
  return texto === "" ? undefined : texto;
}

function celdaANumero(valor: ExcelJS.CellValue): number | undefined | typeof Number.NaN {
  if (valor === null || valor === undefined || valor === "") return undefined;
  if (typeof valor === "number") return valor;
  const texto = celdaATexto(valor);
  if (texto === undefined) return undefined;
  const normalizado = texto.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : Number.NaN;
}

/** Acepta una fecha real de Excel o un texto en formato ISO (YYYY-MM-DD). Devuelve `undefined` si no se puede interpretar. */
function celdaAFechaIso(valor: ExcelJS.CellValue): string | undefined {
  if (valor instanceof Date) {
    return valor.toISOString().slice(0, 10);
  }
  const texto = celdaATexto(valor);
  if (texto === undefined) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;
  return undefined;
}

async function cargarPrimeraHoja(buffer: Buffer, nombreArchivo: string): Promise<ExcelJS.Worksheet> {
  const workbook = new ExcelJS.Workbook();
  const esCsv = nombreArchivo.toLowerCase().endsWith(".csv");

  if (esCsv) {
    return workbook.csv.read(Readable.from(buffer));
  }

  // El propio .d.ts de exceljs declara `interface Buffer extends ArrayBuffer {}`
  // en el scope global, lo que mezcla (declaration merging) con el Buffer real
  // de @types/node y rompe la compatibilidad estructural para cualquier Buffer
  // real pasado aquí. No hay cast a "Buffer" que lo arregle porque el propio
  // tipo global "Buffer" quedó contaminado; se usa `any` deliberadamente.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(buffer as any);
  const hoja = workbook.worksheets[0];
  if (!hoja) throw new Error("El archivo no tiene ninguna hoja con datos.");
  return hoja;
}

/**
 * Lee y valida un archivo de cartera (Excel o CSV, RF-01) fila por fila.
 * No importa nada a la base de datos — solo parsea y valida (RF-02); usar
 * `importarCartera()` con `filasValidas` una vez que `errores` esté vacío.
 */
export async function parsearArchivoCartera(
  buffer: Buffer,
  nombreArchivo: string
): Promise<ResultadoValidacionCartera> {
  const hoja = await cargarPrimeraHoja(buffer, nombreArchivo);

  const filaEncabezados = hoja.getRow(1);
  const encabezados: string[] = [];
  filaEncabezados.eachCell({ includeEmpty: true }, (celda, numeroColumna) => {
    encabezados[numeroColumna] = celdaATexto(celda.value) ?? "";
  });
  const mapaColumnas = construirMapaColumnas(encabezados);

  const camposFaltantes = CAMPOS_REQUERIDOS.filter(
    (campo) => ![...mapaColumnas.values()].includes(campo)
  );
  if (camposFaltantes.length > 0) {
    return {
      filasValidas: [],
      errores: [
        {
          fila: 0,
          mensaje: `Faltan columnas requeridas en el archivo: ${camposFaltantes.join(", ")}.`,
        },
      ],
    };
  }

  const filasValidas: FilaCarteraValidada[] = [];
  const errores: ErrorImportacion[] = [];
  const facturasVistas = new Set<string>();

  const totalFilas = hoja.rowCount;
  for (let numeroFila = 2; numeroFila <= totalFilas; numeroFila++) {
    const fila = hoja.getRow(numeroFila);
    if (fila.actualCellCount === 0) continue; // fila vacía, se ignora sin error

    const indiceFila = numeroFila - 1; // 1 = primera fila de datos
    const valores: Record<string, ExcelJS.CellValue> = {};
    mapaColumnas.forEach((campo, indiceColumna) => {
      valores[campo] = fila.getCell(indiceColumna).value;
    });

    const erroresFila: ErrorImportacion[] = [];

    const codigoExterno = celdaATexto(valores.codigoExterno);
    if (!codigoExterno) erroresFila.push({ fila: indiceFila, columna: "Código Cliente", mensaje: "Falta el código del cliente." });

    const nombreCliente = celdaATexto(valores.nombreCliente);
    if (!nombreCliente) erroresFila.push({ fila: indiceFila, columna: "Nombre Cliente", mensaje: "Falta el nombre del cliente." });

    const numeroFactura = celdaATexto(valores.numeroFactura);
    if (!numeroFactura) erroresFila.push({ fila: indiceFila, columna: "Número Factura", mensaje: "Falta el número de factura." });

    const montoFacturado = celdaANumero(valores.montoFacturado);
    if (montoFacturado === undefined) {
      erroresFila.push({ fila: indiceFila, columna: "Monto Facturado", mensaje: "Falta el monto facturado." });
    } else if (Number.isNaN(montoFacturado) || montoFacturado <= 0) {
      erroresFila.push({ fila: indiceFila, columna: "Monto Facturado", mensaje: "El monto facturado debe ser un número mayor a 0." });
    }

    const montoPagadoBruto = celdaANumero(valores.montoPagado);
    let montoPagado = 0;
    if (montoPagadoBruto !== undefined) {
      if (Number.isNaN(montoPagadoBruto) || montoPagadoBruto < 0) {
        erroresFila.push({ fila: indiceFila, columna: "Monto Pagado", mensaje: "El monto pagado debe ser un número mayor o igual a 0." });
      } else {
        montoPagado = montoPagadoBruto;
      }
    }

    if (
      typeof montoFacturado === "number" &&
      !Number.isNaN(montoFacturado) &&
      montoPagado > montoFacturado
    ) {
      erroresFila.push({ fila: indiceFila, columna: "Monto Pagado", mensaje: "El monto pagado no puede ser mayor al monto facturado." });
    }

    const fechaVencimiento = celdaAFechaIso(valores.fechaVencimiento);
    if (!fechaVencimiento) {
      erroresFila.push({
        fila: indiceFila,
        columna: "Fecha Vencimiento",
        mensaje: "Falta la fecha de vencimiento o no tiene un formato reconocible (se espera fecha de Excel o texto YYYY-MM-DD).",
      });
    }

    const camposNumericosOpcionales: Array<[keyof FilaCarteraValidada, string]> = [
      ["diasCredito", "Días Crédito"],
      ["volumenNegocio", "Volumen Negocio"],
      ["antiguedadClienteMeses", "Antigüedad Cliente Meses"],
    ];
    const numericosOpcionales: Record<string, number | undefined> = {};
    for (const [campo, etiqueta] of camposNumericosOpcionales) {
      const valor = celdaANumero(valores[campo]);
      if (valor !== undefined && Number.isNaN(valor)) {
        erroresFila.push({ fila: indiceFila, columna: etiqueta, mensaje: `"${etiqueta}" debe ser un número.` });
      } else {
        numericosOpcionales[campo] = valor;
      }
    }

    if (codigoExterno && numeroFactura) {
      const clave = `${codigoExterno}::${numeroFactura}`;
      if (facturasVistas.has(clave)) {
        erroresFila.push({
          fila: indiceFila,
          columna: "Número Factura",
          mensaje: `La factura "${numeroFactura}" del cliente "${codigoExterno}" aparece más de una vez en el archivo.`,
        });
      }
      facturasVistas.add(clave);
    }

    if (erroresFila.length > 0) {
      errores.push(...erroresFila);
      continue;
    }

    filasValidas.push({
      fila: indiceFila,
      codigoExterno: codigoExterno!,
      nombreCliente: nombreCliente!,
      nit: celdaATexto(valores.nit),
      correo: celdaATexto(valores.correo),
      telefono: celdaATexto(valores.telefono),
      tipoServicio: celdaATexto(valores.tipoServicio),
      diasCredito: numericosOpcionales.diasCredito,
      volumenNegocio: numericosOpcionales.volumenNegocio,
      antiguedadClienteMeses: numericosOpcionales.antiguedadClienteMeses,
      analistaAsignado: celdaATexto(valores.analistaAsignado),
      numeroFactura: numeroFactura!,
      montoFacturado: montoFacturado as number,
      montoPagado,
      fechaVencimiento: fechaVencimiento!,
    });
  }

  return { filasValidas, errores };
}
