-- =====================================================================
-- al100 Escuelas · por treselefantes
-- Esquema de base de datos para Supabase (Postgres)
--
-- Cómo usarlo: no corras este archivo directamente. Corre
-- supabase/instalar.sql, que incluye este esquema más el contenido base.
-- Se puede volver a correr: borra y recrea todo lo de al100 Escuelas
-- (OJO: también borra los datos de usuarios de la app).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Limpieza (para poder correr el script más de una vez)
-- ---------------------------------------------------------------------
drop trigger if exists al_crear_usuario on auth.users;
drop table if exists public.alertas cascade;
drop table if exists public.conversaciones_familia cascade;
drop table if exists public.bitacora cascade;
drop table if exists public.lecciones_completadas cascade;
drop table if exists public.checkins cascade;
drop table if exists public.consejos_familia cascade;
drop table if exists public.lecciones cascade;
drop table if exists public.vinculos_familia cascade;
drop table if exists public.invitaciones cascade;
drop table if exists public.miembros_grupo cascade;
drop table if exists public.grupos cascade;
drop table if exists public.temas cascade;
drop table if exists public.perfiles cascade;
drop table if exists public.escuelas cascade;

-- ---------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------

-- "Hoy" según la hora de la Ciudad de México (las rachas cuentan por día local).
create or replace function public.hoy() returns date
language sql stable as $$
  select (now() at time zone 'America/Mexico_City')::date
$$;

-- Códigos fáciles de dictar en clase: sin 0/O ni 1/I.
create or replace function public.codigo_aleatorio(n int default 6) returns text
language sql volatile as $$
  select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
  from generate_series(1, n)
$$;

-- ---------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------

create table public.escuelas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  -- Código que el personal (tutores, psicología) usa para unirse a la escuela.
  codigo_personal text not null unique default public.codigo_aleatorio(8),
  -- Protocolo de riesgo: lo define cada escuela.
  protocolo jsonb not null default jsonb_build_object(
    'dias_consecutivos', 3,
    'notificar_tutor', true,
    'notificar_psicologo', true,
    'mensaje_ayuda', 'Lo que sientes importa. Puedes hablar con tu tutor/a o con el área de psicología de tu escuela. Si sientes que estás en peligro, llama a la Línea de la Vida: 800 911 2000 (24 horas, gratis).'
  ),
  creada_en timestamptz not null default now()
);

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  rol text not null check (rol in ('alumno', 'padre', 'madre', 'tutor', 'psicologo', 'admin')),
  escuela_id uuid references public.escuelas (id) on delete set null,
  -- Editores de contenido (equipo treselefantes). Se activa a mano en Supabase.
  es_editor boolean not null default false,
  -- Código que el alumno comparte con su familia para vincular cuentas.
  codigo_familia text unique,
  creado_en timestamptz not null default now()
);

create table public.temas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  orden int not null default 0,
  nombre text not null,                 -- cómo lo ve el alumno
  nombre_familia text not null,         -- cómo lo ve la familia (tema de al100)
  descripcion text not null default '',
  descripcion_familia text not null default '',
  color text not null default '#1D6F62',
  dinamica_titulo text not null default '',  -- dinámica sugerida para la tutoría
  dinamica_texto text not null default '',
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado')),
  actualizado_en timestamptz not null default now()
);

create table public.grupos (
  id uuid primary key default gen_random_uuid(),
  escuela_id uuid not null references public.escuelas (id) on delete cascade,
  nombre text not null,
  codigo text not null unique default public.codigo_aleatorio(6),
  tutor_id uuid references public.perfiles (id) on delete set null,
  tema_actual_id uuid references public.temas (id) on delete set null,
  creado_en timestamptz not null default now()
);

create table public.miembros_grupo (
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  alumno_id uuid not null references public.perfiles (id) on delete cascade,
  unido_en timestamptz not null default now(),
  primary key (grupo_id, alumno_id)
);

-- Carga masiva: correos de alumnos que entran solos a su grupo al registrarse.
create table public.invitaciones (
  id uuid primary key default gen_random_uuid(),
  escuela_id uuid not null references public.escuelas (id) on delete cascade,
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  email text not null,
  creada_en timestamptz not null default now(),
  unique (grupo_id, email)
);

create table public.vinculos_familia (
  familiar_id uuid not null references public.perfiles (id) on delete cascade,
  alumno_id uuid not null references public.perfiles (id) on delete cascade,
  creado_en timestamptz not null default now(),
  primary key (familiar_id, alumno_id)
);

-- Una lección es una lista de "pasos" (JSON):
--   {"tipo":"idea","titulo":"...","texto":"..."}
--   {"tipo":"pregunta","texto":"...","opciones":["a","b","c"],"correcta":1,"explicacion":"..."}
--   {"tipo":"reflexion","texto":"..."}
create table public.lecciones (
  id uuid primary key default gen_random_uuid(),
  tema_id uuid not null references public.temas (id) on delete cascade,
  orden int not null default 0,
  titulo text not null,
  pasos jsonb not null default '[]'::jsonb,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado')),
  actualizado_en timestamptz not null default now()
);

create table public.consejos_familia (
  id uuid primary key default gen_random_uuid(),
  tema_id uuid not null references public.temas (id) on delete cascade,
  orden int not null default 0,
  titulo text not null,
  evita text not null default '',     -- frase que conviene evitar
  prueba text not null default '',    -- frase alternativa respetuosa
  pregunta text not null default '',  -- pregunta para platicar en casa
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado')),
  actualizado_en timestamptz not null default now()
);

-- Ánimo: 1 Muy bien · 2 Bien · 3 Regular · 4 Bajo · 5 Mal
create table public.checkins (
  id bigint generated always as identity primary key,
  alumno_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  fecha date not null default public.hoy(),
  animo smallint not null check (animo between 1 and 5),
  etiquetas text[] not null default '{}',
  pide_ayuda boolean not null default false,
  creado_en timestamptz not null default now(),
  unique (alumno_id, fecha)
);

create table public.lecciones_completadas (
  id bigint generated always as identity primary key,
  alumno_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  leccion_id uuid not null references public.lecciones (id) on delete cascade,
  fecha date not null default public.hoy(),
  aciertos int not null default 0,
  total int not null default 0,
  creado_en timestamptz not null default now()
);

-- Bitácora: privada. Solo la lee quien la escribe (alumno o familiar).
create table public.bitacora (
  id bigint generated always as identity primary key,
  autor_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  fecha date not null default public.hoy(),
  texto text not null,
  etiquetas text[] not null default '{}',
  creado_en timestamptz not null default now()
);

-- "Ya platicamos hoy": racha familiar.
create table public.conversaciones_familia (
  familiar_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  fecha date not null default public.hoy(),
  primary key (familiar_id, fecha)
);

create table public.alertas (
  id bigint generated always as identity primary key,
  alumno_id uuid not null references public.perfiles (id) on delete cascade,
  escuela_id uuid not null references public.escuelas (id) on delete cascade,
  tipo text not null check (tipo in ('animo_bajo', 'pide_ayuda')),
  detalle text not null default '',
  creada_en timestamptz not null default now(),
  atendida boolean not null default false,
  atendida_por uuid references public.perfiles (id) on delete set null,
  atendida_en timestamptz,
  nota text
);

create index on public.checkins (alumno_id, fecha);
create index on public.lecciones_completadas (alumno_id, fecha);
create index on public.bitacora (autor_id, fecha);
create index on public.miembros_grupo (alumno_id);
create index on public.lecciones (tema_id, orden);
create index on public.alertas (escuela_id, atendida);

-- ---------------------------------------------------------------------
-- Funciones de apoyo para permisos (security definer evita recursión en RLS)
-- ---------------------------------------------------------------------

create or replace function public.mi_rol() returns text
language sql stable security definer set search_path = public as $$
  select rol from perfiles where id = auth.uid()
$$;

create or replace function public.mi_escuela() returns uuid
language sql stable security definer set search_path = public as $$
  select escuela_id from perfiles where id = auth.uid()
$$;

create or replace function public.es_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select rol in ('tutor', 'psicologo', 'admin') from perfiles where id = auth.uid()), false)
$$;

create or replace function public.es_editor() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select es_editor from perfiles where id = auth.uid()), false)
$$;

create or replace function public.es_tutor_de_grupo(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from grupos where id = g and tutor_id = auth.uid())
$$;

-- Psicología o admin de la escuela a la que pertenece el grupo.
create or replace function public.es_direccion_de_grupo(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from grupos gr join perfiles yo on yo.id = auth.uid()
    where gr.id = g and yo.rol in ('psicologo', 'admin') and yo.escuela_id = gr.escuela_id
  )
$$;

