"use server";

import { redirect } from "next/navigation";
import { crearClienteSupabaseServidor } from "@/lib/supabaseServidor";

export async function cerrarSesion() {
  const supabase = await crearClienteSupabaseServidor();
  await supabase.auth.signOut();
  redirect("/login");
}
