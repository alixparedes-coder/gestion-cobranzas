"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { FilaCarteraGeneral } from "@/lib/cartera/obtenerCarteraGeneral";
import type { NivelRiesgo } from "@/types/cobranza";
import { ESTILO_BADGE_RIESGO, ETIQUETA_GESTION, ETIQUETA_RIESGO, formatearFecha, formatearMoneda } from "@/components/panel/estilosRiesgo";

type ColumnaOrden = "nombre" | "saldoPendienteTotal" | "diasAtraso";
type DireccionOrden = "asc" | "desc";

export default function TablaCartera({ filas }: { filas: FilaCarteraGeneral[] }) {
  const [filtroRiesgo, setFiltroRiesgo] = useState<NivelRiesgo | "todos">("todos");
  const [soloAltoValor, setSoloAltoValor] = useState(false);
  const [orden, setOrden] = useState<{ columna: ColumnaOrden; direccion: DireccionOrden }>({
    columna: "diasAtraso",
    direccion: "desc",
  });

  const filasVisibles = useMemo(() => {
    let resultado = filas;
    if (filtroRiesgo !== "todos") {
      resultado = resultado.filter((f) => f.nivelRiesgo === filtroRiesgo);
    }
    if (soloAltoValor) {
      resultado = resultado.filter((f) => f.esAltoValor);
    }

    const factor = orden.direccion === "asc" ? 1 : -1;
    return [...resultado].sort((a, b) => {
      if (orden.columna === "nombre") return factor * a.nombre.localeCompare(b.nombre);
      return factor * (a[orden.columna] - b[orden.columna]);
    });
  }, [filas, filtroRiesgo, soloAltoValor, orden]);

  function alternarOrden(columna: ColumnaOrden) {
    setOrden((actual) =>
      actual.columna === columna
        ? { columna, direccion: actual.direccion === "asc" ? "desc" : "asc" }
        : { columna, direccion: "desc" }
    );
  }

  function encabezadoOrdenable(columna: ColumnaOrden, etiqueta: string) {
    const activo = orden.columna === columna;
    return (
      <button
        type="button"
        onClick={() => alternarOrden(columna)}
        className={`flex items-center gap-1 font-medium ${activo ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`}
      >
        {etiqueta}
        {activo && <span aria-hidden>{orden.direccion === "asc" ? "▲" : "▼"}</span>}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          Segmento
          <select
            value={filtroRiesgo}
            onChange={(e) => setFiltroRiesgo(e.target.value as NivelRiesgo | "todos")}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="todos">Todos</option>
            {(Object.keys(ETIQUETA_RIESGO) as NivelRiesgo[]).map((nivel) => (
              <option key={nivel} value={nivel}>
                {ETIQUETA_RIESGO[nivel]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={soloAltoValor}
            onChange={(e) => setSoloAltoValor(e.target.checked)}
            className="rounded border-slate-300"
          />
          Solo alto valor
        </label>

        <span className="text-sm text-slate-400">
          {filasVisibles.length} de {filas.length} clientes
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
              <th className="px-4 py-2 text-left">{encabezadoOrdenable("nombre", "Cliente")}</th>
              <th className="px-4 py-2 text-left">Segmento</th>
              <th className="px-4 py-2 text-right">
                {encabezadoOrdenable("saldoPendienteTotal", "Saldo pendiente")}
              </th>
              <th className="px-4 py-2 text-right">{encabezadoOrdenable("diasAtraso", "Días de atraso")}</th>
              <th className="px-4 py-2 text-left">Última gestión</th>
            </tr>
          </thead>
          <tbody>
            {filasVisibles.map((fila) => (
              <tr
                key={fila.clienteId}
                className={`border-b border-slate-100 last:border-0 dark:border-slate-800 ${
                  fila.nivelRiesgo === "critico" ? "bg-red-50/60 dark:bg-red-950/20" : ""
                }`}
              >
                <td className="px-4 py-2 text-slate-900 dark:text-slate-50">
                  <Link
                    href={`/panel/clientes/${fila.clienteId}`}
                    className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {fila.nombre}
                  </Link>
                  {fila.esAltoValor && (
                    <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                      Alto valor
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTILO_BADGE_RIESGO[fila.nivelRiesgo]}`}>
                    {ETIQUETA_RIESGO[fila.nivelRiesgo]}
                  </span>
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-slate-900 dark:text-slate-50">
                  {formatearMoneda(fila.saldoPendienteTotal)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                  {fila.diasAtraso}
                </td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                  {fila.ultimaGestion ? (
                    <>
                      {ETIQUETA_GESTION[fila.ultimaGestion.tipo] ?? fila.ultimaGestion.tipo}
                      <span className="text-slate-400"> · {formatearFecha(fila.ultimaGestion.fecha)}</span>
                    </>
                  ) : (
                    <span className="text-slate-400">Sin gestiones</span>
                  )}
                </td>
              </tr>
            ))}
            {filasVisibles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No hay clientes que coincidan con el filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