create or replace function public.puede_ver_grupo(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.es_tutor_de_grupo(g)
      or public.es_direccion_de_grupo(g)
      or exists (select 1 from miembros_grupo where grupo_id = g and alumno_id = auth.uid())
      or exists (select 1 from miembros_grupo m join vinculos_familia v on v.alumno_id = m.alumno_id
                 where m.grupo_id = g and v.familiar_id = auth.uid())
$$;

-- ¿Quién puede ver datos (nunca el diario) de un alumno?
create or replace function public.puede_ver_alumno(a uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select a = auth.uid()
      or exists (select 1 from miembros_grupo m join grupos g on g.id = m.grupo_id
                 where m.alumno_id = a and g.tutor_id = auth.uid())
      or exists (select 1 from vinculos_familia where alumno_id = a and familiar_id = auth.uid())
      or exists (select 1 from perfiles yo join perfiles al on al.id = a
                 where yo.id = auth.uid() and yo.rol in ('psicologo', 'admin')
                   and yo.escuela_id is not null and yo.escuela_id = al.escuela_id)
$$;

create or replace function public.puede_ver_perfil(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select p = auth.uid()
      or public.puede_ver_alumno(p)
      -- el personal de la escuela se ve entre sí
      or exists (select 1 from perfiles yo join perfiles otro on otro.id = p
                 where yo.id = auth.uid() and yo.rol in ('tutor', 'psicologo', 'admin')
                   and otro.rol in ('tutor', 'psicologo', 'admin')
                   and yo.escuela_id is not null and yo.escuela_id = otro.escuela_id)
      -- el alumno ve a su tutor/a
      or exists (select 1 from grupos g join miembros_grupo m on m.grupo_id = g.id
                 where g.tutor_id = p and m.alumno_id = auth.uid())
$$;

-- Las alertas se reparten según el protocolo de cada escuela.
create or replace function public.puede_ver_alerta(a_alumno uuid, a_escuela uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from perfiles yo join escuelas e on e.id = yo.escuela_id
    where yo.id = auth.uid() and yo.escuela_id = a_escuela
      and (yo.rol = 'admin'
           or (yo.rol = 'psicologo' and coalesce((e.protocolo ->> 'notificar_psicologo')::boolean, true)))
  ) or exists (
    select 1 from miembros_grupo m join grupos g on g.id = m.grupo_id join escuelas e on e.id = g.escuela_id
    where m.alumno_id = a_alumno and g.tutor_id = auth.uid()
      and coalesce((e.protocolo ->> 'notificar_tutor')::boolean, true)
  )
$$;

-- ---------------------------------------------------------------------
-- Rachas
-- ---------------------------------------------------------------------

-- Un día cuenta para la racha individual si hubo check-in Y lección.
create or replace function public.dia_completo(a uuid, d date) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from checkins where alumno_id = a and fecha = d)
     and exists (select 1 from lecciones_completadas where alumno_id = a and fecha = d)
$$;

-- Si hoy todavía no completa, la racha sigue viva contando desde ayer.
create or replace function public.racha_alumno(a uuid) returns int
language plpgsql stable security definer set search_path = public as $$
declare
  d date := hoy();
  n int := 0;
begin
  if not puede_ver_alumno(a) then return null; end if;
  if not dia_completo(a, d) then d := d - 1; end if;
  while dia_completo(a, d) loop
    n := n + 1;
    d := d - 1;
  end loop;
  return n;
end $$;

-- Un día cuenta para la racha grupal si al menos 75% del grupo hizo check-in.
create or replace function public.dia_grupo_ok(g uuid, d date) returns boolean
language sql stable security definer set search_path = public as $$
  with m as (select alumno_id from miembros_grupo where grupo_id = g)
  select (select count(*) from m) > 0
     and (select count(*) from checkins c join m using (alumno_id) where c.fecha = d)::numeric
         >= 0.75 * (select count(*) from m)
$$;

create or replace function public.racha_grupo(g uuid) returns int
language plpgsql stable security definer set search_path = public as $$
declare
  d date := hoy();
  n int := 0;
begin
  if not puede_ver_grupo(g) then return null; end if;
  if not dia_grupo_ok(g, d) then d := d - 1; end if;
  while dia_grupo_ok(g, d) loop
    n := n + 1;
    d := d - 1;
  end loop;
  return n;
end $$;

-- Racha familiar de quien llama (días seguidos marcando "ya platicamos").
create or replace function public.racha_familia() returns int
language plpgsql stable security definer set search_path = public as $$
declare
  d date := hoy();
  n int := 0;
begin
  if not exists (select 1 from conversaciones_familia where familiar_id = auth.uid() and fecha = d) then
    d := d - 1;
  end if;
  while exists (select 1 from conversaciones_familia where familiar_id = auth.uid() and fecha = d) loop
    n := n + 1;
    d := d - 1;
  end loop;
  return n;
end $$;

-- ---------------------------------------------------------------------
-- Panel del tutor (siempre agregado; nunca expone el ánimo individual)
-- ---------------------------------------------------------------------

-- Clima emocional del grupo. Solo se muestra con 3 o más alumnos distintos
-- para que no se pueda adivinar quién marcó qué.
create or replace function public.clima_grupo(g uuid, dias int default 7)
returns table (animo smallint, total bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (es_tutor_de_grupo(g) or es_direccion_de_grupo(g)) then return; end if;
  if (select count(distinct c.alumno_id) from checkins c join miembros_grupo m on m.alumno_id = c.alumno_id
      where m.grupo_id = g and c.fecha > hoy() - dias) < 3 then
    return;
  end if;
  return query
    select c.animo, count(*)
    from checkins c join miembros_grupo m on m.alumno_id = c.alumno_id
    where m.grupo_id = g and c.fecha > hoy() - dias
    group by c.animo order by c.animo;
end $$;

create or replace function public.etiquetas_grupo(g uuid, dias int default 7)
returns table (etiqueta text, total bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (es_tutor_de_grupo(g) or es_direccion_de_grupo(g)) then return; end if;
  return query
    select e, count(*)
    from checkins c join miembros_grupo m on m.alumno_id = c.alumno_id, unnest(c.etiquetas) e
    where m.grupo_id = g and c.fecha > hoy() - dias
    group by e order by count(*) desc limit 5;
end $$;

-- Rachas individuales (constancia, no ánimo).
create or replace function public.rachas_grupo(g uuid)
returns table (alumno_id uuid, nombre text, racha int, hizo_hoy boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (es_tutor_de_grupo(g) or es_direccion_de_grupo(g)) then return; end if;
  return query
    select p.id, p.nombre, racha_alumno(p.id), dia_completo(p.id, hoy())
    from miembros_grupo m join perfiles p on p.id = m.alumno_id
    where m.grupo_id = g
    order by 3 desc, p.nombre;
end $$;

-- % de lecciones del tema actual completadas por el grupo.
create or replace function public.avance_grupo(g uuid) returns int
language plpgsql stable security definer set search_path = public as $$
declare
  tema uuid;
  miembros int;
  lecc int;
  hechas int;
begin
  if not puede_ver_grupo(g) then return null; end if;
  select tema_actual_id into tema from grupos where id = g;
  if tema is null then return 0; end if;
  select count(*) into miembros from miembros_grupo where grupo_id = g;
  select count(*) into lecc from lecciones where tema_id = tema;
  if miembros = 0 or lecc = 0 then return 0; end if;
  select count(*) into hechas from (
    select distinct lc.alumno_id, lc.leccion_id
    from lecciones_completadas lc
    join miembros_grupo m on m.alumno_id = lc.alumno_id and m.grupo_id = g
    join lecciones l on l.id = lc.leccion_id and l.tema_id = tema
  ) x;
  return round(100.0 * hechas / (miembros * lecc));
end $$;

-- ---------------------------------------------------------------------
-- Acciones (unirse, crear, vincular)
-- ---------------------------------------------------------------------

create or replace function public.unirse_grupo(p_codigo text) returns json
language plpgsql security definer set search_path = public as $$
declare
  g grupos;
begin
  if mi_rol() <> 'alumno' then raise exception 'Solo los alumnos se unen a un grupo con código.'; end if;
  select * into g from grupos where codigo = upper(trim(p_codigo));
  if not found then raise exception 'No encontramos un grupo con ese código.'; end if;
  insert into miembros_grupo (grupo_id, alumno_id) values (g.id, auth.uid()) on conflict do nothing;
  update perfiles set escuela_id = g.escuela_id where id = auth.uid() and escuela_id is null;
  return json_build_object('grupo_id', g.id, 'nombre', g.nombre);
end $$;

create or replace function public.crear_escuela(p_nombre text) returns json
language plpgsql security definer set search_path = public as $$
declare
  e escuelas;
begin
  if mi_rol() <> 'admin' then raise exception 'Solo una cuenta de administración puede registrar una escuela.'; end if;
  if mi_escuela() is not null then raise exception 'Tu cuenta ya pertenece a una escuela.'; end if;
  insert into escuelas (nombre) values (trim(p_nombre)) returning * into e;
  update perfiles set escuela_id = e.id where id = auth.uid();
  return json_build_object('escuela_id', e.id, 'nombre', e.nombre, 'codigo_personal', e.codigo_personal);
end $$;

create or replace function public.unirse_escuela(p_codigo text) returns json
language plpgsql security definer set search_path = public as $$
declare
  e escuelas;
begin
  if not es_staff() then raise exception 'Este código es para el personal de la escuela.'; end if;
  select * into e from escuelas where codigo_personal = upper(trim(p_codigo));
  if not found then raise exception 'No encontramos una escuela con ese código.'; end if;
  update perfiles set escuela_id = e.id where id = auth.uid();
  return json_build_object('escuela_id', e.id, 'nombre', e.nombre);
end $$;

create or replace function public.crear_grupo(p_nombre text) returns json
language plpgsql security definer set search_path = public as $$
declare
  g grupos;
begin
  if mi_rol() not in ('tutor', 'admin', 'psicologo') then raise exception 'Solo el personal puede crear grupos.'; end if;
  if mi_escuela() is null then raise exception 'Primero únete a tu escuela con el código del personal.'; end if;
  insert into grupos (escuela_id, nombre, tutor_id, tema_actual_id)
  values (mi_escuela(), trim(p_nombre), auth.uid(), (select id from temas order by orden limit 1))
  returning * into g;
  return json_build_object('grupo_id', g.id, 'nombre', g.nombre, 'codigo', g.codigo);
end $$;

create or replace function public.vincular_familia(p_codigo text) returns json
language plpgsql security definer set search_path = public as $$
declare
  a perfiles;
begin
  if mi_rol() not in ('padre', 'madre') then raise exception 'Solo las cuentas de papá o mamá se vinculan con este código.'; end if;
  select * into a from perfiles where codigo_familia = upper(trim(p_codigo)) and rol = 'alumno';
  if not found then raise exception 'No encontramos ese código. Pídele a tu hijo/a que lo revise en su perfil.'; end if;
  insert into vinculos_familia (familiar_id, alumno_id) values (auth.uid(), a.id) on conflict do nothing;
  return json_build_object('alumno_id', a.id, 'nombre', a.nombre);
end $$;

-- Carga de correos: si el alumno ya tiene cuenta entra directo; si no, al registrarse.
create or replace function public.invitar_alumnos(g uuid, correos text[]) returns json
language plpgsql security definer set search_path = public as $$
declare
  gr grupos;
  correo text;
  usuario uuid;
  directos int := 0;
  pendientes int := 0;
begin
  if not (es_tutor_de_grupo(g) or es_direccion_de_grupo(g)) then raise exception 'No tienes permiso sobre este grupo.'; end if;
  select * into gr from grupos where id = g;
  foreach correo in array correos loop
    correo := lower(trim(correo));
    continue when correo = '' or position('@' in correo) = 0;
    select u.id into usuario from auth.users u join perfiles p on p.id = u.id
      where lower(u.email) = correo and p.rol = 'alumno';
    if usuario is not null then
      insert into miembros_grupo (grupo_id, alumno_id) values (g, usuario) on conflict do nothing;
      update perfiles set escuela_id = gr.escuela_id where id = usuario and escuela_id is null;
      directos := directos + 1;
    else
      insert into invitaciones (escuela_id, grupo_id, email) values (gr.escuela_id, g, correo) on conflict do nothing;
      pendientes := pendientes + 1;
    end if;
  end loop;
  return json_build_object('agregados', directos, 'invitados', pendientes);
end $$;

-- Para la familia: hijos vinculados, su grupo, el tema que ven y su racha.
create or replace function public.info_hijos()
returns table (alumno_id uuid, nombre text, grupo text, tema_id uuid, tema text, racha int)
language sql stable security definer set search_path = public as $$
  select p.id, p.nombre,
         (select g.nombre from miembros_grupo m join grupos g on g.id = m.grupo_id where m.alumno_id = p.id order by m.unido_en limit 1),
         (select g.tema_actual_id from miembros_grupo m join grupos g on g.id = m.grupo_id where m.alumno_id = p.id order by m.unido_en limit 1),
         (select t.nombre_familia from miembros_grupo m join grupos g on g.id = m.grupo_id join temas t on t.id = g.tema_actual_id
           where m.alumno_id = p.id order by m.unido_en limit 1),
         racha_alumno(p.id)
  from vinculos_familia v join perfiles p on p.id = v.alumno_id
  where v.familiar_id = auth.uid()
  order by p.nombre
$$;

-- Para la familia: lo que su hijo/a aprendió en los últimos 7 días.
-- Solo lecciones e idea clave; nunca ánimo, respuestas ni bitácora.
create or replace function public.aprendizaje_hijo(a uuid)
returns table (leccion_id uuid, titulo text, tema text, color text, idea_titulo text, idea_texto text, fecha date)
language plpgsql stable security definer set search_path = public as $$
begin
  if not exists (select 1 from vinculos_familia v where v.alumno_id = a and v.familiar_id = auth.uid()) then return; end if;
  return query
    select l.id, l.titulo, t.nombre, t.color,
           (select e.p ->> 'titulo' from jsonb_array_elements(l.pasos) with ordinality e(p, n)
             where e.p ->> 'tipo' = 'idea' order by e.n limit 1),
           (select e.p ->> 'texto' from jsonb_array_elements(l.pasos) with ordinality e(p, n)
             where e.p ->> 'tipo' = 'idea' order by e.n limit 1),
           max(lc.fecha)
    from lecciones_completadas lc
    join lecciones l on l.id = lc.leccion_id
    join temas t on t.id = l.tema_id
    where lc.alumno_id = a and lc.fecha > hoy() - 7
    group by l.id, t.id
    order by max(lc.fecha) desc;
end $$;

-- Para el alumno: su grupo, tema actual y rachas.
create or replace function public.mi_resumen() returns json
language plpgsql stable security definer set search_path = public as $$
declare
  g grupos;
begin
  select gr.* into g from miembros_grupo m join grupos gr on gr.id = m.grupo_id
    where m.alumno_id = auth.uid() order by m.unido_en limit 1;
  return json_build_object(
    'racha', racha_alumno(auth.uid()),
    'grupo_id', g.id,
    'grupo', g.nombre,
    'tema_actual_id', g.tema_actual_id,
    'racha_grupo', case when g.id is null then null else racha_grupo(g.id) end,
    'checkin_hoy', (select row_to_json(c) from checkins c where c.alumno_id = auth.uid() and c.fecha = hoy()),
    'leccion_hoy', exists (select 1 from lecciones_completadas where alumno_id = auth.uid() and fecha = hoy())
  );
end $$;

-- Mensaje de ayuda de la escuela (los alumnos no leen la tabla de escuelas).
create or replace function public.mensaje_ayuda() returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select e.protocolo ->> 'mensaje_ayuda' from escuelas e where e.id = mi_escuela()),
    'Lo que sientes importa. Habla con un adulto de confianza. Si sientes que estás en peligro, llama a la Línea de la Vida: 800 911 2000 (24 horas, gratis).'
  )
$$;

-- Resumen para psicología / administración.
create or replace function public.resumen_escuela()
returns table (grupo_id uuid, grupo text, codigo text, tutor text, alumnos bigint, racha int)
language plpgsql stable security definer set search_path = public as $$
begin
  if mi_rol() not in ('psicologo', 'admin') then return; end if;
  return query
    select g.id, g.nombre, g.codigo, coalesce(t.nombre, '—'),
           (select count(*) from miembros_grupo m where m.grupo_id = g.id),
           racha_grupo(g.id)
    from grupos g left join perfiles t on t.id = g.tutor_id
    where g.escuela_id = mi_escuela()
    order by g.nombre;
end $$;

-- ---------------------------------------------------------------------
-- Disparadores
-- ---------------------------------------------------------------------

-- Al registrarse: crea el perfil con el rol elegido y aplica invitaciones.
create or replace function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  r text := coalesce(new.raw_user_meta_data ->> 'rol', 'alumno');
  inv record;
begin
  if r not in ('alumno', 'padre', 'madre', 'tutor', 'psicologo', 'admin') then r := 'alumno'; end if;
  insert into perfiles (id, nombre, rol, codigo_familia)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', ''), r,
          case when r = 'alumno' then codigo_aleatorio(6) end);
  if r = 'alumno' then
    for inv in select * from invitaciones where lower(email) = lower(new.email) loop
      insert into miembros_grupo (grupo_id, alumno_id) values (inv.grupo_id, new.id) on conflict do nothing;
      update perfiles set escuela_id = inv.escuela_id where id = new.id and escuela_id is null;
    end loop;
    delete from invitaciones where lower(email) = lower(new.email);
  end if;
  return new;
end $$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- Al hacer check-in: aplica el protocolo de riesgo de la escuela.
create or replace function public.revisar_alerta() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  esc uuid;
  dias int;
  malos int;
begin
  select escuela_id into esc from perfiles where id = new.alumno_id;
  if esc is null then return new; end if;

  if new.pide_ayuda and not exists (
       select 1 from alertas where alumno_id = new.alumno_id and tipo = 'pide_ayuda' and not atendida) then
    insert into alertas (alumno_id, escuela_id, tipo, detalle)
    values (new.alumno_id, esc, 'pide_ayuda', 'Pidió hablar con alguien desde su check-in.');
  end if;

  if new.animo >= 4 then
    select greatest(coalesce((protocolo ->> 'dias_consecutivos')::int, 3), 1) into dias from escuelas where id = esc;
    select count(*) into malos from checkins
      where alumno_id = new.alumno_id and fecha > new.fecha - dias and fecha <= new.fecha and animo >= 4;
    if malos >= dias and not exists (
         select 1 from alertas where alumno_id = new.alumno_id and tipo = 'animo_bajo' and not atendida) then
      insert into alertas (alumno_id, escuela_id, tipo, detalle)
      values (new.alumno_id, esc, 'animo_bajo', format('Marcó "Bajo" o "Mal" %s días seguidos.', dias));
    end if;
  end if;
  return new;
end $$;

create trigger al_hacer_checkin
  after insert or update on public.checkins
  for each row execute function public.revisar_alerta();

-- ---------------------------------------------------------------------
-- Seguridad: Row Level Security
-- ---------------------------------------------------------------------

alter table public.escuelas enable row level security;
alter table public.perfiles enable row level security;
alter table public.temas enable row level security;
alter table public.grupos enable row level security;
alter table public.miembros_grupo enable row level security;
alter table public.invitaciones enable row level security;
alter table public.vinculos_familia enable row level security;
alter table public.lecciones enable row level security;
alter table public.consejos_familia enable row level security;
alter table public.checkins enable row level security;
alter table public.lecciones_completadas enable row level security;
alter table public.bitacora enable row level security;
alter table public.conversaciones_familia enable row level security;
alter table public.alertas enable row level security;

-- Nadie anónimo toca nada.
revoke all on all tables in schema public from anon;

-- Escuelas: solo el personal ve la ficha (incluye el código del personal).
create policy escuelas_ver on public.escuelas for select to authenticated
  using (es_staff() and id = mi_escuela());
create policy escuelas_editar on public.escuelas for update to authenticated
  using (mi_rol() in ('admin', 'psicologo') and id = mi_escuela());
revoke update on public.escuelas from authenticated;
grant update (nombre, protocolo) on public.escuelas to authenticated;

-- Perfiles: cada quien edita solo su nombre.
create policy perfiles_ver on public.perfiles for select to authenticated
  using (puede_ver_perfil(id));
create policy perfiles_editar on public.perfiles for update to authenticated
  using (id = auth.uid());
revoke insert, update, delete on public.perfiles from authenticated;
grant update (nombre) on public.perfiles to authenticated;

-- Contenido: lo leen todos los usuarios; lo editan los editores.
create policy temas_ver on public.temas for select to authenticated using (true);
create policy temas_editar on public.temas for all to authenticated using (es_editor()) with check (es_editor());
create policy lecciones_ver on public.lecciones for select to authenticated using (true);
create policy lecciones_editar on public.lecciones for all to authenticated using (es_editor()) with check (es_editor());
create policy consejos_ver on public.consejos_familia for select to authenticated using (true);
create policy consejos_editar on public.consejos_familia for all to authenticated using (es_editor()) with check (es_editor());

-- Grupos
create policy grupos_ver on public.grupos for select to authenticated using (puede_ver_grupo(id));
create policy grupos_editar on public.grupos for update to authenticated
  using (tutor_id = auth.uid() or es_direccion_de_grupo(id));
create policy grupos_borrar on public.grupos for delete to authenticated
  using (tutor_id = auth.uid() or es_direccion_de_grupo(id));
revoke insert, update on public.grupos from authenticated;
grant update (nombre, tema_actual_id) on public.grupos to authenticated;

create policy miembros_ver on public.miembros_grupo for select to authenticated
  using (alumno_id = auth.uid() or es_tutor_de_grupo(grupo_id) or es_direccion_de_grupo(grupo_id));
create policy miembros_quitar on public.miembros_grupo for delete to authenticated
  using (alumno_id = auth.uid() or es_tutor_de_grupo(grupo_id) or es_direccion_de_grupo(grupo_id));
revoke insert, update on public.miembros_grupo from authenticated;

create policy invitaciones_ver on public.invitaciones for select to authenticated
  using (es_tutor_de_grupo(grupo_id) or es_direccion_de_grupo(grupo_id));
create policy invitaciones_borrar on public.invitaciones for delete to authenticated
  using (es_tutor_de_grupo(grupo_id) or es_direccion_de_grupo(grupo_id));
revoke insert, update on public.invitaciones from authenticated;

create policy vinculos_ver on public.vinculos_familia for select to authenticated
  using (familiar_id = auth.uid() or alumno_id = auth.uid());
create policy vinculos_borrar on public.vinculos_familia for delete to authenticated
  using (familiar_id = auth.uid() or alumno_id = auth.uid());
revoke insert, update on public.vinculos_familia from authenticated;

-- Check-in: solo el propio alumno, solo el día de hoy. Nadie más lo lee.
create policy checkins_ver on public.checkins for select to authenticated using (alumno_id = auth.uid());
create policy checkins_crear on public.checkins for insert to authenticated
  with check (alumno_id = auth.uid() and fecha = hoy() and mi_rol() = 'alumno');
create policy checkins_editar on public.checkins for update to authenticated
  using (alumno_id = auth.uid() and fecha = hoy()) with check (alumno_id = auth.uid() and fecha = hoy());

create policy lecciones_hechas_ver on public.lecciones_completadas for select to authenticated using (alumno_id = auth.uid());
create policy lecciones_hechas_crear on public.lecciones_completadas for insert to authenticated
  with check (alumno_id = auth.uid() and fecha = hoy());

-- Bitácora: privada de verdad.
create policy bitacora_propia on public.bitacora for all to authenticated
  using (autor_id = auth.uid()) with check (autor_id = auth.uid());

create policy conversaciones_propias on public.conversaciones_familia for all to authenticated
  using (familiar_id = auth.uid()) with check (familiar_id = auth.uid() and mi_rol() in ('padre', 'madre'));

create policy alertas_ver on public.alertas for select to authenticated using (puede_ver_alerta(alumno_id, escuela_id));
create policy alertas_atender on public.alertas for update to authenticated using (puede_ver_alerta(alumno_id, escuela_id));
revoke insert, update, delete on public.alertas from authenticated;
grant update (atendida, atendida_por, atendida_en, nota) on public.alertas to authenticated;

-- Funciones: solo usuarios con sesión.
revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated;

-- =====================================================================
-- Contenido base (estado "pendiente": lo revisa y aprueba treselefantes)
-- Generado desde src/datos/contenido.js con: npm run sql
-- =====================================================================

with tema as (
  insert into public.temas (slug, orden, nombre, nombre_familia, descripcion, descripcion_familia, color, dinamica_titulo, dinamica_texto)
  values ('sueno-y-comida', 1, 'Dormir y comer bien', 'Sueño y Comida', 'Tu cuerpo también siente: cómo el sueño y la comida cambian tu ánimo.', 'No duerme, pesadillas, batallas en la mesa, mala alimentación.', '#3E8E54', 'Mi batería del día', 'Cada quien dibuja una batería y la llena según cómo durmió y comió hoy. En parejas comparten (si quieren) una cosa que les carga la batería y una que se las baja. Cierre: el grupo arma una lista de “cargadores” que no cuestan dinero.')
  returning id
), l as (
  insert into public.lecciones (tema_id, orden, titulo, pasos)
  select tema.id, x.orden, x.titulo, x.pasos from tema, (values
    (1, 'Dormir también es estudiar', '[{"tipo":"idea","titulo":"Tu cerebro trabaja de noche","texto":"Mientras duermes, tu cerebro ordena lo que aprendiste en el día y regula tus emociones. Por eso, cuando duermes poco, todo se siente más pesado y es más fácil enojarse."},{"tipo":"pregunta","texto":"¿Cuántas horas necesita dormir, más o menos, una persona de tu edad?","opciones":["5 a 6 horas","8 a 10 horas","12 a 14 horas"],"correcta":1,"explicacion":"En la adolescencia se recomiendan entre 8 y 10 horas. En la universidad, al menos 7."},{"tipo":"idea","titulo":"La luz de la pantalla engaña","texto":"La luz del celular le dice a tu cuerpo que todavía es de día y te cuesta más dormirte. Dejarlo 30 minutos antes de acostarte ayuda mucho."},{"tipo":"pregunta","texto":"Andrea se duerme a la 1 a.m. viendo videos y en la mañana está irritable. ¿Qué le ayudaría más?","opciones":["Tomar más café","Dejar el celular lejos de la cama un rato antes de dormir","Dormirse viendo videos más tranquilos"],"correcta":1,"explicacion":"Alejar la pantalla le da a su cuerpo la señal de que ya es hora de descansar."},{"tipo":"reflexion","texto":"¿Qué podrías cambiar esta semana en tu noche para descansar mejor?"}]'::jsonb),
    (2, 'Comer con hambre o comer con emoción', '[{"tipo":"idea","titulo":"Dos tipos de hambre","texto":"El hambre física llega poco a poco y se calma con cualquier comida. El hambre emocional llega de golpe, pide algo específico (dulce, salado) y aparece cuando estamos aburridos, estresados o tristes."},{"tipo":"pregunta","texto":"Después de una discusión, Diego siente ganas urgentes de comer papitas aunque comió hace una hora. ¿Qué tipo de hambre parece?","opciones":["Hambre física","Hambre emocional"],"correcta":1,"explicacion":"Llegó de golpe, pide algo específico y apareció después de una emoción fuerte."},{"tipo":"idea","titulo":"No es malo, es una señal","texto":"Todos comemos por emoción a veces. Lo útil es notarlo y preguntarte: ¿qué necesito de verdad ahora? A veces es descansar, hablar con alguien o moverte."},{"tipo":"reflexion","texto":"¿En qué momentos notas que comes por emoción y no por hambre?"}]'::jsonb),
    (3, 'Energía que no cuesta', '[{"tipo":"idea","titulo":"Comer bien no tiene que ser caro","texto":"Frijol, amaranto, huevo, tortilla, fruta de temporada y agua simple te dan energía estable para todo el día sin gastar de más."},{"tipo":"pregunta","texto":"¿Cuál de estos desayunos te da energía más estable para la mañana?","opciones":["Un refresco y unas galletas","Huevo con frijoles y tortilla","Nada, para aguantar hasta el recreo"],"correcta":1,"explicacion":"Proteína y fibra liberan energía poco a poco. El azúcar sola sube rápido y luego te deja sin pila."},{"tipo":"pregunta","texto":"Si saltas comidas seguido, ¿qué puede pasar con tu ánimo?","opciones":["Nada, el ánimo no tiene que ver","Es más fácil sentirte irritable, cansado o sin concentración"],"correcta":1,"explicacion":"Tu cerebro necesita energía constante. Sin ella, las emociones se desbordan más fácil."},{"tipo":"reflexion","texto":"Escribe un “cargador” de energía sencillo que podrías llevar a la escuela."}]'::jsonb)
  ) as x (orden, titulo, pasos)
)
insert into public.consejos_familia (tema_id, orden, titulo, evita, prueba, pregunta)
select tema.id, x.orden, x.titulo, x.evita, x.prueba, x.pregunta from tema, (values
  (1, 'Acompaña el descanso, no lo vigiles', '“¡Ya apaga ese celular o te lo quito!”', '“Vamos a dejar los celulares cargando en la sala a las 10. Yo también dejo el mío.”', '¿Qué te ayuda a dormirte cuando te cuesta trabajo?'),
  (2, 'La mesa es para convivir', '“No te levantas hasta que te acabes todo.”', '“Sirve lo que creas que vas a comer. Si te quedas con hambre, hay más.”', '¿Cuál es tu comida favorita que podríamos preparar juntos este fin de semana?')
) as x (orden, titulo, evita, prueba, pregunta);

with tema as (
  insert into public.temas (slug, orden, nombre, nombre_familia, descripcion, descripcion_familia, color, dinamica_titulo, dinamica_texto)
  values ('rutinas-y-orden', 2, 'Organizar mi día', 'Rutinas y Orden', 'Tareas, pendientes y procrastinación: cómo organizarte sin estresarte.', 'Vestirse, tarea, recoger el cuarto o salir de casa sin peleas.', '#2F6FB2', 'El frasco de las piedras grandes', 'Muestra (o dibuja) un frasco: si primero metes arena (redes, pendientes chiquitos) ya no caben las piedras grandes (lo importante). Cada alumno escribe sus 3 “piedras grandes” de la semana y un horario realista para cada una. Cierre: compartir un truco que les funciona para no dejar todo al final.')
  returning id
), l as (
  insert into public.lecciones (tema_id, orden, titulo, pasos)
  select tema.id, x.orden, x.titulo, x.pasos from tema, (values
    (1, '¿Por qué dejo todo para el final?', '[{"tipo":"idea","titulo":"Procrastinar no es flojera","texto":"Muchas veces dejamos algo para después porque nos genera una emoción incómoda: miedo a hacerlo mal, aburrimiento o no saber por dónde empezar."},{"tipo":"pregunta","texto":"Mateo pospone su ensayo porque teme que no le quede bien. ¿Qué emoción está detrás?","opciones":["Flojera","Miedo a equivocarse","Felicidad"],"correcta":1,"explicacion":"Cuando algo nos importa mucho, el miedo a que salga mal puede paralizarnos."},{"tipo":"idea","titulo":"La regla de los 5 minutos","texto":"Comprométete a trabajar solo 5 minutos. Empezar es lo más difícil; casi siempre, una vez que arrancas, sigues."},{"tipo":"reflexion","texto":"¿Qué pendiente has estado posponiendo y qué emoción te provoca?"}]'::jsonb),
    (2, 'Pasos pequeños', '[{"tipo":"idea","titulo":"Divide la montaña","texto":"“Hacer el proyecto” asusta. “Buscar 3 fuentes”, “hacer el índice” y “escribir la introducción” se sienten posibles."},{"tipo":"pregunta","texto":"¿Cuál de estos es un paso pequeño y concreto?","opciones":["Estudiar para el examen","Hacer 10 ejercicios del tema 3","Ponerme al corriente"],"correcta":1,"explicacion":"Un paso concreto dice exactamente qué hacer y se puede terminar en una sesión."},{"tipo":"pregunta","texto":"Tienes 3 tareas y poco tiempo. ¿Qué conviene hacer primero?","opciones":["La más urgente o importante","La más fácil siempre","La que menos te gusta, sin pensar"],"correcta":0,"explicacion":"Prioriza por urgencia e importancia. Si estás bloqueado, empezar por algo fácil también puede darte impulso."},{"tipo":"reflexion","texto":"Divide uno de tus pendientes en 3 pasos pequeños."}]'::jsonb),
    (3, 'Descansar también se planea', '[{"tipo":"idea","titulo":"No eres una máquina","texto":"Trabajar 25 minutos y descansar 5 rinde más que estar 3 horas distraído. Tu cerebro necesita pausas para concentrarse."},{"tipo":"pregunta","texto":"¿Qué tipo de descanso recarga más en una pausa corta de estudio?","opciones":["Abrir redes sociales “solo un ratito”","Levantarte, estirarte o tomar agua"],"correcta":1,"explicacion":"Las redes suelen alargarse y no dejan descansar a tu mente. Moverte sí la recarga."},{"tipo":"reflexion","texto":"¿Qué haces para descansar de verdad cuando estás saturado?"}]'::jsonb)
  ) as x (orden, titulo, pasos)
)
insert into public.consejos_familia (tema_id, orden, titulo, evita, prueba, pregunta)
select tema.id, x.orden, x.titulo, x.evita, x.prueba, x.pregunta from tema, (values
  (1, 'Rutinas en equipo', '“¡Siempre es lo mismo contigo, nunca haces nada!”', '“Hagamos una lista de lo que hay que hacer en la mañana y la pegamos en el refri.”', '¿Qué parte del día se te hace más pesada y cómo te podemos ayudar?'),
  (2, 'Acompañar sin hacerles la tarea', '“Dámelo, yo lo hago más rápido.”', '“¿Por dónde quieres empezar? Estoy aquí si te atoras.”', '¿Qué materia te gusta más y por qué?')
) as x (orden, titulo, evita, prueba, pregunta);

with tema as (
  insert into public.temas (slug, orden, nombre, nombre_familia, descripcion, descripcion_familia, color, dinamica_titulo, dinamica_texto)
  values ('comunicacion-y-peleas', 3, 'Hablar y resolver conflictos', 'Comunicación y Peleas', 'Discutir sin lastimar y reparar después de una pelea.', 'Gritos, falta de respeto, silencios, cómo reparar después.', '#4458C2', 'Del “tú siempre” al “yo siento”', 'Escribe en el pizarrón frases de pelea comunes (“Tú nunca me escuchas”). En equipos las transforman a mensajes “yo”: “Yo me siento ignorado cuando… y me gustaría…”. Cierre: actuar una mini escena con la versión nueva y comentar cómo cambia la respuesta del otro.')
  returning id
), l as (
  insert into public.lecciones (tema_id, orden, titulo, pasos)
  select tema.id, x.orden, x.titulo, x.pasos from tema, (values
    (1, 'Mensajes “yo”', '[{"tipo":"idea","titulo":"Hablar de ti, no atacar","texto":"Cuando decimos “tú siempre” o “tú nunca”, el otro se defiende. Hablar de lo que tú sientes abre la conversación: “Yo me siento… cuando… y me gustaría…”."},{"tipo":"pregunta","texto":"¿Cuál es un mensaje “yo”?","opciones":["“Eres un egoísta, nunca me prestas nada.”","“Me molesta cuando tomas mis cosas sin preguntar. Me gustaría que me avisaras.”","“Haz lo que quieras.”"],"correcta":1,"explicacion":"Dice qué sientes, qué pasó y qué te gustaría, sin insultar."},{"tipo":"pregunta","texto":"Tu mamá te dice que llegas tarde y tú quieres explicar. ¿Qué ayuda más?","opciones":["Subir la voz para que te escuche","Respirar, bajar el tono y explicar qué pasó"],"correcta":1,"explicacion":"Cuando bajas el tono, el otro también suele bajarlo."},{"tipo":"reflexion","texto":"Piensa en una discusión reciente. ¿Cómo la dirías con un mensaje “yo”?"}]'::jsonb),
    (2, 'Escuchar de verdad', '[{"tipo":"idea","titulo":"Escuchar no es esperar tu turno","texto":"Escuchar es intentar entender qué siente el otro, aunque no estés de acuerdo. Una señal: repetir con tus palabras lo que te dijo."},{"tipo":"pregunta","texto":"Tu amiga te cuenta que está triste. ¿Qué respuesta muestra escucha?","opciones":["“Uy, a mí me pasó algo peor.”","“Suena a que te dolió mucho. ¿Quieres contarme más?”","“Ya, no es para tanto.”"],"correcta":1,"explicacion":"Reconoces lo que siente y le das espacio, sin compararte ni minimizar."},{"tipo":"reflexion","texto":"¿Quién te escucha bien a ti? ¿Qué hace esa persona?"}]'::jsonb),
    (3, 'Reparar después de pelear', '[{"tipo":"idea","titulo":"Todos nos equivocamos","texto":"Pelear es normal. Lo que fortalece una relación es reparar: reconocer tu parte, pedir perdón sin “peros” y acordar algo para la próxima."},{"tipo":"pregunta","texto":"¿Cuál es una disculpa que repara?","opciones":["“Perdón, pero tú empezaste.”","“Perdón por gritarte. Estaba enojado, pero no estuvo bien.”","“Ya, ¿contento?”"],"correcta":1,"explicacion":"Reconoce lo que hiciste sin culpar al otro."},{"tipo":"pregunta","texto":"¿Cuándo conviene hablar de una pelea?","opciones":["En el momento más intenso","Cuando ambos estén más tranquilos"],"correcta":1,"explicacion":"Con las emociones altas es difícil escuchar. Tomarse un tiempo no es huir si luego regresas a hablar."},{"tipo":"reflexion","texto":"¿Hay alguna relación que quisieras reparar? ¿Cuál sería un primer paso?"}]'::jsonb)
  ) as x (orden, titulo, pasos)
)
insert into public.consejos_familia (tema_id, orden, titulo, evita, prueba, pregunta)
select tema.id, x.orden, x.titulo, x.evita, x.prueba, x.pregunta from tema, (values
  (1, 'Bajar la voz para que te escuchen', '“¡A mí no me hablas así!” (gritando)', '“Me doy cuenta de que estamos muy enojados. Hablemos en 10 minutos, cuando estemos más tranquilos.”', '¿Hay algo que te gustaría que cambiara en cómo hablamos en casa?'),
  (2, 'Reparar también es educar', '“Yo soy tu papá/mamá, no tengo por qué disculparme.”', '“Perdón por gritarte ayer. Estaba cansado/a, pero tú no tenías la culpa.”', '¿Te acuerdas de alguna vez que arreglamos una pelea? ¿Qué nos ayudó?')
) as x (orden, titulo, evita, prueba, pregunta);

with tema as (
  insert into public.temas (slug, orden, nombre, nombre_familia, descripcion, descripcion_familia, color, dinamica_titulo, dinamica_texto)
  values ('emociones-y-limites', 4, 'Manejar mis emociones fuertes', 'Berrinches y Límites', 'Enojo, frustración y cómo decir “no” sin explotar.', 'Explosiones emocionales, desobediencia y cómo decir “no” sin violencia.', '#B4413A', 'El semáforo de las emociones', 'Dibuja un semáforo: verde (tranquilo), amarillo (empieza a subir), rojo (exploto). Cada alumno escribe qué siente en el cuerpo en cada color y una acción para frenar en amarillo. Practiquen juntos la respiración 4-4-6 (inhala 4, sostén 4, exhala 6) tres veces.')
  returning id
), l as (
  insert into public.lecciones (tema_id, orden, titulo, pasos)
  select tema.id, x.orden, x.titulo, x.pasos from tema, (values
    (1, 'Tu cuerpo avisa antes', '[{"tipo":"idea","titulo":"Las emociones se sienten","texto":"Antes de explotar, el cuerpo avisa: calor en la cara, puños apretados, corazón rápido, estómago revuelto. Aprender a notarlo te da tiempo para elegir qué hacer."},{"tipo":"pregunta","texto":"Diego va a exponer en 5 minutos. Tiene el estómago revuelto y las manos frías. ¿Qué siente?","opciones":["Aburrimiento","Nervios","Alegría"],"correcta":1,"explicacion":"El cuerpo reacciona a los nervios antes de que los pensemos."},{"tipo":"pregunta","texto":"¿Qué señal suele indicar enojo?","opciones":["Músculos relajados","Mandíbula apretada y calor en la cara","Ganas de dormir"],"correcta":1,"explicacion":"El enojo prepara al cuerpo para defenderse: tensa músculos y acelera el corazón."},{"tipo":"reflexion","texto":"¿Dónde sientes tú el enojo o los nervios en el cuerpo?"}]'::jsonb),
    (2, 'Respirar con calma', '[{"tipo":"idea","titulo":"Respiración 4-4-6","texto":"Inhala contando 4, sostén 4 y exhala lento contando 6. Exhalar más largo que inhalar le dice a tu cuerpo que está a salvo. Hazlo 3 veces."},{"tipo":"pregunta","texto":"¿Por qué ayuda exhalar más largo?","opciones":["Porque así no respiras","Porque calma el ritmo del corazón y relaja al cuerpo","No ayuda en nada"],"correcta":1,"explicacion":"Una exhalación larga activa la parte del sistema nervioso que nos calma."},{"tipo":"idea","titulo":"Pausa antes de responder","texto":"Cuando estás en “rojo”, alejarte un momento, tomar agua o contar hasta 10 evita decir algo de lo que después te arrepientas."},{"tipo":"reflexion","texto":"Prueba ahora la respiración 4-4-6. ¿Cómo te sientes después?"}]'::jsonb),
    (3, 'Decir “no” sin pelear', '[{"tipo":"idea","titulo":"Poner límites es cuidarte","texto":"Decir “no” a algo que no quieres hacer no te hace mala persona. Puedes ser firme y amable al mismo tiempo."},{"tipo":"pregunta","texto":"Tus amigos insisten en que te saltes una clase. ¿Cuál es un “no” firme y amable?","opciones":["“Bueno… está bien.”","“No, gracias. Nos vemos al rato.”","“¡Déjenme en paz, qué pesados!”"],"correcta":1,"explicacion":"Es claro, no da explicaciones de más y no ataca."},{"tipo":"reflexion","texto":"¿A qué te ha costado trabajo decir que no?"}]'::jsonb)
  ) as x (orden, titulo, pasos)
)
insert into public.consejos_familia (tema_id, orden, titulo, evita, prueba, pregunta)
select tema.id, x.orden, x.titulo, x.evita, x.prueba, x.pregunta from tema, (values
  (1, 'Nombra la emoción antes de corregir', '“¡Ya deja de llorar!”', '“Veo que estás muy frustrado. Aquí estoy. Cuando te calmes, buscamos una solución juntos.”', '¿Qué te ayuda cuando estás muy enojado/a?'),
  (2, 'Límites firmes, tono amable', '“¡Porque yo lo digo y punto!”', '“Entiendo que quieras ir. La respuesta es no porque es muy tarde, y podemos ver otra opción el sábado.”', '¿Qué regla de la casa te parece injusta y por qué?')
) as x (orden, titulo, evita, prueba, pregunta);

with tema as (
  insert into public.temas (slug, orden, nombre, nombre_familia, descripcion, descripcion_familia, color, dinamica_titulo, dinamica_texto)
  values ('pantallas-y-redes', 5, 'Pantallas y redes', 'Pantallas y Tecnología', 'Redes, videojuegos, comparación y cuidarte en internet.', 'Videojuegos, redes sociales, pornografía y seguridad en internet.', '#227E93', 'Detrás del filtro', 'Muestra dos versiones de una misma foto: una “perfecta” y la original. Pregunta: ¿qué no vemos en redes? En equipos hacen una lista de cosas que nadie publica (días malos, granos, fracasos). Cierre: cada quien escribe una cuenta o contenido que le hace sentir bien y uno que le hace sentir mal.')
  returning id
), l as (
  insert into public.lecciones (tema_id, orden, titulo, pasos)
  select tema.id, x.orden, x.titulo, x.pasos from tema, (values
    (1, 'Comparar mi vida con un filtro', '[{"tipo":"idea","titulo":"Las redes muestran los mejores momentos","texto":"En redes casi nadie publica sus días malos. Comparar tu vida completa con los mejores momentos de otros siempre te hará sentir que te falta algo."},{"tipo":"pregunta","texto":"Después de ver redes una hora, Valeria se siente fea y aburrida. ¿Qué le ayudaría?","opciones":["Seguir viendo hasta sentirse mejor","Notar cómo se siente y dejar de seguir cuentas que la hacen sentir mal","Publicar algo para recibir likes"],"correcta":1,"explicacion":"Tú puedes elegir qué ves. Tu feed también se cuida."},{"tipo":"reflexion","texto":"¿Qué cuentas te hacen sentir bien y cuáles te hacen sentir mal?"}]'::jsonb),
    (2, 'Cuidarme en internet', '[{"tipo":"idea","titulo":"Lo que subes se queda","texto":"Una foto o mensaje puede guardarse y compartirse aunque lo borres. Antes de enviar algo, pregúntate: ¿me importaría que lo vieran mis papás o mi escuela?"},{"tipo":"pregunta","texto":"Alguien que conociste en un juego en línea te pide fotos y que no le digas a nadie. ¿Qué haces?","opciones":["Se las mando, parece buena persona","No envío nada, lo bloqueo y se lo cuento a un adulto de confianza","Le pido que me mande las suyas primero"],"correcta":1,"explicacion":"Pedir secreto es una señal de alerta. Contarlo no es acusar: es cuidarte."},{"tipo":"pregunta","texto":"Ves que en un grupo se burlan de un compañero con memes. ¿Qué puedes hacer?","opciones":["Reenviarlo, es solo broma","No compartirlo, apoyar al compañero y avisar a un adulto","Ignorarlo, no es tu problema"],"correcta":1,"explicacion":"El ciberacoso crece cuando otros lo comparten o se quedan callados."},{"tipo":"reflexion","texto":"¿A qué adulto le contarías si algo en internet te hace sentir incómodo?"}]'::jsonb),
    (3, 'Yo controlo la pantalla', '[{"tipo":"idea","titulo":"Diseñadas para que no las sueltes","texto":"Las apps están hechas para mantenerte el mayor tiempo posible: scroll infinito, notificaciones, rachas. No es falta de voluntad; es diseño."},{"tipo":"pregunta","texto":"¿Cuál de estas ideas te ayuda a usar menos el celular sin pelear contigo?","opciones":["Apagar notificaciones que no son importantes","Tener el celular siempre en la mano","Usarlo hasta que se acabe la batería"],"correcta":0,"explicacion":"Menos notificaciones = menos interrupciones y menos tentación."},{"tipo":"reflexion","texto":"¿Cómo te sientes después de mucho tiempo en el celular?"}]'::jsonb)
  ) as x (orden, titulo, pasos)
)
insert into public.consejos_familia (tema_id, orden, titulo, evita, prueba, pregunta)
select tema.id, x.orden, x.titulo, x.evita, x.prueba, x.pregunta from tema, (values
  (1, 'Acuerdos, no solo prohibiciones', '“Se acabó, te quito el celular un mes.”', '“Hagamos juntos un acuerdo de pantallas para toda la familia, incluidos nosotros.”', '¿Qué es lo que más te gusta de tu juego o red favorita? ¿Me enseñas?'),
  (2, 'Que sepa que puede contarte', '“Si te pasa algo en internet es tu culpa por estar ahí.”', '“Si algo en internet te incomoda o te asusta, puedes contarme y no te voy a regañar.”', '¿Alguna vez viste algo en internet que te hizo sentir incómodo/a?')
) as x (orden, titulo, evita, prueba, pregunta);

with tema as (
  insert into public.temas (slug, orden, nombre, nombre_familia, descripcion, descripcion_familia, color, dinamica_titulo, dinamica_texto)
  values ('cambios-y-perdidas', 6, 'Cambios y pérdidas', 'Cambios, Divorcio y Duelo', 'Mudanzas, separaciones y despedidas: cómo atravesar lo que cambia.', 'Separaciones, mudanzas, muertes o llegada de hermanos.', '#5B4FBF', 'La línea de mi vida', 'Cada alumno dibuja una línea con 3 o 4 cambios importantes de su vida (cambio de escuela, mudanza, nuevo hermano). Sobre cada uno escribe qué sintió y qué o quién le ayudó. Nadie está obligado a compartir. Cierre: listar en grupo cosas que ayudan cuando algo cambia.')
  returning id
), l as (
  insert into public.lecciones (tema_id, orden, titulo, pasos)
  select tema.id, x.orden, x.titulo, x.pasos from tema, (values
    (1, 'Todo cambio mueve algo', '[{"tipo":"idea","titulo":"Incluso los cambios buenos cuestan","texto":"Cambiarte de escuela, mudarte o que llegue un hermanito puede ser emocionante y difícil al mismo tiempo. Sentir las dos cosas es normal."},{"tipo":"pregunta","texto":"Luis se cambió de ciudad y extraña a sus amigos, aunque le gusta su casa nueva. ¿Qué le pasa?","opciones":["Está mal sentir dos cosas a la vez","Es normal sentir emoción y tristeza al mismo tiempo"],"correcta":1,"explicacion":"Las emociones pueden convivir. Una no cancela a la otra."},{"tipo":"reflexion","texto":"¿Qué cambio importante has vivido y qué te ayudó?"}]'::jsonb),
    (2, 'Cuando mis papás se separan', '[{"tipo":"idea","titulo":"No es tu culpa","texto":"Cuando los papás se separan es una decisión de adultos sobre su relación. Nunca es culpa de los hijos, aunque a veces lo sintamos así."},{"tipo":"pregunta","texto":"¿Qué puede ayudarte si tus papás se están separando?","opciones":["Guardarte todo para no preocupar a nadie","Hablar de cómo te sientes con alguien de confianza","Elegir a uno de los dos"],"correcta":1,"explicacion":"Expresar lo que sientes te ayuda a no cargarlo solo. No tienes que elegir bando."},{"tipo":"reflexion","texto":"¿Con quién podrías hablar si algo en tu familia está cambiando?"}]'::jsonb),
    (3, 'Despedirse duele', '[{"tipo":"idea","titulo":"El duelo no tiene reglas","texto":"Cuando alguien muere o perdemos algo importante, podemos sentir tristeza, enojo, culpa o incluso nada por un tiempo. No hay una forma correcta de vivirlo."},{"tipo":"pregunta","texto":"Un compañero perdió a su abuela. ¿Qué podrías decirle?","opciones":["“Ya supéralo, fue hace una semana.”","“Lo siento mucho. Si quieres hablar o solo estar acompañado, aquí estoy.”","Nada, mejor evitarlo."],"correcta":1,"explicacion":"Acompañar sin presionar es de lo que más ayuda."},{"tipo":"reflexion","texto":"¿Cómo te gusta que te acompañen cuando estás triste?"}]'::jsonb)
  ) as x (orden, titulo, pasos)
)
insert into public.consejos_familia (tema_id, orden, titulo, evita, prueba, pregunta)
select tema.id, x.orden, x.titulo, x.evita, x.prueba, x.pregunta from tema, (values
  (1, 'Decir la verdad con cuidado', '“No pasa nada, todo sigue igual.”', '“Van a cambiar algunas cosas y es normal que te sientas raro/a. Puedes preguntarme lo que quieras.”', '¿Qué es lo que más te preocupa de este cambio?'),
  (2, 'Los hijos no son mensajeros', '“Dile a tu papá/mamá que…”', 'Habla directamente con el otro adulto y deja a tu hijo/a fuera de los temas de pareja.', '¿Cómo te sientes cuando estás en cada casa?')
) as x (orden, titulo, evita, prueba, pregunta);

with tema as (
  insert into public.temas (slug, orden, nombre, nombre_familia, descripcion, descripcion_familia, color, dinamica_titulo, dinamica_texto)
  values ('relaciones-sanas', 7, 'Relaciones sanas', 'Acuerdos de Pareja', 'Amistad, noviazgo y respeto: cómo reconocer lo que sí y lo que no.', 'Diferencias al criar, desgaste y cansancio extremo.', '#8247B8', 'Verde o rojo', 'Lee en voz alta situaciones de amistad y noviazgo (“revisa tu celular”, “respeta cuando dices que no”, “te pide que no veas a tus amigos”). Los alumnos levantan una tarjeta verde (sano) o roja (señal de alerta) y explican por qué. Cierre: construir juntos una definición de “relación sana”.')
  returning id
), l as (
  insert into public.lecciones (tema_id, orden, titulo, pasos)
  select tema.id, x.orden, x.titulo, x.pasos from tema, (values
    (1, '¿Qué hace sana una relación?', '[{"tipo":"idea","titulo":"Respeto, confianza y libertad","texto":"En una relación sana —de amistad o de pareja— te sientes libre de ser tú, puedes decir lo que piensas y tus decisiones se respetan."},{"tipo":"pregunta","texto":"¿Cuál es una señal de una relación sana?","opciones":["Te pide tus contraseñas para “demostrar confianza”","Respeta cuando dices que no","Se enoja si sales con tus amigos"],"correcta":1,"explicacion":"Respetar tus límites es básico. Lo demás son formas de control."},{"tipo":"reflexion","texto":"¿Con quién te sientes libre de ser tú?"}]'::jsonb),
    (2, 'Señales de alerta', '[{"tipo":"idea","titulo":"Los celos no son amor","texto":"Revisar tu celular, decirte cómo vestirte, alejarte de tus amigos o hacerte sentir culpable no son pruebas de amor: son señales de control."},{"tipo":"pregunta","texto":"Ana dice que su novio la quiere mucho porque le pide su ubicación todo el tiempo. ¿Qué piensas?","opciones":["Es una prueba de amor","Puede ser una señal de control"],"correcta":1,"explicacion":"El amor no necesita vigilarte. La confianza no se demuestra cediendo tu privacidad."},{"tipo":"pregunta","texto":"Si una amiga te cuenta que su pareja la controla, ¿qué ayuda más?","opciones":["Juzgarla por seguir con esa persona","Escucharla, creerle y animarla a hablar con un adulto de confianza"],"correcta":1,"explicacion":"Sentirse escuchada sin juicio facilita pedir ayuda."},{"tipo":"reflexion","texto":"¿Qué señales de alerta te gustaría que tus amigos conocieran?"}]'::jsonb),
    (3, 'Mi “sí” y mi “no”', '[{"tipo":"idea","titulo":"El consentimiento es claro y se puede cambiar","texto":"Un “sí” tiene que ser libre, sin presión. Y aunque hayas dicho que sí, puedes cambiar de opinión en cualquier momento."},{"tipo":"pregunta","texto":"Si alguien no dice nada o se queda callado, ¿eso es un sí?","opciones":["Sí, quien calla otorga","No. El silencio no es consentimiento"],"correcta":1,"explicacion":"Solo un sí claro y libre es un sí."},{"tipo":"reflexion","texto":"¿Cómo puedes preguntar y respetar el “no” de otra persona?"}]'::jsonb)
  ) as x (orden, titulo, pasos)
)
insert into public.consejos_familia (tema_id, orden, titulo, evita, prueba, pregunta)
select tema.id, x.orden, x.titulo, x.evita, x.prueba, x.pregunta from tema, (values
  (1, 'Frente unido, aunque piensen distinto', 'Desautorizar al otro adulto frente a los hijos.', '“Lo platico con tu papá/mamá y te respondemos juntos.”', '¿Sientes que en casa te decimos cosas distintas? ¿Cuáles?'),
  (2, 'Hablar de relaciones sin miedo', '“Estás muy chico/a para andar de novio/a.”', '“Me interesa saber cómo te tratan tus amigos y tu pareja. ¿Cómo te sientes con ellos?”', '¿Qué crees que hace que una relación sea sana?')
) as x (orden, titulo, evita, prueba, pregunta);

with tema as (
  insert into public.temas (slug, orden, nombre, nombre_familia, descripcion, descripcion_familia, color, dinamica_titulo, dinamica_texto)
  values ('cuidarme-y-pedir-ayuda', 8, 'Cuidarme y pedir ayuda', 'Situaciones de Riesgo', 'Cuando algo pesa demasiado: reconocerlo y pedir ayuda a tiempo.', 'Autolesiones, sustancias, ansiedad grave o conductas que asustan.', '#A66A10', 'Mi red de apoyo', 'Cada alumno dibuja una mano: en cada dedo escribe una persona o lugar al que puede acudir si algo le pesa demasiado (familiar, amigo, tutor, psicología escolar, Línea de la Vida). Recuerda al grupo dónde está el área de psicología y cómo pedir una cita. Tema sensible: avisa antes, permite no participar y quédate disponible al final.')
  returning id
), l as (
  insert into public.lecciones (tema_id, orden, titulo, pasos)
  select tema.id, x.orden, x.titulo, x.pasos from tema, (values
    (1, 'Pedir ayuda es de valientes', '[{"tipo":"idea","titulo":"No tienes que poder con todo","texto":"A veces la tristeza, la ansiedad o el estrés pesan demasiado para cargarlos solo. Pedir ayuda no es debilidad: es lo que hacen las personas que se cuidan."},{"tipo":"pregunta","texto":"¿Cuál de estas es una señal de que conviene pedir ayuda?","opciones":["Sentirte triste o sin ganas de nada casi todos los días por semanas","Estar nervioso antes de un examen"],"correcta":0,"explicacion":"Los nervios antes de un examen son normales. Cuando el malestar dura semanas y no se va, es momento de hablar con alguien."},{"tipo":"reflexion","texto":"¿Quiénes son 3 personas a las que podrías acudir?"}]'::jsonb),
    (2, 'Cuando un amigo no está bien', '[{"tipo":"idea","titulo":"Un secreto que no se guarda","texto":"Si un amigo te cuenta que se quiere hacer daño o que está en peligro, ese es un secreto que no debes guardar. Contárselo a un adulto de confianza puede salvarlo."},{"tipo":"pregunta","texto":"Tu amigo te dice que se siente muy mal y te pide que no le digas a nadie. ¿Qué haces?","opciones":["Guardo el secreto para que no se enoje","Lo escucho, le digo que me importa y busco a un adulto de confianza","Le digo que no exagere"],"correcta":1,"explicacion":"Puede enojarse al principio, pero su seguridad es más importante. No tienes que resolverlo tú solo."},{"tipo":"reflexion","texto":"¿A qué adulto de tu escuela podrías acudir en una situación así?"}]'::jsonb),
    (3, 'Presión y sustancias', '[{"tipo":"idea","titulo":"No todos lo hacen","texto":"Aunque parezca que “todos” toman o vapean, la mayoría de los adolescentes no lo hace. La presión de grupo nos hace creer que estamos solos si decimos que no."},{"tipo":"pregunta","texto":"En una fiesta te ofrecen algo que no quieres probar. ¿Qué puedes decir?","opciones":["“No, gracias, estoy bien así.”","Aceptar para no quedar mal"],"correcta":0,"explicacion":"Un “no” simple y seguro es suficiente. Tus verdaderos amigos lo respetan."},{"tipo":"reflexion","texto":"¿Qué te ayudaría a decir que no en una situación de presión?"}]'::jsonb)
  ) as x (orden, titulo, pasos)
)
insert into public.consejos_familia (tema_id, orden, titulo, evita, prueba, pregunta)
select tema.id, x.orden, x.titulo, x.evita, x.prueba, x.pregunta from tema, (values
  (1, 'Escuchar sin alarmarse', '“¿Cómo se te ocurre? ¡Me vas a matar del susto!”', '“Gracias por contármelo. Te creo y vamos a buscar ayuda juntos.”', '¿Hay algo que te esté pesando y que no me hayas podido contar?'),
  (2, 'Conoce las señales', 'Pensar que “es una etapa” cuando el cambio dura semanas.', 'Si notas aislamiento, cambios fuertes de sueño o ánimo, o señales de daño, busca apoyo profesional y habla con la escuela.', '¿Cómo te has sentido estas últimas semanas, de verdad?')
) as x (orden, titulo, evita, prueba, pregunta);

-- Listo. Para darle a alguien permisos de editor de contenido:
--   update public.perfiles set es_editor = true
--   where id = (select id from auth.users where email = 'correo@treselefantes.mx');
