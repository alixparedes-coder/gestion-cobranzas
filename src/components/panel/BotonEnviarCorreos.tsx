"use client";

import { useState } from "react";
import { ETIQUETA_ESCENARIO } from "@/components/panel/estilosRiesgo";

interface ResultadoCliente {
  clienteId: string;
  codigoExterno: string;
  estado: "enviado" | "omitido_envio_deshabilitado" | "omitido_sin_correo" | "omitido_reciente" | "sin_accion" | "error";
  escenario?: string;
  detalle?: string;
}

const ETIQUETA_ESTADO: Record<ResultadoCliente["estado"], string> = {
  enviado: "Enviado",
  omitido_envio_deshabilitado: "Omitido (envío deshabilitado)",
  omitido_sin_correo: "Omitido (sin correo)",
  omitido_reciente: "Omitido (ya se envió algo recientemente)",
  sin_accion: "Sin acción (sin atraso)",
  error: "Error",
};

export default function BotonEnviarCorreos() {
  const [cargando, setCargando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [resultados, setResultados] = useState<ResultadoCliente[] | null>(null);

  async function manejarClick() {
    setCargando(true);
    setErrorGeneral(null);
    setResultados(null);

    try {
      const respuesta = await fetch("/api/procesar-envios", { method: "POST" });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setErrorGeneral(datos.error ?? "No se pudo procesar el envío.");
        return;
      }
      setResultados(datos.resultados);
    } catch {
      setErrorGeneral("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  const conteoPorEstado = resultados?.reduce<Record<string, number>>((acc, r) => {
    acc[r.estado] = (acc[r.estado] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={manejarClick}
        disabled={cargando}
        className="w-fit rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {cargando ? "Procesando..." : "Enviar correos ahora"}
      </button>

      {errorGeneral && <p className="text-sm text-red-600 dark:text-red-400">{errorGeneral}</p>}

      {resultados && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 text-sm">
            {conteoPorEstado &&
              Object.entries(conteoPorEstado).map(([estado, cantidad]) => (
                <span
                  key={estado}
                  className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {ETIQUETA_ESTADO[estado as ResultadoCliente["estado"]] ?? estado}: {cantidad}
                </span>
              ))}
          </div>

          <div className="max-h-64 overflow-y-auto rounded-md border border-slate-200 text-sm dark:border-slate-800">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  <th className="px-3 py-1.5">Cliente</th>
                  <th className="px-3 py-1.5">Estado</th>
                  <th className="px-3 py-1.5">Escenario</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r) => (
                  <tr key={r.clienteId} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                    <td className="px-3 py-1.5">{r.codigoExterno}</td>
                    <td className="px-3 py-1.5">{ETIQUETA_ESTADO[r.estado]}</td>
                    <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400">
                      {r.escenario ? ETIQUETA_ESCENARIO[r.escenario] ?? r.escenario : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
