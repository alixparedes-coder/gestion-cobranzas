"use client";

import { useState } from "react";

interface ErrorFila {
  fila: number;
  columna?: string;
  mensaje: string;
}

interface ResultadoImport {
  clientesProcesados: number;
  facturasProcesadas: number;
}

export default function FormularioImportarCartera() {
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<ErrorFila[]>([]);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoImport | null>(null);

  async function manejarSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    // Capturar el formulario ANTES del await: React anula `evento.currentTarget`
    // en cuanto termina la parte síncrona del handler, así que usarlo después
    // de un await lanza y ese error acababa pisando el mensaje de éxito.
    const formulario = evento.currentTarget;
    setCargando(true);
    setErrores([]);
    setErrorGeneral(null);
    setResultado(null);

    const formData = new FormData(formulario);

    try {
      const respuesta = await fetch("/api/importar-cartera", { method: "POST", body: formData });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        if (Array.isArray(datos.errores)) {
          setErrores(datos.errores);
        } else {
          setErrorGeneral(datos.error ?? "No se pudo importar el archivo.");
        }
        return;
      }

      setResultado(datos);
      formulario.reset();
    } catch {
      setErrorGeneral("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={manejarSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
        Archivo (.xlsx o .csv)
        <input
          type="file"
          name="archivo"
          accept=".xlsx,.csv"
          required
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <button
        type="submit"
        disabled={cargando}
        className="w-fit rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {cargando ? "Importando..." : "Importar"}
      </button>

      {resultado && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          Listo: {resultado.clientesProcesados} clientes y {resultado.facturasProcesadas} facturas procesadas.
        </p>
      )}

      {errorGeneral && <p className="text-sm text-red-600 dark:text-red-400">{errorGeneral}</p>}

      {errores.length > 0 && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm dark:border-red-900 dark:bg-red-950/40">
          <p className="font-medium text-red-700 dark:text-red-400">
            No se importó nada — corrige estos errores y vuelve a subir el archivo:
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-red-700 dark:text-red-400">
            {errores.map((e, i) => (
              <li key={i}>
                Fila {e.fila}
                {e.columna ? ` (${e.columna})` : ""}: {e.mensaje}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
