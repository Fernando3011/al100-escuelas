-- Actualización 2026-10-14: "Lo que aprendió esta semana" para las familias.
-- Cómo aplicarla: Supabase → SQL Editor → New query → pegar todo → Run.
-- No borra ni cambia datos; solo agrega una función.

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

revoke execute on function public.aprendizaje_hijo(uuid) from public, anon;
grant execute on function public.aprendizaje_hijo(uuid) to authenticated;
