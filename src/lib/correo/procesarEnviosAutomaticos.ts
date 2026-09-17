import { getSupabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/resend";
import { decidirEnvioParaCliente } from "@/lib/correo/decidirEnvio";
import { obtenerPlantilla } from "@/lib/correo/obtenerPlantilla";
import { renderizarPlantilla } from "@/lib/correo/renderizarPlantilla";
import type { Cliente, Factura, VariablesCorreo } from "@/types/cobranza";

/** Ventana mínima entre dos correos automáticos al mismo cliente (PRD 17: evitar correos percibidos como agresivos). */
const DIAS_SIN_REENVIAR = 6;

export interface ResultadoClienteEnvio {
  clienteId: string;
  codigoExterno: string;
  estado: "enviado" | "omitido_envio_deshabilitado" | "omitido_sin_correo" | "omitido_reciente" | "sin_accion" | "error";
  escenario?: string;
  detalle?: string;
}

/** Punto de inyección para pruebas: reemplazar por un stub evita enviar correos reales. */
export interface DependenciasEnvio {
  obtenerPlantilla: typeof obtenerPlantilla;
  enviarCorreo: (destinatario: string, asunto: string, cuerpo: string) => Promise<unknown>;
}

const DEPENDENCIAS_REALES: DependenciasEnvio = {
  obtenerPlantilla,
  enviarCorreo: sendEmail,
};

function formatearMoneda(monto: number): string {
  return monto.toLocaleString("es-EC", { style: "currency", currency: "USD" });
}

/**
 * Corre el envío automático de correos de cobranza sobre toda la cartera
 * (PRD sección 9): para cada cliente con facturas pendientes, decide qué
 * hacer (`decidirEnvioParaCliente`) y, si corresponde enviar, obtiene la
 * plantilla del escenario, la renderiza y la envía. Registra cada
 * resultado en `gestiones` (RF-08), incluyendo los casos omitidos.
 *
 * Pensado para correr una vez por ciclo de importación (semanal); no hay
 * todavía un disparador (cron) que lo llame automáticamente.
 */
export async function procesarEnviosAutomaticos(
  dependencias: DependenciasEnvio = DEPENDENCIAS_REALES
): Promise<ResultadoClienteEnvio[]> {
  const supabase = getSupabaseAdmin();
  const resultados: ResultadoClienteEnvio[] = [];

  const { data: clientesDb, error: errorClientes } = await supabase
    .from("clientes")
    .select(
      "id, codigo_externo, nombre, correo, analista_asignado, antiguedad_cliente_meses, volumen_negocio, envio_automatico_habilitado"
    );
  if (errorClientes || !clientesDb) {
    throw new Error(`Error al leer clientes: ${errorClientes?.message}`);
  }

  const { data: facturasDb, error: errorFacturas } = await supabase
    .from("facturas")
    .select("id, cliente_id, numero_factura, saldo_pendiente, fecha_vencimiento")
    .gt("saldo_pendiente", 0);
  if (errorFacturas || !facturasDb) {
    throw new Error(`Error al leer facturas: ${errorFacturas?.message}`);
  }

  const facturasPorCliente = new Map<string, Factura[]>();
  for (const f of facturasDb) {
    const lista = facturasPorCliente.get(f.cliente_id) ?? [];
    lista.push({
      id: f.id,
      clienteId: f.cliente_id,
      numeroFactura: f.numero_factura,
      saldoPendiente: Number(f.saldo_pendiente),
      fechaVencimiento: f.fecha_vencimiento,
    });
    facturasPorCliente.set(f.cliente_id, lista);
  }

  const desdeReciente = new Date();
  desdeReciente.setDate(desdeReciente.getDate() - DIAS_SIN_REENVIAR);

  for (const c of clientesDb) {
    const cliente: Cliente = {
      id: c.id,
      codigoExterno: c.codigo_externo,
      nombre: c.nombre,
      correo: c.correo,
      analistaAsignado: c.analista_asignado,
      antiguedadClienteMeses: c.antiguedad_cliente_meses,
      volumenNegocio: c.volumen_negocio,
      envioAutomaticoHabilitado: c.envio_automatico_habilitado,
    };
    const facturasCliente = facturasPorCliente.get(c.id) ?? [];

    const { count } = await supabase
      .from("gestiones")
      .select("id", { count: "exact", head: true })
      .eq("cliente_id", c.id)
      .eq("tipo", "correo_automatico")
      .gte("fecha", desdeReciente.toISOString());
    const yaEnvioReciente = (count ?? 0) > 0;

    const decision = decidirEnvioParaCliente(cliente, facturasCliente, yaEnvioReciente);

    if (decision.tipo === "sin_accion") {
      resultados.push({ clienteId: c.id, codigoExterno: c.codigo_externo, estado: "sin_accion" });
      continue;
    }

    if (decision.tipo === "omitido_envio_deshabilitado" || decision.tipo === "omitido_sin_correo") {
      const mensaje =
        decision.tipo === "omitido_envio_deshabilitado"
          ? "Envío automático deshabilitado para este cliente (RF-12)."
          : "El cliente no tiene correo registrado.";
      await supabase.from("gestiones").insert({
        cliente_id: c.id,
        tipo: "correo_automatico",
        resultado: `omitido: ${mensaje}`,
      });
      resultados.push({
        clienteId: c.id,
        codigoExterno: c.codigo_externo,
        estado: decision.tipo,
        escenario: decision.escenario,
      });
      continue;
    }

    if (decision.tipo === "omitido_reciente") {
      resultados.push({
        clienteId: c.id,
        codigoExterno: c.codigo_externo,
        estado: "omitido_reciente",
        escenario: decision.escenario,
      });
      continue;
    }

    try {
      const plantilla = await dependencias.obtenerPlantilla(decision.escenario);
      const variables: VariablesCorreo = {
        nombreCliente: cliente.nombre,
        montoAdeudado: formatearMoneda(decision.segmento.saldoPendienteTotal),
        diasAtraso: decision.segmento.diasAtraso,
        fechaVencimiento: decision.facturaMasAntigua?.fechaVencimiento ?? "",
        numeroFactura: decision.facturaMasAntigua?.numeroFactura ?? undefined,
        nombreAgente: cliente.analistaAsignado ?? "Equipo de Cobranzas",
      };
      const { asunto, cuerpo } = renderizarPlantilla(plantilla, variables);
      await dependencias.enviarCorreo(cliente.correo!, asunto, cuerpo);

      await supabase.from("gestiones").insert({
        cliente_id: c.id,
        factura_id: decision.facturaMasAntigua?.id ?? null,
        tipo: "correo_automatico",
        plantilla_id: plantilla.id,
        resultado: "enviado",
      });
      resultados.push({ clienteId: c.id, codigoExterno: c.codigo_externo, estado: "enviado", escenario: decision.escenario });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      await supabase.from("gestiones").insert({
        cliente_id: c.id,
        tipo: "correo_automatico",
        resultado: `error: ${mensaje}`,
      });
      resultados.push({
        clienteId: c.id,
        codigoExterno: c.codigo_externo,
        estado: "error",
        escenario: decision.escenario,
        detalle: mensaje,
      });
    }
  }

  return resultados;
}
