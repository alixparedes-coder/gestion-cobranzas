const KPIS = [
  {
    label: "Tasa de recuperación de cartera",
    description:
      "Porcentaje de la deuda morosa efectivamente recuperada en un período determinado.",
  },
  {
    label: "Días promedio de mora",
    description:
      "Tiempo promedio que tardan los clientes en pagar después del vencimiento.",
  },
  {
    label: "% de cartera vencida",
    description:
      "Proporción de deuda en mora respecto a la cartera total.",
  },
];

export function Kpis() {
  return (
    <section id="kpis" className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Indicadores que importan al negocio
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
          El dashboard calcula estos KPIs a partir de los datos cargados. Aún
          no hay metas numéricas definidas — se establecerá una línea base
          apenas el sistema esté operativo.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {KPIS.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-dashed border-slate-300 p-6 dark:border-slate-700"
          >
            <div className="mb-4 h-9 w-24 rounded-md bg-slate-100 text-center text-xs font-medium leading-9 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              Pendiente
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              {kpi.label}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {kpi.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
