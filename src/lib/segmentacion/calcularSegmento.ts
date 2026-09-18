import {
  NIVEL_MONTO_MAXIMO,
  NIVEL_RIESGO_MAXIMO,
  UMBRALES_DIAS_ATRASO,
  UMBRALES_MONTO,
  UMBRAL_ALTO_VALOR,
} from "@/config/segmentacion";
import type { Cliente, Factura, NivelMonto, NivelRiesgo, SegmentoCliente } from "@/types/cobranza";

/**
 * Días transcurridos desde `fechaVencimiento` hasta `hoy` (0 si todavía no
 * vence). Todo se ancla a UTC a propósito: una fecha-only ISO ("2026-08-01")
 * ya se parsea como medianoche UTC de ese día; si acá se le sacaran los
 * componentes con getters locales (getFullYear/getMonth/getDate) en un huso
 * negativo, se lee un día antes (bug real que esto corrige). Usar getUTC*
 * en ambos lados evita ese corrimiento sin importar el huso del servidor.
 */
export function calcularDiasAtraso(fechaVencimiento: string, hoy: Date = new Date()): number {
  const inicioVencimiento = new Date(fechaVencimiento).getTime();
  const inicioHoy = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate());
  const dias = Math.round((inicioHoy - inicioVencimiento) / 86_400_000);
  return Math.max(dias, 0);
}

/** Nivel de riesgo según días de atraso (PRD 7.1). */
export function calcularNivelRiesgoPorDias(diasAtraso: number): NivelRiesgo {
  for (const { hasta, nivel } of UMBRALES_DIAS_ATRASO) {
    if (diasAtraso <= hasta) return nivel;
  }
  return NIVEL_RIESGO_MAXIMO;
}

/** Nivel de monto según el saldo pendiente total del cliente (PRD 7.2). */
export function calcularNivelMonto(saldoPendienteTotal: number): NivelMonto {
  for (const { hasta, nivel } of UMBRALES_MONTO) {
    if (saldoPendienteTotal <= hasta) return nivel;
  }
  return NIVEL_MONTO_MAXIMO;
}

/** Cliente de alto valor: antigüedad O volumen de negocio por encima del umbral (PRD 7.3). */
export function esClienteAltoValor(cliente: Cliente): boolean {
  const antiguedad = cliente.antiguedadClienteMeses ?? 0;
  const volumen = cliente.volumenNegocio ?? 0;
  return (
    antiguedad >= UMBRAL_ALTO_VALOR.antiguedadMinimaMeses ||
    volumen >= UMBRAL_ALTO_VALOR.volumenNegocioMinimo
  );
}

/** Entre las facturas con saldo pendiente, la de vencimiento más antiguo (la más urgente). */
export function obtenerFacturaMasAntigua(facturas: Factura[]): Factura | null {
  const pendientes = facturas.filter((f) => f.saldoPendiente > 0);
  if (pendientes.length === 0) return null;

  return pendientes.reduce((masAntigua, actual) =>
    new Date(actual.fechaVencimiento) < new Date(masAntigua.fechaVencimiento) ? actual : masAntigua
  );
}

/**
 * Segmenta a un cliente combinando los tres criterios del PRD (sección 7):
 * días de atraso de su factura más antigua sin pagar, saldo total pendiente,
 * y si es cliente de alto valor. La combinación final en un escenario de
 * cobranza la hace el motor de recomendación (sección 8 del PRD).
 */
export function calcularSegmentoCliente(
  cliente: Cliente,
  facturas: Factura[],
  hoy: Date = new Date()
): SegmentoCliente {
  const facturaMasAntigua = obtenerFacturaMasAntigua(facturas);
  const diasAtraso = facturaMasAntigua ? calcularDiasAtraso(facturaMasAntigua.fechaVencimiento, hoy) : 0;
  const saldoPendienteTotal = facturas.reduce((suma, f) => suma + f.saldoPendiente, 0);

  return {
    nivelRiesgo: calcularNivelRiesgoPorDias(diasAtraso),
    nivelMonto: calcularNivelMonto(saldoPendienteTotal),
    esAltoValor: esClienteAltoValor(cliente),
    diasAtraso,
    saldoPendienteTotal,
  };
}
