-- Comparaciones semanales de recuperación de cartera, por cliente.
-- Amplía el alcance de v1 (el PRD marcaba "reportes comparativos período a
-- período" como Fase 2) a pedido explícito del negocio.
--
-- snapshots_saldo_cliente: una "foto" del saldo de cada cliente por semana.
-- crear_snapshot_saldo_cliente(): genera la foto de una fecha a partir del
--   estado actual de facturas (se llamará cada semana, cuando exista el
--   job de importación — todavía no hay scheduler automático).
-- comparacion_semanal_cartera: vista que calcula, por cliente y semana,
--   la variación de saldo vs. la semana anterior y el % ya recuperado
--   hacia la meta del 95% (sección 11 del PRD).

create table public.snapshots_saldo_cliente (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  fecha_snapshot date not null,
  saldo_pendiente numeric(14, 2) not null,
  monto_pagado_acumulado numeric(14, 2) not null,
  created_at timestamptz not null default now(),
  unique (cliente_id, fecha_snapshot)
);

create index snapshots_saldo_cliente_cliente_id_idx on public.snapshots_saldo_cliente (cliente_id);

alter table public.snapshots_saldo_cliente enable row level security;

create policy "snapshots_saldo_cliente: cualquier autenticado puede leer y escribir"
  on public.snapshots_saldo_cliente for all
  to authenticated
  using (true)
  with check (true);

create or replace function public.crear_snapshot_saldo_cliente(p_fecha date default current_date)
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.snapshots_saldo_cliente (cliente_id, fecha_snapshot, saldo_pendiente, monto_pagado_acumulado)
  select
    f.cliente_id,
    p_fecha,
    sum(f.saldo_pendiente),
    sum(f.monto_pagado)
  from public.facturas f
  group by f.cliente_id
  on conflict (cliente_id, fecha_snapshot) do update
    set saldo_pendiente = excluded.saldo_pendiente,
        monto_pagado_acumulado = excluded.monto_pagado_acumulado;
$$;

create view public.comparacion_semanal_cartera
with (security_invoker = true)
as
select
  s.cliente_id,
  c.nombre as cliente_nombre,
  s.fecha_snapshot,
  s.saldo_pendiente,
  s.monto_pagado_acumulado,
  (s.monto_pagado_acumulado + s.saldo_pendiente) as saldo_total_original,
  case when (s.monto_pagado_acumulado + s.saldo_pendiente) > 0
    then round(100.0 * s.monto_pagado_acumulado / (s.monto_pagado_acumulado + s.saldo_pendiente), 2)
    else null
  end as porcentaje_recuperado,
  lag(s.saldo_pendiente) over (partition by s.cliente_id order by s.fecha_snapshot) as saldo_pendiente_semana_anterior,
  s.saldo_pendiente - lag(s.saldo_pendiente) over (partition by s.cliente_id order by s.fecha_snapshot) as variacion_saldo_semanal
from public.snapshots_saldo_cliente s
join public.clientes c on c.id = s.cliente_id
order by s.cliente_id, s.fecha_snapshot;
