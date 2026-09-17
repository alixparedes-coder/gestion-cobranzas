"use server";

import { redirect } from "next/navigation";
import { crearClienteSupabaseServidor } from "@/lib/supabaseServidor";

/** Server Action del formulario de login. Las cuentas se crean manualmente (sin registro público). */
export async function iniciarSesion(
  _estadoPrevio: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const correo = String(formData.get("correo") ?? "").trim();
  const contrasena = String(formData.get("contrasena") ?? "");

  if (!correo || !contrasena) {
    return "Ingresa tu correo y contraseña.";
  }

  const supabase = await crearClienteSupabaseServidor();
  const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });

  if (error) {
    return "Correo o contraseña incorrectos.";
  }

  redirect("/panel");
}
