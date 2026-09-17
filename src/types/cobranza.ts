/** Tipos de dominio para segmentación de morosidad y comunicaciones de cobranza (PRD secciones 7-9). */

/** Nivel de riesgo de morosidad según días de atraso (PRD 7.1). */
export type NivelRiesgo = "sin_riesgo" | "bajo" | "medio" | "alto" | "critico";

/** Nivel de monto adeudado (PRD 7.2). */
export type NivelMonto = "bajo" | "medio" | "alto";

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

/** Cliente de la cartera (tabla `clientes` de Supabase). */
export interface Cliente {
  id: string;
  codigoExterno: string;
  nombre: string;
  antiguedadClienteMeses: number | null;
  volumenNegocio: number | null;
  correo?: string | null;
  analistaAsignado?: string | null;
  /** RF-12: permite deshabilitar el envío automático de correo para este cliente. */
  envioAutomaticoHabilitado?: boolean;
}

/** Factura/saldo pendiente de un cliente (tabla `facturas`). Un cliente puede tener varias a la vez. */
export interface Factura {
  id: string;
  clienteId: string;
  saldoPendiente: number;
  /** Fecha ISO (YYYY-MM-DD). */
  fechaVencimiento: string;
  numeroFactura?: string | null;
}

/** Resultado de aplicar los tres criterios de segmentación del PRD (sección 7) a un cliente. */
export interface SegmentoCliente {
  nivelRiesgo: NivelRiesgo;
  nivelMonto: NivelMonto;
  esAltoValor: boolean;
  diasAtraso: number;
  saldoPendienteTotal: number;
}

/**
 * Acción de cobranza recomendada para un cliente según su segmento (PRD
 * sección 8). `escenario` es `null` cuando el cliente no tiene atraso (nada
 * que cobrar). `requiereAtencionManual` marca los casos de riesgo crítico
 * para que el agente los revise (sin escalamiento automático a legal/
 * supervisor en v1, ver PRD 4.2).
 */
export interface RecomendacionAccion {
  escenario: EscenarioCobranza | null;
  requiereAtencionManual: boolean;
}

/**
 * Qué hacer con un cliente en una corrida de envío automático de correos
 * (PRD sección 9). Separado de la ejecución (leer Supabase, enviar el
 * correo) para poder probar la decisión sin tocar servicios externos.
 */
export type DecisionEnvio =
  | { tipo: "sin_accion" }
  | { tipo: "omitido_envio_deshabilitado"; escenario: EscenarioCobranza }
  | { tipo: "omitido_sin_correo"; escenario: EscenarioCobranza }
  | { tipo: "omitido_reciente"; escenario: EscenarioCobranza }
  | {
      tipo: "enviar";
      escenario: EscenarioCobranza;
      segmento: SegmentoCliente;
      facturaMasAntigua: Factura | null;
    };
