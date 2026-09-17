import { Resend } from "resend";

/**
 * Cliente de Resend para envío de correos transaccionales (ver PRD sección 9).
 * Requiere RESEND_API_KEY en las variables de entorno.
 */
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error("Falta RESEND_API_KEY en las variables de entorno.");
}

export const resend = new Resend(resendApiKey);

/**
 * Dominio de pruebas de Resend: funciona sin verificar ningún dominio propio,
 * pero solo debe usarse en desarrollo. Reemplazar por un remitente del dominio
 * propio de la empresa, ya verificado en Resend, antes de pasar a producción.
 */
const FROM_ADDRESS = "onboarding@resend.dev";

/** Envía un correo transaccional vía Resend. */
export async function sendEmail(to: string, subject: string, html: string) {
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Error al enviar correo vía Resend: ${error.message}`);
  }

  return data;
}
