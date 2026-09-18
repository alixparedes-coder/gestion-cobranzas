"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  { href: "/panel", etiqueta: "Cartera" },
  { href: "/panel/kpis", etiqueta: "KPIs" },
];

export default function NavPanel() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4">
      {ENLACES.map(({ href, etiqueta }) => {
        const activo = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`text-sm font-medium ${
              activo
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
            }`}
          >
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
