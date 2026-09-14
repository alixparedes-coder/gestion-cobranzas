const FEATURES = [
  {
    title: "Segmentación de morosidad",
    description:
      "Clasifica automáticamente a cada cliente combinando días de atraso, monto adeudado y antigüedad/valor del cliente, con umbrales configurables por el negocio.",
    tag: "RF-03 · RF-04",
  },
  {
    title: "Motor de recomendación",
    description:
      "Sugiere la acción de cobranza más adecuada por escenario: recordatorio preventivo o negociación de plan de pago, sin reglas fijas en el código.",
    tag: "RF-05",
  },
  {
    title: "Correos automáticos",
    description:
      "Envía comunicaciones vía Outlook/Microsoft 365 con plantillas por escenario y variables dinámicas, con trazabilidad de cada envío.",
    tag: "RF-06 · RF-07",
  },
  {
    title: "Dashboard de seguimiento",
    description:
      "Vista de cartera priorizada, KPIs agregados y detalle por cliente, pensada para agentes y supervisores por igual.",
    tag: "RF-10 · RF-11",
  },
  {
    title: "Carga de datos",
    description:
      "Importación periódica de clientes y facturación desde archivos Excel/CSV, con validación de estructura y reporte claro de errores.",
    tag: "RF-01 · RF-02",
  },
  {
    title: "Historial de gestiones",
    description:
      "Registro por cliente de correos enviados, negociaciones propuestas y gestiones manuales (como llamadas), para dar seguimiento centralizado.",
    tag: "RF-08 · RF-09",
  },
];

export function Features() {
  return (
    <section id="funcionalidades" className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Todo lo necesario para priorizar la cobranza
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
          Alcance de la versión 1, definido en el PRD: una solución completa,
          no un MVP mínimo.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400">
              {feature.tag}
            </span>
            <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
