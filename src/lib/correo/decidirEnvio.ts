import { calcularSegmentoCliente, obtenerFacturaMasAntigua } from "@/lib/segmentacion/calcularSegmento";
import { recomendarAccion } from "@/lib/recomendacion/recomendarAccion";
import type { Cliente, DecisionEnvio, Factura } from "@/types/cobranza";

/**
 * Decide qué hacer con un cliente en una corrida de envío automático:
 * segmentarlo, recomendar la acción, y aplicar las reglas de la sección 9
 * del PRD (RF-12: envío deshabilitado; necesita correo; no reenviar si ya
 * se envió algo recientemente). Función pura — no lee ni escribe nada, así
 * se puede probar sin Supabase ni Resend. La ejecución real vive en
 * `procesarEnviosAutomaticos()`.
 */
export function decidirEnvioParaCliente(
  cliente: Cliente,
  facturas: Factura[],
  yaEnvioReciente: boolean,
  hoy: Date = new Date()
): DecisionEnvio {
  const segmento = calcularSegmentoCliente(cliente, facturas, hoy);
  const { escenario } = recomendarAccion(segmento);

  if (!escenario) return { tipo: "sin_accion" };
  if (!cliente.envioAutomaticoHabilitado) return { tipo: "omitido_envio_deshabilitado", escenario };
  if (!cliente.correo) return { tipo: "omitido_sin_correo", escenario };
  if (yaEnvioReciente) return { tipo: "omitido_reciente", escenario };

  return {
    tipo: "enviar",
    escenario,
    segmento,
    facturaMasAntigua: obtenerFacturaMasAntigua(facturas),
  };
}
