/** Tipos para la importación de cartera desde Excel/CSV (PRD RF-01/RF-02). */

/** Un error de validación de una fila específica del archivo importado. */
export interface ErrorImportacion {
  /** Número de fila tal como aparece en el archivo (1 = primera fila de datos, sin contar encabezados). */
  fila: number;
  columna?: string;
  mensaje: string;
}

/** Una fila del archivo ya validada y lista para importar (una factura de un cliente). */
export interface FilaCarteraValidada {
  fila: number;
  codigoExterno: string;
  nombreCliente: string;
  nit?: string;
  correo?: string;
  telefono?: string;
  tipoServicio?: string;
  diasCredito?: number;
  volumenNegocio?: number;
  antiguedadClienteMeses?: number;
  analistaAsignado?: string;
  numeroFactura: string;
  montoFacturado: number;
  montoPagado: number;
  /** Fecha ISO (YYYY-MM-DD). */
  fechaVencimiento: string;
}

export interface ResultadoValidacionCartera {
  filasValidas: FilaCarteraValidada[];
  errores: ErrorImportacion[];
}

export interface ResultadoImportacion {
  clientesProcesados: number;
  facturasProcesadas: number;
}
