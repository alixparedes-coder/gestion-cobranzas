export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-slate-500 dark:text-slate-500 sm:flex-row">
        <p>Gestión de Cobranzas · PRD v1.0</p>
        <a
          href="/docs/master_plan.md"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          Ver documento de requisitos
        </a>
      </div>
    </footer>
  );
}
