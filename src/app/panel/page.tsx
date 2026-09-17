import { obtenerCarteraGeneral } from "@/lib/cartera/obtenerCarteraGeneral";
import TablaCartera from "@/components/panel/TablaCartera";

export default async function PaginaPanel() {
  const filas = await obtenerCarteraGeneral();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Cartera</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Vista general de clientes, segmentada por riesgo de morosidad.
        </p>
      </div>
      <TablaCartera filas={filas} />
    </div>
  );
}
