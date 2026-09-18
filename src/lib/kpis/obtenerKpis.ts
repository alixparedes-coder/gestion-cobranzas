import { crearClienteSupabaseServidor } from "@/lib/supabaseServidor";
import { calcularDiasAtraso } from "@/lib/segmentacion/calcularSegmento";

/** Meta del KPI de tasa de recuperación, definida por el negocio (PRD sección 11). */
export const META_RECUPERACION_PORCENTAJE = 95;

export interface Kpis {
  tasaRecuperacion: {
    promedioPorCliente: number | null;
    clientesQueAlcanzaronMeta: number;
    totalClientesConDeuda: number;
  };
  /**
   * Proxy de "días promedio de mora" (PRD sección 11): el PRD lo define como
   * el tiempo que tardan los clientes en pagar después del vencimiento, pero
   * no hay historial de fechas de pago (PRD 6.3) para calcular eso. Esto es
   * el promedio de días de atraso de las facturas vencidas *ahora mismo* —
   * una foto del momento, no un promedio histórico de tiempo-hasta-pago.
   */
  diasPromedioAtrasoActual: number | null;
  carteraVencida: {
    porcentaje: number | null;
    totalCartera: number;
    totalVencido: number;
  };
}

export async function obtenerKpis(): Promise<Kpis> {
  const supabase = await crearClienteSupabaseServidor();

  const { data: facturas, error } = await supabase
    .from("facturas")
    .select("cliente_id, monto_facturado, monto_pagado, saldo_pendiente, fecha_vencimiento");
  if (error) throw new Error(`Error al leer facturas: ${error.message}`);

  const hoy = new Date();
  const todasLasFacturas = facturas ?? [];

  const porCliente = new Map<string, { facturado: number; pagado: number }>();
  for (const f of todasLasFacturas) {
    const actual = porCliente.get(f.cliente_id) ?? { facturado: 0, pagado: 0 };
    actual.facturado += Number(f.monto_facturado);
    actual.pagado += Number(f.monto_pagado);
    porCliente.set(f.cliente_id, actual);
  }

  const tasasPorCliente = [...porCliente.values()]
    .filter((c) => c.facturado > 0)
    .map((c) => (c.pagado / c.facturado) * 100);

  const promedioPorCliente =
    tasasPorCliente.length > 0
      ? tasasPorCliente.reduce((suma, t) => suma + t, 0) / tasasPorCliente.length
      : null;

  const clientesQueAlcanzaronMeta = tasasPorCliente.filter(
    (t) => t >= META_RECUPERACION_PORCENTAJE
  ).length;

  const facturasPendientes = todasLasFacturas.filter((f) => Number(f.saldo_pendiente) > 0);
  const totalCartera = facturasPendientes.reduce((suma, f) => suma + Number(f.saldo_pendiente), 0);

  const facturasVencidas = facturasPendientes.filter(
    (f) => calcularDiasAtraso(f.fecha_vencimiento, hoy) > 0
  );
  const totalVencido = facturasVencidas.reduce((suma, f) => suma + Number(f.saldo_pendiente), 0);
  const porcentajeVencido = totalCartera > 0 ? (totalVencido / totalCartera) * 100 : null;

  const diasPromedioAtrasoActual =
    facturasVencidas.length > 0
      ? facturasVencidas.reduce((suma, f) => suma + calcularDiasAtraso(f.fecha_vencimiento, hoy), 0) /
        facturasVencidas.length
      : null;

  return {
    tasaRecuperacion: {
      promedioPorCliente,
      clientesQueAlcanzaronMeta,
      totalClientesConDeuda: tasasPorCliente.length,
    },
    diasPromedioAtrasoActual,
    carteraVencida: {
      porcentaje: porcentajeVencido,
      totalCartera,
      totalVencido,
    },
  };
}
