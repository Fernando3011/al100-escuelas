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
