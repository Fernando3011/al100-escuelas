// Genera supabase/instalar.sql = esquema + contenido base.
// Uso: npm run sql
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEMAS } from '../src/datos/contenido.js';

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

let sql = fs.readFileSync(path.join(raiz, 'supabase/esquema.sql'), 'utf8');
sql += `
-- =====================================================================
-- Contenido base (estado "pendiente": lo revisa y aprueba treselefantes)
-- Generado desde src/datos/contenido.js con: npm run sql
-- =====================================================================
`;

TEMAS.forEach((t, i) => {
  sql += `
with tema as (
  insert into public.temas (slug, orden, nombre, nombre_familia, descripcion, descripcion_familia, color, dinamica_titulo, dinamica_texto)
  values (${q(t.slug)}, ${i + 1}, ${q(t.nombre)}, ${q(t.nombre_familia)}, ${q(t.descripcion)}, ${q(t.descripcion_familia)}, ${q(t.color)}, ${q(t.dinamica_titulo)}, ${q(t.dinamica_texto)})
  returning id
), l as (
  insert into public.lecciones (tema_id, orden, titulo, pasos)
  select tema.id, x.orden, x.titulo, x.pasos from tema, (values
${t.lecciones.map((l, j) => `    (${j + 1}, ${q(l.titulo)}, ${q(JSON.stringify(l.pasos))}::jsonb)`).join(',\n')}
  ) as x (orden, titulo, pasos)
)
insert into public.consejos_familia (tema_id, orden, titulo, evita, prueba, pregunta)
select tema.id, x.orden, x.titulo, x.evita, x.prueba, x.pregunta from tema, (values
${t.consejos.map((c, j) => `  (${j + 1}, ${q(c.titulo)}, ${q(c.evita)}, ${q(c.prueba)}, ${q(c.pregunta)})`).join(',\n')}
) as x (orden, titulo, evita, prueba, pregunta);
`;
});

sql += `
-- Listo. Para darle a alguien permisos de editor de contenido:
--   update public.perfiles set es_editor = true
--   where id = (select id from auth.users where email = 'correo@treselefantes.mx');
`;

fs.writeFileSync(path.join(raiz, 'supabase/instalar.sql'), sql);
console.log(`supabase/instalar.sql generado: ${TEMAS.length} temas, ${TEMAS.reduce((n, t) => n + t.lecciones.length, 0)} lecciones.`);
