export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            GC
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Gestión de Cobranzas
          </span>
        </div>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300 sm:flex">
          <a href="#funcionalidades" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
            Funcionalidades
          </a>
          <a href="#escenarios" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
            Escenarios
          </a>
          <a href="#kpis" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
            KPIs
          </a>
          <a href="#alcance" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
            Alcance
          </a>
        </nav>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
          En desarrollo · v1
        </span>
      </div>
    </header>
  );
}
