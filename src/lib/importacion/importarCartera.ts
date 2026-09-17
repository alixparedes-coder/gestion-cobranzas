import { getSupabaseAdmin } from "@/lib/supabase";
import type { FilaCarteraValidada, ResultadoImportacion } from "@/types/importacion";

/**
 * Sube a Supabase las filas ya validadas por `parsearArchivoCartera()`:
 * upsert de clientes (por `codigo_externo`) y de facturas (por
 * `cliente_id` + `numero_factura`). Es idempotente — reimportar el mismo
 * archivo actualiza los mismos registros en vez de duplicarlos.
 */
export async function importarCartera(filas: FilaCarteraValidada[]): Promise<ResultadoImportacion> {
  if (filas.length === 0) {
    return { clientesProcesados: 0, facturasProcesadas: 0 };
  }

  const supabase = getSupabaseAdmin();

  const clientesPorCodigo = new Map<string, FilaCarteraValidada>();
  for (const fila of filas) {
    clientesPorCodigo.set(fila.codigoExterno, fila); // la última fila de cada cliente manda en sus datos maestros
  }

  const clientesParaUpsert = [...clientesPorCodigo.values()].map((fila) => ({
    codigo_externo: fila.codigoExterno,
    nombre: fila.nombreCliente,
    nit: fila.nit ?? null,
    correo: fila.correo ?? null,
    telefono: fila.telefono ?? null,
    tipo_servicio: fila.tipoServicio ?? null,
    dias_credito: fila.diasCredito ?? null,
    volumen_negocio: fila.volumenNegocio ?? null,
    antiguedad_cliente_meses: fila.antiguedadClienteMeses ?? null,
    analista_asignado: fila.analistaAsignado ?? null,
  }));

  const { data: clientesGuardados, error: errorClientes } = await supabase
    .from("clientes")
    .upsert(clientesParaUpsert, { onConflict: "codigo_externo" })
    .select("id, codigo_externo");

  if (errorClientes || !clientesGuardados) {
    throw new Error(`Error al importar clientes: ${errorClientes?.message}`);
  }

  const idClientePorCodigo = new Map(clientesGuardados.map((c) => [c.codigo_externo, c.id]));

  const facturasParaUpsert = filas.map((fila) => {
    const clienteId = idClientePorCodigo.get(fila.codigoExterno);
    if (!clienteId) {
      throw new Error(`No se encontró el cliente "${fila.codigoExterno}" recién guardado.`);
    }
    return {
      cliente_id: clienteId,
      numero_factura: fila.numeroFactura,
      monto_facturado: fila.montoFacturado,
      monto_pagado: fila.montoPagado,
      saldo_pendiente: fila.montoFacturado - fila.montoPagado,
      fecha_vencimiento: fila.fechaVencimiento,
    };
  });

  const { error: errorFacturas } = await supabase
    .from("facturas")
    .upsert(facturasParaUpsert, { onConflict: "cliente_id,numero_factura" });

  if (errorFacturas) {
    throw new Error(`Error al importar facturas: ${errorFacturas.message}`);
  }

  return {
    clientesProcesados: clientesParaUpsert.length,
    facturasProcesadas: facturasParaUpsert.length,
  };
}
