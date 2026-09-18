import FormularioImportarCartera from "@/components/panel/FormularioImportarCartera";
import BotonEnviarCorreos from "@/components/panel/BotonEnviarCorreos";

export default function PaginaImportar() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Importar y enviar</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Carga la cartera de la semana y dispara el envío de correos de cobranza.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">1. Importar cartera (RF-01)</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Todo-o-nada: si hay algún error de validación, no se importa nada.
        </p>
        <FormularioImportarCartera />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">2. Enviar correos (RF-06)</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Evalúa a todos los clientes con saldo pendiente y envía el correo del escenario que corresponda —
          respeta el envío deshabilitado por cliente y no repite si ya se envió algo en los últimos 6 días.
        </p>
        <BotonEnviarCorreos />
      </section>
    </div>
  );
}
