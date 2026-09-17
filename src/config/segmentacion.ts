import type { NivelMonto, NivelRiesgo } from "@/types/cobranza";

/**
 * Umbrales de segmentación de morosidad (PRD sección 7). Parametrizables sin
 * tocar el motor (RF-04/RNF-04). Los de monto y "alto valor" son valores de
 * partida — deben ajustarse con el negocio una vez cargada la cartera real
 * (ver PRD 6.1: volumen/distribución real todavía por validar).
 */

/** Días de atraso → nivel de riesgo (PRD 7.1). Recorridos en orden ascendente. */
export const UMBRALES_DIAS_ATRASO: ReadonlyArray<{ hasta: number; nivel: NivelRiesgo }> = [
  { hasta: 0, nivel: "sin_riesgo" },
  { hasta: 15, nivel: "bajo" },
  { hasta: 45, nivel: "medio" },
  { hasta: 90, nivel: "alto" },
];
/** Más de 90 días de atraso → "critico" (no tiene límite superior en la lista). */
export const NIVEL_RIESGO_MAXIMO: NivelRiesgo = "critico";

/** Saldo pendiente del cliente → nivel de monto (PRD 7.2). */
export const UMBRALES_MONTO: ReadonlyArray<{ hasta: number; nivel: NivelMonto }> = [
  { hasta: 5000, nivel: "bajo" },
  { hasta: 20000, nivel: "medio" },
];
/** Más del último umbral → "alto". */
export const NIVEL_MONTO_MAXIMO: NivelMonto = "alto";

/** Criterios para considerar a un cliente de "alto valor" (PRD 7.3): antigüedad O volumen de negocio. */
export const UMBRAL_ALTO_VALOR = {
  antiguedadMinimaMeses: 36,
  volumenNegocioMinimo: 50000,
};
