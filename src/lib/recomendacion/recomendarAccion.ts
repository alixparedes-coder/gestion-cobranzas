import type { RecomendacionAccion, SegmentoCliente } from "@/types/cobranza";

/**
 * Recomienda el escenario de cobranza para un cliente ya segmentado (PRD
 * sección 8). El mapeo segmento → escenario no depende de configuración
 * externa porque son 5 casos fijos del PRD, no umbrales de negocio; los
 * umbrales que sí varían (días de atraso, monto, alto valor) ya se
 * aplicaron en el motor de segmentación.
 *
 * Reglas, en orden:
 * 1. Sin atraso (`sin_riesgo`) → no hay nada que cobrar, `escenario: null`.
 * 2. Cliente de alto valor → negociación personalizada, sin importar el
 *    nivel de riesgo (PRD 8, fila "Cliente de alto valor").
 * 3. Si no, el escenario estándar según nivel de riesgo.
 *
 * `requiereAtencionManual` se activa solo con riesgo crítico, sin importar
 * qué escenario terminó eligiéndose — es una señal de urgencia, no de
 * plantilla.
 */
export function recomendarAccion(segmento: SegmentoCliente): RecomendacionAccion {
  const requiereAtencionManual = segmento.nivelRiesgo === "critico";

  if (segmento.nivelRiesgo === "sin_riesgo") {
    return { escenario: null, requiereAtencionManual: false };
  }

  if (segmento.esAltoValor) {
    return { escenario: "negociacion_alto_valor", requiereAtencionManual };
  }

  switch (segmento.nivelRiesgo) {
    case "bajo":
      return { escenario: "recordatorio_preventivo", requiereAtencionManual };
    case "medio":
      return { escenario: "recordatorio_plan_pago", requiereAtencionManual };
    case "alto":
      return { escenario: "negociacion_fraccionamiento", requiereAtencionManual };
    case "critico":
      return { escenario: "negociacion_prioritaria", requiereAtencionManual };
  }
}
