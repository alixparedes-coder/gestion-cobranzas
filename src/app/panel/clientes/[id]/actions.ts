"use server";

import { revalidatePath } from "next/cache";
import { crearClienteSupabaseServidor } from "@/lib/supabaseServidor";

/** RF-12: habilita/deshabilita el envío automático de correo para un cliente. */
export async function alternarEnvioAutomatico(clienteId: string, valorActual: boolean) {
  const supabase = await crearClienteSupabaseServidor();
  const { error } = await supabase
    .from("clientes")
    .update({ envio_automatico_habilitado: !valorActual })
    .eq("id", clienteId);

  if (error) throw new Error(`Error al actualizar el cliente: ${error.message}`);

  revalidatePath(`/panel/clientes/${clienteId}`);
  revalidatePath("/panel");
}
