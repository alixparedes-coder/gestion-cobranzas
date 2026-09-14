const SCENARIOS = [
  {
    segmento: "Riesgo bajo",
    atraso: "1–15 días",
    accion: "Recordatorio preventivo por correo",
    nivel: "bajo",
  },
  {
    segmento: "Riesgo medio",
    atraso: "16–45 días",
    accion: "Recordatorio + oferta de plan de pago o pronto pago con descuento",
    nivel: "medio",
  },
  {
    segmento: "Riesgo alto",
    atraso: "46–90 días",
    accion: "Negociación de plan de pago (fraccionamiento)",
    nivel: "alto",
  },
  {
    segmento: "Riesgo crítico",
    atraso: "Más de 90 días",
    accion:
      "Negociación prioritaria; el sistema destaca el caso para atención manual del agente",
    nivel: "critico",
  },
];

const NIVEL_STYLES: Record<string, string> = {
  bajo: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300",
  medio: "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300",
  alto: "bg-orange-100 text-orange-800 dark:bg-orange-400/10 dark:text-orange-300",
  critico: "bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-300",
};

export function Scenarios() {
  return (
    <section
      id="escenarios"
      className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40"
    >
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Una acción distinta para cada escenario
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
            El segmento de riesgo determina la acción recomendada. Los
            clientes de alto valor (antigüedad/volumen) se priorizan para
            negociación personalizada sin importar el nivel de riesgo.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Segmento
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Días de atraso
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Acción recomendada
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {SCENARIOS.map((row) => (
                <tr key={row.segmento}>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${NIVEL_STYLES[row.nivel]}`}
                    >
                      {row.segmento}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">
                    {row.atraso}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {row.accion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
