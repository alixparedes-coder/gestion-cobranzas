import { NextResponse } from "next/server";
import { procesarEnviosAutomaticos } from "@/lib/correo/procesarEnviosAutomaticos";

/**
 * Corre el envío automático de correos de cobranza sobre toda la cartera
 * (PRD sección 9). Pensado para llamarse una vez por ciclo de importación
 * semanal; todavía no hay un cron que lo dispare solo (paso 6 pendiente).
 */
export async function POST() {
  const resultados = await procesarEnviosAutomaticos();
  return NextResponse.json({ resultados });
}
