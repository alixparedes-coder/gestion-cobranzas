-- Mejoras de rendimiento detectadas por los advisors tras la migración inicial.

create index gestiones_plantilla_id_idx on public.gestiones (plantilla_id);
create index gestiones_registrado_por_idx on public.gestiones (registrado_por);

-- Evita reevaluar auth.uid() por cada fila (recomendación de Supabase para RLS a escala).
drop policy "usuarios_sistema: cada usuario edita solo su propio perfil" on public.usuarios_sistema;

create policy "usuarios_sistema: cada usuario edita solo su propio perfil"
  on public.usuarios_sistema for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
