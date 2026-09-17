import { getSupabaseAdmin } from "@/lib/supabase";
import type { EscenarioCobranza, PlantillaCorreo } from "@/types/cobranza";

/**
 * Lee de Supabase (tabla `plantillas_correo`) la plantilla activa de un
 * escenario de cobranza. Usa el cliente admin porque el envío de correos es
 * un proceso de servidor (no hay sesión de usuario en ese contexto).
 */
export async function obtenerPlantilla(escenario: EscenarioCobranza): Promise<PlantillaCorreo> {
  const { data, error } = await getSupabaseAdmin()
    .from("plantillas_correo")
    .select("id, escenario, nombre, descripcion, asunto, cuerpo, activa")
    .eq("escenario", escenario)
    .eq("activa", true)
    .single();

  if (error || !data) {
    throw new Error(`No se encontró una plantilla activa para el escenario "${escenario}".`);
  }

  return data;
}
