/** Tipos de dominio para segmentación de morosidad y comunicaciones de cobranza (PRD secciones 7-9). */

/** Nivel de riesgo de morosidad según días de atraso (PRD 7.1). */
export type NivelRiesgo = "bajo" | "medio" | "alto" | "critico";

/**
 * Escenario de cobranza al que corresponde una plantilla de correo.
 * "negociacion_alto_valor" aplica a clientes de alto valor (antigüedad/volumen)
 * independientemente de su nivel de riesgo (PRD 8, fila "Cliente de alto valor").
 */
export type EscenarioCobranza =
  | "recordatorio_preventivo"
  | "recordatorio_plan_pago"
  | "negociacion_fraccionamiento"
  | "negociacion_prioritaria"
  | "negociacion_alto_valor";

/** Variables dinámicas disponibles para interpolar en una plantilla de correo (PRD 9). */
export interface VariablesCorreo {
  nombreCliente: string;
  montoAdeudado: string;
  diasAtraso: number;
  fechaVencimiento: string;
  numeroFactura?: string;
  condicionesPlanPago?: string;
  nombreAgente?: string;
}

/**
 * Plantilla de correo editable por escenario (RF-07). El contenido vive en
 * la tabla `plantillas_correo` de Supabase, no en código — se lee con
 * `obtenerPlantilla()` en `src/lib/correo`.
 */
export interface PlantillaCorreo {
  id: string;
  escenario: EscenarioCobranza;
  nombre: string;
  descripcion: string | null;
  asunto: string;
  cuerpo: string;
  activa: boolean;
}
