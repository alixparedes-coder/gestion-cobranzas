import Link from "next/link";
import { obtenerDetalleCliente } from "@/lib/cartera/obtenerDetalleCliente";
import { alternarEnvioAutomatico } from "@/app/panel/clientes/[id]/actions";
import {
  ESTILO_BADGE_RIESGO,
  ETIQUETA_ESCENARIO,
  ETIQUETA_GESTION,
  ETIQUETA_RIESGO,
  formatearFecha,
  formatearMoneda,
} from "@/components/panel/estilosRiesgo";

export default async function PaginaDetalleCliente(props: PageProps<"/panel/clientes/[id]">) {
  const { id } = await props.params;
  const cliente = await obtenerDetalleCliente(id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/panel" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          ← Volver a la cartera
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{cliente.nombre}</h1>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTILO_BADGE_RIESGO[cliente.segmento.nivelRiesgo]}`}>
            {ETIQUETA_RIESGO[cliente.segmento.nivelRiesgo]}
          </span>
          {cliente.segmento.esAltoValor && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
              Alto valor
            </span>
          )}
          {cliente.recomendacion.requiereAtencionManual && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
              Requiere atención manual
            </span>
          )}
          {!cliente.envioAutomaticoHabilitado && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              Envío automático deshabilitado
            </span>
          )}
        </div>

        <form
          action={alternarEnvioAutomatico.bind(null, cliente.id, cliente.envioAutomaticoHabilitado)}
          className="mt-3"
        >
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            {cliente.envioAutomaticoHabilitado ? "Deshabilitar envío automático" : "Habilitar envío automático"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { etiqueta: "Saldo pendiente", valor: formatearMoneda(cliente.segmento.saldoPendienteTotal) },
          { etiqueta: "Días de atraso", valor: String(cliente.segmento.diasAtraso) },
          {
            etiqueta: "Próxima acción",
            valor: cliente.recomendacion.escenario
              ? ETIQUETA_ESCENARIO[cliente.recomendacion.escenario]
              : "Ninguna (sin atraso)",
          },
          { etiqueta: "Código", valor: cliente.codigoExterno },
        ].map(({ etiqueta, valor }) => (
          <div key={etiqueta} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">{etiqueta}</p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">{valor}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 p-4 text-sm sm:grid-cols-3 dark:border-slate-800">
        <DatoCliente etiqueta="NIT" valor={cliente.nit} />
        <DatoCliente etiqueta="Correo" valor={cliente.correo} />
        <DatoCliente etiqueta="Teléfono" valor={cliente.telefono} />
        <DatoCliente etiqueta="Tipo de servicio" valor={cliente.tipoServicio} />
        <DatoCliente etiqueta="Días de crédito" valor={cliente.diasCredito?.toString() ?? null} />
        <DatoCliente etiqueta="Volumen de negocio" valor={cliente.volumenNegocio ? formatearMoneda(cliente.volumenNegocio) : null} />
        <DatoCliente etiqueta="Antigüedad" valor={cliente.antiguedadClienteMeses ? `${cliente.antiguedadClienteMeses} meses` : null} />
        <DatoCliente etiqueta="Analista asignado" valor={cliente.analistaAsignado} />
      </div>

      <section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Facturas</h2>
        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <th className="px-4 py-2">Número</th>
                <th className="px-4 py-2 text-right">Facturado</th>
                <th className="px-4 py-2 text-right">Pagado</th>
                <th className="px-4 py-2 text-right">Saldo pendiente</th>
                <th className="px-4 py-2">Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {cliente.facturas.map((f) => (
                <tr key={f.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="px-4 py-2 text-slate-900 dark:text-slate-50">{f.numeroFactura ?? "—"}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatearMoneda(f.montoFacturado)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatearMoneda(f.montoPagado)}</td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">{formatearMoneda(f.saldoPendiente)}</td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{formatearFecha(f.fechaVencimiento)}</td>
                </tr>
              ))}
              {cliente.facturas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Sin facturas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Historial de gestiones</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {cliente.gestiones.map((g) => (
            <li key={g.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-slate-900 dark:text-slate-50">
                  {ETIQUETA_GESTION[g.tipo] ?? g.tipo}
                  {g.plantilla && <span className="text-slate-500 dark:text-slate-400"> · {g.plantilla.nombre}</span>}
                </span>
                <span className="text-xs text-slate-400">{formatearFecha(g.fecha)}</span>
              </div>
              {g.resultado && <p className="mt-1 text-slate-600 dark:text-slate-400">{g.resultado}</p>}
              {g.detalle && <p className="mt-1 text-slate-600 dark:text-slate-400">{g.detalle}</p>}
              {g.registradoPor && (
                <p className="mt-1 text-xs text-slate-400">Registrado por {g.registradoPor.nombre}</p>
              )}
            </li>
          ))}
          {cliente.gestiones.length === 0 && (
            <li className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-400 dark:border-slate-700">
              Sin gestiones registradas todavía.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

function DatoCliente({ etiqueta, valor }: { etiqueta: string; valor: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{etiqueta}</p>
      <p className="mt-0.5 text-slate-900 dark:text-slate-50">{valor ?? "—"}</p>
    </div>
  );
}
