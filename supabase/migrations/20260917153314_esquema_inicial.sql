-- Esquema inicial (v1) de Gestión de Cobranzas.
-- Ver docs/master_plan.md (PRD) y el resumen de tablas acordado con el negocio.
-- No existen pantallas de mockup todavía: este esquema se basa únicamente en el PRD.

-- ─────────────────────────────────────────────────────────────────────────
-- Helper: trigger genérico para mantener updated_at
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- usuarios_sistema: perfil de cada agente/supervisor.
-- El registro/login real lo maneja Supabase Auth (auth.users); esta tabla
-- solo complementa el perfil dentro de la app. Sin roles diferenciados en
-- permisos todavía (PRD sección 5) — "rol" es solo informativo por ahora.
-- ─────────────────────────────────────────────────────────────────────────
create table public.usuarios_sistema (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  correo text not null,
  rol text not null default 'agente' check (rol in ('agente', 'supervisor')),
  created_at timestamptz not null default now()
);

alter table public.usuarios_sistema enable row level security;

create policy "usuarios_sistema: cualquier autenticado puede leer"
  on public.usuarios_sistema for select
  to authenticated
  using (true);

create policy "usuarios_sistema: cada usuario edita solo su propio perfil"
  on public.usuarios_sistema for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Crea automáticamente el perfil al registrarse en Supabase Auth.
create or replace function public.crear_perfil_usuario_sistema()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios_sistema (id, nombre, correo)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', new.email), new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.crear_perfil_usuario_sistema();

-- ─────────────────────────────────────────────────────────────────────────
-- clientes: datos maestros de la cartera (importados desde Excel/CSV, RF-01).
-- ─────────────────────────────────────────────────────────────────────────
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  codigo_externo text not null unique,
  nombre text not null,
  nit text,
  correo text,
  telefono text,
  tipo_servicio text,
  dias_credito integer,
  volumen_negocio numeric(14, 2),
  antiguedad_cliente_meses integer,
  analista_asignado text,
  envio_automatico_habilitado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger clientes_set_updated_at
  before update on public.clientes
  for each row execute function public.set_updated_at();

alter table public.clientes enable row level security;

create policy "clientes: cualquier autenticado puede leer y escribir"
  on public.clientes for all
  to authenticated
  using (true)
  with check (true);

-- ─────────────────────────────────────────────────────────────────────────
-- facturas: saldo pendiente por factura. Un cliente puede tener varias a la
-- vez en distintos tramos de antigüedad (confirmado con datos reales).
-- ─────────────────────────────────────────────────────────────────────────
create table public.facturas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  numero_factura text,
  monto_facturado numeric(14, 2) not null,
  monto_pagado numeric(14, 2) not null default 0,
  saldo_pendiente numeric(14, 2) not null,
  fecha_vencimiento date not null,
  moneda text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index facturas_cliente_id_idx on public.facturas (cliente_id);

create trigger facturas_set_updated_at
  before update on public.facturas
  for each row execute function public.set_updated_at();

alter table public.facturas enable row level security;

create policy "facturas: cualquier autenticado puede leer y escribir"
  on public.facturas for all
  to authenticated
  using (true)
  with check (true);

-- ─────────────────────────────────────────────────────────────────────────
-- plantillas_correo: plantillas editables por escenario (RF-07). Reemplaza,
-- para uso en runtime, el contenido que hoy vive hardcodeado en
-- src/config/plantillasCorreo.ts.
-- ─────────────────────────────────────────────────────────────────────────
create table public.plantillas_correo (
  id uuid primary key default gen_random_uuid(),
  escenario text not null unique check (escenario in (
    'recordatorio_preventivo',
    'recordatorio_plan_pago',
    'negociacion_fraccionamiento',
    'negociacion_prioritaria',
    'negociacion_alto_valor'
  )),
  nombre text not null,
  descripcion text,
  asunto text not null,
  cuerpo text not null,
  activa boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger plantillas_correo_set_updated_at
  before update on public.plantillas_correo
  for each row execute function public.set_updated_at();

alter table public.plantillas_correo enable row level security;

create policy "plantillas_correo: cualquier autenticado puede leer y escribir"
  on public.plantillas_correo for all
  to authenticated
  using (true)
  with check (true);

-- ─────────────────────────────────────────────────────────────────────────
-- gestiones: historial de toda acción de cobranza sobre un cliente
-- (correo automático, llamada manual, negociación, pago registrado) — RF-08/RF-09.
-- ─────────────────────────────────────────────────────────────────────────
create table public.gestiones (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  factura_id uuid references public.facturas (id) on delete set null,
  tipo text not null check (tipo in (
    'correo_automatico',
    'llamada_manual',
    'negociacion',
    'pago_registrado',
    'otro'
  )),
  plantilla_id uuid references public.plantillas_correo (id) on delete set null,
  resultado text,
  detalle text,
  registrado_por uuid references public.usuarios_sistema (id) on delete set null,
  fecha timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index gestiones_cliente_id_idx on public.gestiones (cliente_id);
create index gestiones_factura_id_idx on public.gestiones (factura_id);

alter table public.gestiones enable row level security;

create policy "gestiones: cualquier autenticado puede leer y escribir"
  on public.gestiones for all
  to authenticated
  using (true)
  with check (true);
