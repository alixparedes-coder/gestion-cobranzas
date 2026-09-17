@AGENTS.md

# Gestión de Cobranzas — Guía para Claude Code

## Qué es este proyecto

Sistema de gestión de cobranzas y recuperación de cartera para una empresa de
servicios logísticos. Segmenta clientes por riesgo de morosidad, recomienda
acciones de cobranza por escenario, automatiza el envío de correos vía
Resend y expone un dashboard de seguimiento con KPIs.

El PRD completo (fuente de verdad de requisitos) está en
[docs/master_plan.md](docs/master_plan.md). Léelo antes de implementar
cualquier funcionalidad nueva — en caso de duda sobre una regla de negocio,
el PRD manda sobre cualquier suposición.

**Estado actual:** andamiaje base (Next.js) y landing page estática, más los
primeros bloques de negocio: tipos de dominio y plantillas de correo por
escenario (`src/types`, `src/config`, `src/lib/correo`) y el cliente de
Supabase (`src/lib/supabase.ts`). Todavía faltan: carga de Excel/CSV, motor
de segmentación, motor de recomendación, envío real de correos vía Resend y
el dashboard.

## Stack técnico

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript, todo en un
  solo proyecto (frontend + backend vía Route Handlers/Server Actions). Se
  eligió sobre Python/FastAPI (alternativa sugerida en el PRD, sección 14)
  porque permite `npm run dev` único para todo el stack y el volumen de datos
  esperado (cientos de clientes, ver PRD 6.1) no justifica un backend
  separado.
- **Estilos:** Tailwind CSS v4.
- **Base de datos:** [Supabase](https://supabase.com) (PostgreSQL gestionado). Cliente en
  `src/lib/supabase.ts`: `supabase` (publishable key, uso general) y
  `getSupabaseAdmin()` (secret key, solo en código de servidor). Usa las API
  keys nuevas de Supabase (`sb_publishable_...` / `sb_secret_...`), no las
  legacy `anon`/`service_role`.
- **Envío de correo:** [Resend](https://resend.com) (ver PRD sección 9; decisión del
  23 sep 2026, reemplaza la integración con Outlook/Microsoft 365 planteada
  originalmente) — pendiente de implementar.
- **Linting:** ESLint (config `eslint-config-next`).

## Comandos

```bash
npm run dev      # servidor de desarrollo en http://localhost:3000
npm run build    # build de producción
npm run start    # sirve el build de producción
npm run lint      # ESLint
```

`dev`/`build` usan `--webpack` en vez de Turbopack, y el proyecto usa
**Tailwind CSS v3** (con `tailwind.config.ts` + PostCSS/autoprefixer) en vez
de v4. Motivo: en esta máquina Windows, varios paquetes que dependen de un
binario nativo `.node` específico de la plataforma (`@next/swc-win32-x64-msvc`
de Turbopack, `lightningcss-win32-x64-msvc` que usa Tailwind v4) quedan
instalados solo con `package.json`/`README.md` — el binario nunca persiste en
`node_modules` (se confirmó que incluso copiarlo a mano ahí falla en
silencio), muy probablemente por antivirus/EDR bloqueando `.node` sin firmar.
Tailwind v3 y Webpack son 100% JS y no dependen de binarios nativos, así que
evitan el problema por completo. Si en el futuro se confirma que los
binarios nativos se instalan bien en el entorno de destino (otra máquina,
CI, etc.), se puede volver a Turbopack/Tailwind v4.

No hay suite de tests todavía. Cuando se agregue lógica de negocio (motor de
segmentación, motor de reglas de acciones), debe ir acompañada de tests —
proponer el framework (p. ej. Vitest) en ese momento.

## Estructura del proyecto

```
docs/                    PRD y decisiones de arquitectura (ADRs)
  master_plan.md          PRD v1.0 — fuente de verdad de requisitos
  adr/                     Registro de decisiones de arquitectura
src/
  app/                     Rutas de Next.js (App Router). Cada carpeta = una ruta.
  components/
    landing/               Componentes exclusivos de la landing page
    ui/                     Componentes de UI genéricos y reutilizables
  lib/                     Lógica de negocio y utilidades (motor de
                            segmentación, motor de reglas, clientes de
                            integraciones) — sin JSX.
  types/                   Tipos/interfaces compartidos de dominio (Cliente,
                            Factura, Segmento, Gestión, etc.)
  config/                  Configuración parametrizable por negocio (umbrales
                            de segmentación, mapeo segmento→acción — deben
                            poder cambiar sin tocar el motor, ver RF-04/RNF-04)
```

A medida que se implemente cada módulo del PRD, crear una subcarpeta
correspondiente dentro de `src/lib` (p. ej. `src/lib/segmentacion`,
`src/lib/recomendacion`, `src/lib/importacion`, `src/lib/correo`) en vez de
un único archivo grande.

## Convenciones de código

- TypeScript estricto; evitar `any`. Definir tipos de dominio en `src/types`
  y reutilizarlos en vez de duplicar formas de objeto.
- Componentes de React en PascalCase, un componente por archivo.
- Server Components por defecto; usar `"use client"` solo cuando se necesite
  interactividad (filtros, formularios, estado local del dashboard).
- Las reglas de negocio (umbrales de días de atraso, rangos de monto, mapeo
  segmento→acción) deben quedar en `src/config`, no hardcodeadas dentro de
  componentes o del motor — son parametrizables por el negocio (RF-04).
- Idioma: nombres de dominio (Cliente, Factura, Cartera, Gestión, Segmento)
  en español, para que el código hable el mismo idioma que el PRD y el
  negocio; nombres técnicos genéricos (props, hooks, utilidades) en inglés
  si es más natural en el ecosistema React/Next.
- Commits en español, en modo imperativo y acotados a un cambio lógico.

## Flujo de ramas (Git)

Este proyecto usa **solo dos ramas**. Nunca crear ninguna rama adicional por
cuenta propia — si se necesita una rama de funcionalidad, el usuario debe
pedirlo explícitamente, y en ese caso se crea a partir de `staging`.

- **`main`** — rama de **producción**. Es lo que ven los usuarios finales
  (la web publicada).
- **`staging`** — rama de **desarrollo/pruebas**. Aquí se valida todo antes
  de publicarlo. **Todos los commits se hacen aquí por defecto.**

`staging` solo se mergea a `main` cuando el usuario indica explícitamente
que algo está listo para publicar.

### Cómo interpretar a qué rama se refiere el usuario

| El usuario dice... | Se refiere a |
|---|---|
| "producción", "prod", "main", "online", "la web", "publicar", "subir a producción", o cualquier mención de "lo que van a ver los usuarios" | `main` |
| "desarrollo", "development", "dev", "staging", "ambiente de prueba", "entorno de pruebas" | `staging` |

Ante la duda entre ambas, por defecto se asume `staging` (es la rama de
trabajo activo); solo se opera sobre `main` cuando el usuario indica
explícitamente publicar/producción.

## Notas de la sección `AGENTS.md`

El bloque al inicio de `AGENTS.md` (entre `<!-- BEGIN:nextjs-agent-rules -->`
y `<!-- END:nextjs-agent-rules -->`) lo genera y reescribe automáticamente
`next dev` — no editarlo a mano, y está bien si vuelve a aparecer en el
diff después de correr el servidor de desarrollo.
