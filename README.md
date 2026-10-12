# al100 Escuelas · por treselefantes

Web app de bienestar emocional para escuelas, al estilo Duolingo:

- **Alumnos** (secundaria, prepa y universidad): check-in diario de ánimo, mini-lecciones, bitácora privada con seguimiento y **racha individual y grupal**.
- **Tutores y mentores**: grupos con código, clima emocional **anónimo** del grupo, rachas, avance del tema, dinámica sugerida para la clase y modo **proyectar**.
- **Familias** (papá y mamá): cuenta vinculada con la de su hijo/a, consejo diario de crianza respetuosa sobre el tema que ven en clase, pregunta para la cena y racha familiar.
- **Psicología y administración**: protocolo de riesgo configurable por escuela, alertas, códigos y resumen de grupos.
- **Equipo treselefantes**: panel para editar y aprobar todo el contenido sin tocar código.

Cada perfil tiene su personaje: una familia de elefantes.

## Privacidad (lo que garantiza la base de datos)

| Dato | Alumno | Tutor/a | Psicología / admin | Familia |
|---|---|---|---|---|
| Bitácora | ✅ | ❌ | ❌ | ❌ |
| Ánimo diario individual | ✅ | ❌ (solo agregado, mín. 3 alumnos) | ❌ (solo agregado) | ❌ |
| Racha | ✅ | ✅ | ✅ | ✅ (de su hijo/a) |
| Alertas | — | según protocolo | ✅ | ❌ |

Estas reglas viven en Postgres (Row Level Security), no en la pantalla. Están probadas en `supabase/esquema.sql`.

## Modo demo

Sin llaves de Supabase, la app arranca en **modo demo** con datos de ejemplo y botones “Entrar como…” para cada perfil. Sirve para presentar la idea a escuelas y familias.

## Puesta en marcha (paso a paso)

1. **Supabase**: crea un proyecto en [supabase.com](https://supabase.com).
2. **Base de datos**: en Supabase → *SQL Editor*, pega todo el contenido de `supabase/instalar.sql` y da clic en **Run**.
   Crea las tablas, las reglas de privacidad y el contenido base (8 temas, 24 lecciones, 16 consejos).
3. **Llaves**: en Supabase → *Project Settings → API* copia la **Project URL** y la llave **anon public** (o *publishable*). Nunca uses la `service_role` en la app.
4. **Vercel**: en [vercel.com](https://vercel.com) → *Add New → Project* → importa este repositorio. En *Environment Variables* agrega:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = llave anon public

   Da clic en **Deploy**.
5. **Login**: en Supabase → *Authentication → URL Configuration*, pon la liga de Vercel en **Site URL** y agrégala también en **Redirect URLs**.
6. **Editor de contenido**: regístrate en la app y luego, en el SQL Editor de Supabase, corre:
   ```sql
   update public.perfiles set es_editor = true
   where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
   ```
7. **Primera escuela**: crea una cuenta como *Administración escolar* → registra la escuela → comparte el **código del personal** con tutores y psicología → los tutores crean grupos y comparten el **código de grupo** con alumnos → cada alumno comparte su **código familiar** con su mamá o papá.

> Al correr `instalar.sql` otra vez se **borran** todos los datos de la app. Úsalo solo para instalar o reiniciar.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # opcional: sin llaves = modo demo
npm run dev
```

- `npm run sql` regenera `supabase/instalar.sql` a partir de `supabase/esquema.sql` y `src/datos/contenido.js`.
- `npm run build` genera la versión de producción en `dist/`.

## Estructura

```
supabase/esquema.sql      Tablas, reglas de privacidad, rachas, alertas
supabase/instalar.sql     Esquema + contenido base (lo que se corre en Supabase)
src/datos/contenido.js    Contenido base: 8 temas adaptados de al100
src/api/                  supabase.js (real) y demo.js (datos de ejemplo)
src/componentes/Avatar.jsx  Los personajes (familia de elefantes)
src/paginas/              Pantallas por perfil
```

## Pendientes antes de usarla con alumnos reales

- Que treselefantes revise y **apruebe el contenido** (todo inicia como “pendiente”).
- Revisar el **aviso de privacidad** (`src/paginas/Privacidad.jsx`) con asesoría legal y poner el correo de contacto.
- Confirmar los teléfonos de ayuda del mensaje por defecto (Línea de la Vida 800 911 2000) y personalizarlo por escuela.
- Definir con cada escuela su **protocolo de riesgo** (sección Escuela).
