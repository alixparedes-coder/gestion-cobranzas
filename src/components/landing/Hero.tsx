export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_theme(colors.indigo.100),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_theme(colors.indigo.950),_transparent_60%)]" />
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Servicios logísticos · Recuperación de cartera
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
          Prioriza a los clientes morosos y recupera cartera antes de que sea tarde
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
          Segmentación automática de riesgo, recomendación de la acción de
          cobranza correcta para cada escenario, correos de seguimiento
          automatizados vía Outlook/Microsoft 365 y un dashboard único para
          que agentes y supervisores vean el estado real de la cartera.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#funcionalidades"
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
          >
            Ver funcionalidades
          </a>
          <a
            href="/docs/master_plan.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Leer el PRD completo
          </a>
        </div>
      </div>
    </section>
  );
}
