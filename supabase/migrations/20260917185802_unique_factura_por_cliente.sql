-- Necesario para el importador (RF-01): permite hacer upsert de facturas
-- por (cliente_id, numero_factura) sin duplicar la misma factura en
-- reimportaciones sucesivas. NULLs en numero_factura no chocan entre sí
-- (comportamiento estándar de Postgres en constraints únicos).
alter table public.facturas
  add constraint facturas_cliente_id_numero_factura_key unique (cliente_id, numero_factura);
