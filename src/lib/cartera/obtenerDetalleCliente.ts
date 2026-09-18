import { notFound } from "next/navigation";
import { crearClienteSupabaseServidor } from "@/lib/supabaseServidor";
import { calcularSegmentoCliente } from "@/lib/segmentacion/calcularSegmento";
import { recomendarAccion } from "@/lib/recomendacion/recomendarAccion";
import type { Cliente, Factura, RecomendacionAccion, SegmentoCliente } from "@/types/cobranza";

export interface DetalleFactura {
  id: string;
  numeroFactura: string | null;
  montoFacturado: number;
  montoPagado: number;
  saldoPendiente: number;
  fechaVencimiento: string;
}

export interface DetalleGestion {
  id: string;
  tipo: string;
  resultado: string | null;
  detalle: string | null;
  fecha: string;
  plantilla: { nombre: string; escenario: string } | null;
  registradoPor: { nombre: string } | null;
}

export interface DetalleCliente {
  id: string;
  codigoExterno: string;
  nombre: string;
  nit: string | null;
  correo: string | null;
  telefono: string | null;
  tipoServicio: string | null;
  diasCredito: number | null;
  volumenNegocio: number | null;
  antiguedadClienteMeses: number | null;
  analistaAsignado: string | null;
  envioAutomaticoHabilitado: boolean;
  segmento: SegmentoCliente;
  recomendacion: RecomendacionAccion;
  facturas: DetalleFactura[];
  gestiones: DetalleGestion[];
}

/**
 * Sin tipos generados de la base de datos, Supabase infiere las relaciones
 * embebidas como arreglo aunque en runtime devuelva un solo objeto (FK
 * many-to-one, como gestiones.plantilla_id -> plantillas_correo). Normaliza
 * ambas formas a un solo objeto o null.
 */
function normalizarUnoAUno<T>(valor: T | T[] | null): T | null {
  if (Array.isArray(valor)) return valor[0] ?? null;
  return valor ?? null;
}

/** Detalle de un cliente (PRD 10.1): datos maestros, segmento, facturas e historial de gestiones. */
export async function obtenerDetalleCliente(clienteId: string): Promise<DetalleCliente> {
  const supabase = await crearClienteSupabaseServidor();

  const { data: c, error: errorCliente } = await supabase
    .from("clientes")
    .select(
      "id, codigo_externo, nombre, nit, correo, telefono, tipo_servicio, dias_credito, volumen_negocio, antiguedad_cliente_meses, analista_asignado, envio_automatico_habilitado"
    )
    .eq("id", clienteId)
    .maybeSingle();
  if (errorCliente) throw new Error(`Error al leer el cliente: ${errorCliente.message}`);
  if (!c) notFound();

  const { data: facturasDb, error: errorFacturas } = await supabase
    .from("facturas")
    .select("id, numero_factura, monto_facturado, monto_pagado, saldo_pendiente, fecha_vencimiento")
    .eq("cliente_id", clienteId)
    .order("fecha_vencimiento", { ascending: true });
  if (errorFacturas) throw new Error(`Error al leer facturas: ${errorFacturas.message}`);

  const { data: gestionesDb, error: errorGestiones } = await supabase
    .from("gestiones")
    .select(
      "id, tipo, resultado, detalle, fecha, plantilla:plantillas_correo(nombre, escenario), registrado_por:usuarios_sistema(nombre)"
    )
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false });
  if (errorGestiones) throw new Error(`Error al leer gestiones: ${errorGestiones.message}`);

  const cliente: Cliente = {
    id: c.id,
    codigoExterno: c.codigo_externo,
    nombre: c.nombre,
    correo: c.correo,
    analistaAsignado: c.analista_asignado,
    antiguedadClienteMeses: c.antiguedad_cliente_meses,
    volumenNegocio: c.volumen_negocio,
    envioAutomaticoHabilitado: c.envio_automatico_habilitado,
  };

  const facturasPendientes: Factura[] = (facturasDb ?? [])
    .filter((f) => Number(f.saldo_pendiente) > 0)
    .map((f) => ({
      id: f.id,
      clienteId,
      numeroFactura: f.numero_factura,
      saldoPendiente: Number(f.saldo_pendiente),
      fechaVencimiento: f.fecha_vencimiento,
    }));

  const segmento = calcularSegmentoCliente(cliente, facturasPendientes);
  const recomendacion = recomendarAccion(segmento);

  return {
    id: c.id,
    codigoExterno: c.codigo_externo,
    nombre: c.nombre,
    nit: c.nit,
    correo: c.correo,
    telefono: c.telefono,
    tipoServicio: c.tipo_servicio,
    diasCredito: c.dias_credito,
    volumenNegocio: c.volumen_negocio,
    antiguedadClienteMeses: c.antiguedad_cliente_meses,
    analistaAsignado: c.analista_asignado,
    envioAutomaticoHabilitado: c.envio_automatico_habilitado,
    segmento,
    recomendacion,
    facturas: (facturasDb ?? []).map((f) => ({
      id: f.id,
      numeroFactura: f.numero_factura,
      montoFacturado: Number(f.monto_facturado),
      montoPagado: Number(f.monto_pagado),
      saldoPendiente: Number(f.saldo_pendiente),
      fechaVencimiento: f.fecha_vencimiento,
    })),
    gestiones: (gestionesDb ?? []).map((g) => ({
      id: g.id,
      tipo: g.tipo,
      resultado: g.resultado,
      detalle: g.detalle,
      fecha: g.fecha,
      plantilla: normalizarUnoAUno(g.plantilla),
      registradoPor: normalizarUnoAUno(g.registrado_por),
    })),
  };
}
