-- Actualización 2026-10-15: vistas de reporte para Power BI.
-- Cómo aplicarla: Supabase → SQL Editor → New query → pegar todo → CAMBIAR LA CONTRASEÑA (abajo) → Run.
-- No borra ni cambia datos. Se puede volver a correr.
--
-- Crea:
--   * El esquema "reportes" con vistas AGREGADAS y ANÓNIMAS (sin nombres, sin correos, sin bitácora).
--   * El usuario "powerbi_lector", que SOLO puede leer esas vistas. No puede ver ni tocar nada más.

create schema if not exists reportes;

-- Grupos: tamaño, escuela y tema actual.
create or replace view reportes.grupos as
select g.id as grupo_id,
       g.nombre as grupo,
       e.nombre as escuela,
       t.nombre as tema_actual,
       (select count(*) from public.miembros_grupo m where m.grupo_id = g.id) as alumnos,
       g.creado_en::date as creado
from public.grupos g
join public.escuelas e on e.id = g.escuela_id
left join public.temas t on t.id = g.tema_actual_id;

-- Ánimo por grupo y día (conteos; nunca por alumno).
create or replace view reportes.animo_diario as
select c.fecha,
       e.nombre as escuela,
       g.nombre as grupo,
       c.animo as animo_valor,
       case c.animo when 1 then 'Muy bien' when 2 then 'Bien' when 3 then 'Regular' when 4 then 'Bajo' else 'Mal' end as animo,
       count(*) as checkins
from public.checkins c
join public.miembros_grupo m on m.alumno_id = c.alumno_id
join public.grupos g on g.id = m.grupo_id
join public.escuelas e on e.id = g.escuela_id
group by c.fecha, e.nombre, g.nombre, c.animo;

-- Etiquetas del check-in (de qué se trata lo que sienten) por grupo y día.
create or replace view reportes.etiquetas_diarias as
select c.fecha,
       g.nombre as grupo,
       et as etiqueta,
       count(*) as menciones
from public.checkins c
join public.miembros_grupo m on m.alumno_id = c.alumno_id
join public.grupos g on g.id = m.grupo_id
cross join lateral unnest(c.etiquetas) as et
group by c.fecha, g.nombre, et;

-- Participación diaria: cuántos alumnos hicieron check-in, lección y día completo.
create or replace view reportes.participacion_diaria as
with dias as (
  select distinct fecha from public.checkins
  union
  select distinct fecha from public.lecciones_completadas
)
select d.fecha,
       e.nombre as escuela,
       g.nombre as grupo,
       (select count(*) from public.miembros_grupo m where m.grupo_id = g.id) as alumnos,
       (select count(distinct c.alumno_id) from public.checkins c
          join public.miembros_grupo m on m.alumno_id = c.alumno_id and m.grupo_id = g.id
         where c.fecha = d.fecha) as con_checkin,
       (select count(distinct lc.alumno_id) from public.lecciones_completadas lc
          join public.miembros_grupo m on m.alumno_id = lc.alumno_id and m.grupo_id = g.id
         where lc.fecha = d.fecha) as con_leccion,
       (select count(distinct c.alumno_id) from public.checkins c
          join public.miembros_grupo m on m.alumno_id = c.alumno_id and m.grupo_id = g.id
          join public.lecciones_completadas lc on lc.alumno_id = c.alumno_id and lc.fecha = c.fecha
         where c.fecha = d.fecha) as dia_completo
from dias d
cross join public.grupos g
join public.escuelas e on e.id = g.escuela_id;

-- Lecciones completadas por tema, lección y grupo.
create or replace view reportes.lecciones as
select lc.fecha,
       g.nombre as grupo,
       t.nombre as tema,
       l.titulo as leccion,
       count(*) as completadas,
       sum(lc.aciertos) as aciertos,
       sum(lc.total) as preguntas
from public.lecciones_completadas lc
join public.lecciones l on l.id = lc.leccion_id
join public.temas t on t.id = l.tema_id
join public.miembros_grupo m on m.alumno_id = lc.alumno_id
join public.grupos g on g.id = m.grupo_id
group by lc.fecha, g.nombre, t.nombre, l.titulo;

-- Alertas (sin nombre del alumno): cuántas, de qué tipo y si se atendieron.
create or replace view reportes.alertas as
select a.creada_en::date as fecha,
       e.nombre as escuela,
       a.tipo,
       a.atendida,
       case when a.atendida_en is not null
            then round(extract(epoch from (a.atendida_en - a.creada_en)) / 3600.0, 1) end as horas_para_atender
from public.alertas a
join public.escuelas e on e.id = a.escuela_id;

-- Familias: cuántas cuentas de papá/mamá están vinculadas y cuántas platican.
create or replace view reportes.familias as
select (select count(distinct familiar_id) from public.vinculos_familia) as familias_vinculadas,
       (select count(*) from public.conversaciones_familia where fecha > (now() at time zone 'America/Mexico_City')::date - 7) as platicas_ultimos_7_dias;

-- Usuario de solo lectura para Power BI.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'powerbi_lector') then
    create role powerbi_lector login password 'CAMBIA-ESTA-CONTRASEÑA';
  end if;
end $$;
-- ↓↓↓ Escribe aquí tu propia contraseña (larga) antes de dar Run ↓↓↓
alter role powerbi_lector with login password 'CAMBIA-ESTA-CONTRASEÑA';

revoke all on schema public from powerbi_lector;
grant usage on schema reportes to powerbi_lector;
grant select on all tables in schema reportes to powerbi_lector;
-- Las vistas leen las tablas con los permisos de su dueño, así que el usuario
-- solo ve lo que las vistas muestran. Nadie anónimo ni de la app puede leerlas:
revoke all on schema reportes from anon, authenticated;
