import { META_RECUPERACION_PORCENTAJE, obtenerKpis } from "@/lib/kpis/obtenerKpis";
import { formatearMoneda } from "@/components/panel/estilosRiesgo";

function formatearPorcentaje(valor: number | null): string {
  return valor === null ? "—" : `${valor.toFixed(1)}%`;
}

export default async function PaginaKpis() {
  const kpis = await obtenerKpis();

  const colorRecuperacion =
    kpis.tasaRecuperacion.promedioPorCliente === null
      ? "text-slate-400"
      : kpis.tasaRecuperacion.promedioPorCliente >= META_RECUPERACION_PORCENTAJE
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-amber-600 dark:text-amber-400";

  const colorVencida =
    kpis.carteraVencida.porcentaje === null
      ? "text-slate-400"
      : kpis.carteraVencida.porcentaje >= 50
        ? "text-red-600 dark:text-red-400"
        : kpis.carteraVencida.porcentaje >= 20
          ? "text-amber-600 dark:text-amber-400"
          : "text-emerald-600 dark:text-emerald-400";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">KPIs</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Indicadores de la cartera (PRD sección 11).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Tasa de recuperación (promedio por cliente)</p>
          <p className={`mt-2 text-3xl font-semibold tabular-nums ${colorRecuperacion}`}>
            {formatearPorcentaje(kpis.tasaRecuperacion.promedioPorCliente)}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Meta: {META_RECUPERACION_PORCENTAJE}% por cliente · {kpis.tasaRecuperacion.clientesQueAlcanzaronMeta} de{" "}
            {kpis.tasaRecuperacion.totalClientesConDeuda} clientes ya la alcanzaron
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">% de cartera vencida</p>
          <p className={`mt-2 text-3xl font-semibold tabular-nums ${colorVencida}`}>
            {formatearPorcentaje(kpis.carteraVencida.porcentaje)}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {formatearMoneda(kpis.carteraVencida.totalVencido)} vencido de {formatearMoneda(kpis.carteraVencida.totalCartera)}{" "}
            en cartera
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Días promedio de atraso (cartera vencida actual)</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
            {kpis.diasPromedioAtrasoActual === null ? "—" : Math.round(kpis.diasPromedioAtrasoActual)}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            No hay historial de fechas de pago (PRD 6.3): es el atraso promedio de lo vencido hoy, no un
            promedio histórico de tiempo hasta el pago.
          </p>
        </div>
      </div>
    </div>
  );
}
