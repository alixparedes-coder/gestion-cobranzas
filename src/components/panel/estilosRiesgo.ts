import type { NivelRiesgo } from "@/types/cobranza";

export const ETIQUETA_RIESGO: Record<NivelRiesgo, string> = {
  sin_riesgo: "Sin riesgo",
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
  critico: "Crítico",
};

export const ESTILO_BADGE_RIESGO: Record<NivelRiesgo, string> = {
  sin_riesgo: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  bajo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  medio: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400",
  alto: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400",
  critico: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export const ETIQUETA_GESTION: Record<string, string> = {
  correo_automatico: "Correo automático",
  llamada_manual: "Llamada manual",
  negociacion: "Negociación",
  pago_registrado: "Pago registrado",
  otro: "Otro",
};

export const ETIQUETA_ESCENARIO: Record<string, string> = {
  recordatorio_preventivo: "Recordatorio preventivo",
  recordatorio_plan_pago: "Recordatorio + plan de pago",
  negociacion_fraccionamiento: "Negociación de fraccionamiento",
  negociacion_prioritaria: "Negociación prioritaria",
  negociacion_alto_valor: "Negociación (alto valor)",
};

export function formatearMoneda(monto: number): string {
  return monto.toLocaleString("es-EC", { style: "currency", currency: "USD" });
}

/**
 * `new Date("2026-08-01")` se interpreta como medianoche UTC; sin fijar la
 * zona horaria al formatear, un huso negativo (América) la muestra un día
 * antes. Se fuerza UTC para que las fechas puras (fecha_vencimiento) no se
 * corran de día.
 */
export function formatearFecha(fechaIso: string): string {
  return new Date(fechaIso).toLocaleDateString("es-EC", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
