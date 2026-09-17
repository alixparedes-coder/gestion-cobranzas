import { crearClienteSupabaseServidor } from "@/lib/supabaseServidor";
import { cerrarSesion } from "@/app/panel/actions";

export default async function LayoutPanel({ children }: LayoutProps<"/panel">) {
  const supabase = await crearClienteSupabaseServidor();
  const { data } = await supabase.auth.getUser();

  let nombre = data.user?.email ?? "";
  if (data.user) {
    const { data: perfil } = await supabase
      .from("usuarios_sistema")
      .select("nombre")
      .eq("id", data.user.id)
      .maybeSingle();
    if (perfil?.nombre) nombre = perfil.nombre;
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-950">
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          Gestión de Cobranzas
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600 dark:text-slate-400">{nombre}</span>
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 py-6">{children}</main>
    </div>
  );
}
