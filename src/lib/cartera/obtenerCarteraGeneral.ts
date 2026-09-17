import { crearClienteSupabaseServidor } from "@/lib/supabaseServidor";
import { calcularSegmentoCliente } from "@/lib/segmentacion/calcularSegmento";
import type { Cliente, Factura, NivelMonto, NivelRiesgo } from "@/types/cobranza";

export interface UltimaGestion {
  tipo: string;
  resultado: string | null;
  fecha: string;
}

export interface FilaCarteraGeneral {
  clienteId: string;
  nombre: string;
  nivelRiesgo: NivelRiesgo;
  nivelMonto: NivelMonto;
  esAltoValor: boolean;
  diasAtraso: number;
  saldoPendienteTotal: number;
  ultimaGestion: UltimaGestion | null;
}

/**
 * Cartera general para la vista de dashboard (PRD 10.1): cada cliente con
 * su segmento ya calculado, saldo pendiente, días de atraso y última
 * gestión. Usa el cliente de Supabase consciente de sesión (respeta RLS
 * según quién esté logueado).
 */
export async function obtenerCarteraGeneral(): Promise<FilaCarteraGeneral[]> {
  const supabase = await crearClienteSupabaseServidor();

  const { data: clientesDb, error: errorClientes } = await supabase
    .from("clientes")
    .select("id, codigo_externo, nombre, antiguedad_cliente_meses, volumen_negocio");
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

  const { data: gestionesDb, error: errorGestiones } = await supabase
    .from("gestiones")
    .select("cliente_id, tipo, resultado, fecha")
    .order("fecha", { ascending: false });
  if (errorGestiones) {
    throw new Error(`Error al leer gestiones: ${errorGestiones.message}`);
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

  // gestionesDb ya viene ordenado por fecha descendente: la primera vez que
  // aparece un cliente_id es su gestión más reciente.
  const ultimaGestionPorCliente = new Map<string, UltimaGestion>();
  for (const g of gestionesDb ?? []) {
    if (!ultimaGestionPorCliente.has(g.cliente_id)) {
      ultimaGestionPorCliente.set(g.cliente_id, { tipo: g.tipo, resultado: g.resultado, fecha: g.fecha });
    }
  }

  return clientesDb.map((c) => {
    const cliente: Cliente = {
      id: c.id,
      codigoExterno: c.codigo_externo,
      nombre: c.nombre,
      antiguedadClienteMeses: c.antiguedad_cliente_meses,
      volumenNegocio: c.volumen_negocio,
    };
    const facturas = facturasPorCliente.get(c.id) ?? [];
    const segmento = calcularSegmentoCliente(cliente, facturas);

    return {
      clienteId: c.id,
      nombre: c.nombre,
      nivelRiesgo: segmento.nivelRiesgo,
      nivelMonto: segmento.nivelMonto,
      esAltoValor: segmento.esAltoValor,
      diasAtraso: segmento.diasAtraso,
      saldoPendienteTotal: segmento.saldoPendienteTotal,
      ultimaGestion: ultimaGestionPorCliente.get(c.id) ?? null,
    };
  });
}
