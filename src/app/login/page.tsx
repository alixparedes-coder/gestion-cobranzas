import type { Metadata } from "next";
import FormularioLogin from "@/components/auth/FormularioLogin";

export const metadata: Metadata = {
  title: "Iniciar sesión — Gestión de Cobranzas",
};

export default function PaginaLogin() {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Gestión de Cobranzas</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Inicia sesión con la cuenta que te fue asignada.
        </p>
        <div className="mt-6">
          <FormularioLogin />
        </div>
      </div>
    </main>
  );
}
