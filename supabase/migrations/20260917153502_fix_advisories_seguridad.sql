-- Corrige los advisories de seguridad detectados tras la migración inicial:
-- 1) search_path mutable en la función helper de updated_at.
-- 2) la función interna del trigger de registro no debe quedar expuesta
--    como endpoint RPC público (/rest/v1/rpc/...) para anon/authenticated.

alter function public.set_updated_at() set search_path = public;

revoke execute on function public.crear_perfil_usuario_sistema() from public, anon, authenticated;
