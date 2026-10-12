// Backend real: Supabase. Toda la seguridad vive en la base de datos (RLS),
// así que aquí solo hacemos consultas.
import { createClient } from '@supabase/supabase-js';
import { hoy } from './fechas.js';

export function crearBackendSupabase(url, llave) {
  const sb = createClient(url, llave, { auth: { persistSession: true, autoRefreshToken: true } });

  const revisar = ({ data, error }) => {
    if (error) throw new Error(traducir(error.message));
    return data;
  };
  const rpc = async (fn, args) => revisar(await sb.rpc(fn, args));
  const uid = async () => (await sb.auth.getUser()).data.user?.id;

  return {
    modo: 'supabase',

    // ---------- Sesión ----------
    async obtenerSesion() {
      const { data } = await sb.auth.getSession();
      return data.session ? { usuarioId: data.session.user.id, email: data.session.user.email } : null;
    },
    alCambiarSesion(cb) {
      // setTimeout: Supabase recomienda no llamar a la base dentro de este callback.
      const { data } = sb.auth.onAuthStateChange((_e, s) =>
        setTimeout(() => cb(s ? { usuarioId: s.user.id, email: s.user.email } : null), 0),
      );
      return () => data.subscription.unsubscribe();
    },
    async entrar(email, contrasena) {
      revisar(await sb.auth.signInWithPassword({ email, password: contrasena }));
    },
    async registrar({ email, contrasena, nombre, rol }) {
      const data = revisar(
        await sb.auth.signUp({
          email,
          password: contrasena,
          options: {
            data: { nombre, rol, consentimiento: new Date().toISOString() },
            emailRedirectTo: window.location.origin,
          },
        }),
      );
      return { necesitaConfirmar: !data.session };
    },
    async salir() {
      await sb.auth.signOut();
    },
    async recuperar(email) {
      revisar(await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/nueva-contrasena' }));
    },
    async nuevaContrasena(contrasena) {
      revisar(await sb.auth.updateUser({ password: contrasena }));
    },

    // ---------- Perfil ----------
    async miPerfil() {
      const id = await uid();
      if (!id) return null;
      const p = revisar(await sb.from('perfiles').select('*').eq('id', id).maybeSingle());
      if (p && p.escuela_id && ['tutor', 'psicologo', 'admin'].includes(p.rol)) {
        const e = revisar(await sb.from('escuelas').select('nombre').eq('id', p.escuela_id).maybeSingle());
        p.escuela_nombre = e?.nombre;
      }
      return p;
    },
    async cambiarNombre(nombre) {
      const id = await uid();
      revisar(await sb.from('perfiles').update({ nombre }).eq('id', id));
    },
    unirseGrupo: (codigo) => rpc('unirse_grupo', { p_codigo: codigo }),
    unirseEscuela: (codigo) => rpc('unirse_escuela', { p_codigo: codigo }),
    crearEscuela: (nombre) => rpc('crear_escuela', { p_nombre: nombre }),
    vincularFamilia: (codigo) => rpc('vincular_familia', { p_codigo: codigo }),

    // ---------- Contenido ----------
    async temas() {
      return revisar(await sb.from('temas').select('*').order('orden'));
    },
    async tema(id) {
      return revisar(await sb.from('temas').select('*').eq('id', id).single());
    },
    async lecciones(temaId) {
      return revisar(await sb.from('lecciones').select('*').eq('tema_id', temaId).order('orden'));
    },
    async leccion(id) {
      return revisar(await sb.from('lecciones').select('*, temas(nombre, color)').eq('id', id).single());
    },
    async consejos(temaId) {
      let q = sb.from('consejos_familia').select('*').order('orden');
      if (temaId) q = q.eq('tema_id', temaId);
      return revisar(await q);
    },
    async guardarTema(t) {
      const { id, ...campos } = t;
      revisar(await sb.from('temas').update({ ...campos, actualizado_en: new Date().toISOString() }).eq('id', id));
    },
    async guardarLeccion(l) {
      const { id, temas: _t, ...campos } = l;
      campos.actualizado_en = new Date().toISOString();
      if (id) revisar(await sb.from('lecciones').update(campos).eq('id', id));
      else return revisar(await sb.from('lecciones').insert(campos).select().single());
    },
    async borrarLeccion(id) {
      revisar(await sb.from('lecciones').delete().eq('id', id));
    },
    async guardarConsejo(c) {
      const { id, ...campos } = c;
      campos.actualizado_en = new Date().toISOString();
      if (id) revisar(await sb.from('consejos_familia').update(campos).eq('id', id));
      else return revisar(await sb.from('consejos_familia').insert(campos).select().single());
    },
    async borrarConsejo(id) {
      revisar(await sb.from('consejos_familia').delete().eq('id', id));
    },

    // ---------- Alumno ----------
    miResumen: () => rpc('mi_resumen'),
    async hacerCheckin({ animo, etiquetas, pide_ayuda }) {
      const id = await uid();
      revisar(
        await sb
          .from('checkins')
          .upsert({ alumno_id: id, fecha: hoy(), animo, etiquetas, pide_ayuda }, { onConflict: 'alumno_id,fecha' }),
      );
    },
    async completarLeccion(leccionId, aciertos, total) {
      revisar(await sb.from('lecciones_completadas').insert({ leccion_id: leccionId, aciertos, total }));
    },
    async leccionesHechas() {
      const filas = revisar(await sb.from('lecciones_completadas').select('leccion_id'));
      return new Set(filas.map((f) => f.leccion_id));
    },
    async miSemana() {
      const filas = revisar(await sb.from('checkins').select('fecha, animo').order('fecha', { ascending: false }).limit(7));
      return filas;
    },
    mensajeAyuda: () => rpc('mensaje_ayuda'),
    async misGruposAlumno() {
      return revisar(await sb.from('grupos').select('id, nombre, tema_actual_id'));
    },

    // ---------- Bitácora ----------
    async misEntradas() {
      return revisar(await sb.from('bitacora').select('*').order('creado_en', { ascending: false }).limit(60));
    },
    async guardarEntrada({ texto, etiquetas }) {
      revisar(await sb.from('bitacora').insert({ texto, etiquetas: etiquetas ?? [] }));
    },
    async borrarEntrada(id) {
      revisar(await sb.from('bitacora').delete().eq('id', id));
    },

    // ---------- Familia ----------
    infoHijos: () => rpc('info_hijos'),
    rachaFamilia: () => rpc('racha_familia'),
    async platicamosHoy() {
      const filas = revisar(await sb.from('conversaciones_familia').select('fecha').eq('fecha', hoy()));
      return filas.length > 0;
    },
    async marcarPlatica() {
      const id = await uid();
      revisar(await sb.from('conversaciones_familia').upsert({ familiar_id: id, fecha: hoy() }));
    },

    // ---------- Tutor / escuela ----------
    async misGrupos() {
      const grupos = revisar(await sb.from('grupos').select('*, temas(nombre)').order('nombre'));
      const miembros = revisar(await sb.from('miembros_grupo').select('grupo_id'));
      return Promise.all(
        grupos.map(async (g) => ({
          ...g,
          tema_nombre: g.temas?.nombre,
          alumnos: miembros.filter((m) => m.grupo_id === g.id).length,
          racha: await rpc('racha_grupo', { g: g.id }),
        })),
      );
    },
    crearGrupo: (nombre) => rpc('crear_grupo', { p_nombre: nombre }),
    async grupo(id) {
      return revisar(await sb.from('grupos').select('*').eq('id', id).single());
    },
    async panelGrupo(id) {
      const [clima, etiquetas, rachas, racha_grupo, avance] = await Promise.all([
        rpc('clima_grupo', { g: id, dias: 7 }),
        rpc('etiquetas_grupo', { g: id, dias: 7 }),
        rpc('rachas_grupo', { g: id }),
        rpc('racha_grupo', { g: id }),
        rpc('avance_grupo', { g: id }),
      ]);
      return { clima, etiquetas, rachas, racha_grupo, avance };
    },
    async cambiarTema(grupoId, temaId) {
      revisar(await sb.from('grupos').update({ tema_actual_id: temaId }).eq('id', grupoId));
    },
    async renombrarGrupo(grupoId, nombre) {
      revisar(await sb.from('grupos').update({ nombre }).eq('id', grupoId));
    },
    invitar: (grupoId, correos) => rpc('invitar_alumnos', { g: grupoId, correos }),
    async invitacionesPendientes(grupoId) {
      return revisar(await sb.from('invitaciones').select('*').eq('grupo_id', grupoId).order('email'));
    },
    async quitarAlumno(grupoId, alumnoId) {
      revisar(await sb.from('miembros_grupo').delete().eq('grupo_id', grupoId).eq('alumno_id', alumnoId));
    },
    async alertas() {
      return revisar(
        await sb.from('alertas').select('*, perfiles!alertas_alumno_id_fkey(nombre)').order('creada_en', { ascending: false }).limit(100),
      ).map((a) => ({ ...a, alumno_nombre: a.perfiles?.nombre }));
    },
    async atenderAlerta(id, nota) {
      const yo = await uid();
      revisar(
        await sb
          .from('alertas')
          .update({ atendida: true, nota, atendida_por: yo, atendida_en: new Date().toISOString() })
          .eq('id', id),
      );
    },
    async miEscuela() {
      const p = await this.miPerfil();
      if (!p?.escuela_id) return null;
      return revisar(await sb.from('escuelas').select('*').eq('id', p.escuela_id).maybeSingle());
    },
    async guardarEscuela(id, cambios) {
      revisar(await sb.from('escuelas').update(cambios).eq('id', id));
    },
    resumenEscuela: () => rpc('resumen_escuela'),
  };
}

function traducir(msg) {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (m.includes('email not confirmed')) return 'Confirma tu correo: te enviamos un enlace al registrarte.';
  if (m.includes('user already registered')) return 'Ya existe una cuenta con ese correo.';
  if (m.includes('password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (m.includes('rate limit')) return 'Demasiados intentos. Espera unos minutos.';
  if (m.includes('row-level security') || m.includes('permission denied')) return 'No tienes permiso para hacer esto.';
  if (m.includes('failed to fetch')) return 'No hay conexión. Revisa tu internet.';
  return msg;
}
