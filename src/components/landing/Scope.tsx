const INCLUDED = [
  "Carga e importación de datos desde Excel/CSV",
  "Motor de segmentación de morosidad configurable",
  "Motor de recomendación de acciones por escenario",
  "Automatización de correos vía Outlook/Microsoft 365",
  "Dashboard de seguimiento con KPIs, sin roles diferenciados",
  "Registro histórico de gestiones por cliente",
];

const EXCLUDED = [
  "Escalamiento automático a supervisor o legal",
  "Suspensión automática de servicios por mora",
  "WhatsApp, SMS o llamadas automatizadas",
  "Integración directa con el ERP/TMS logístico",
  "Roles y permisos diferenciados entre agentes y supervisores",
];

export function Scope() {
  return (
    <section
      id="alcance"
      className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40"
    >
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Alcance de la versión 1
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
            Lo que queda fuera no se descarta — queda identificado como
            candidato para fases futuras.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Incluido en v1
            </h3>
            <ul className="mt-4 space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <span className="mt-0.5 text-emerald-600 dark:text-emerald-400">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Fuera de alcance en v1
            </h3>
            <ul className="mt-4 space-y-3">
              {EXCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-500 dark:text-slate-500">
                  <span className="mt-0.5">–</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
