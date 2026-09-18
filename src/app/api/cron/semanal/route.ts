import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { procesarEnviosAutomaticos } from "@/lib/correo/procesarEnviosAutomaticos";

/**
 * Job semanal (Vercel Cron, ver vercel.json): genera la foto de saldo de la
 * semana (para la comparación de recuperación) y corre el envío automático
 * de correos. No requiere sesión de usuario — Vercel firma la petición con
 * `Authorization: Bearer <CRON_SECRET>`, que se verifica acá en vez de usar
 * el chequeo de sesión que usan las rutas que sí llama un usuario logueado.
 */
export async function GET(request: Request) {
  const autorizacion = request.headers.get("authorization");
  if (autorizacion !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { error: errorSnapshot } = await supabase.rpc("crear_snapshot_saldo_cliente");
  if (errorSnapshot) {
    return NextResponse.json(
      { error: `Error al crear el snapshot semanal: ${errorSnapshot.message}` },
      { status: 500 }
    );
  }

  const resultados = await procesarEnviosAutomaticos();

  return NextResponse.json({ snapshot: "ok", resultados });
}
