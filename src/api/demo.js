// Backend de DEMOSTRACIÓN: funciona sin Supabase, con datos de ejemplo
// guardados en este navegador. Sirve para presentar la app a escuelas y
// familias antes de configurar la base de datos real.
// Imita las reglas de la base de datos (rachas, privacidad, alertas).
import { TEMAS } from '../datos/contenido.js';
import { hoy, sumarDias } from './fechas.js';

const CLAVE = 'al100-demo-v1';
const espera = (ms = 120) => new Promise((r) => setTimeout(r, ms));
const nuevoId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

// Generador pseudoaleatorio con semilla, para que la demo sea igual siempre.
function azar(semilla) {
  let s = semilla;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

const NOMBRES = ['Diego R.', 'Valeria L.', 'Andrés P.', 'Camila G.', 'Mateo S.', 'Regina T.', 'Emiliano V.', 'Ximena C.', 'Santiago H.', 'Renata M.', 'Leonardo F.', 'Natalia O.', 'Sebastián D.', 'Daniela A.', 'Iker N.', 'Fernanda B.', 'Emilio Q.', 'Paula E.', 'Gael J.', 'Victoria K.', 'Rodrigo U.', 'Mariana I.', 'Alejandro Z.', 'Lucía Y.', 'Tomás W.', 'Sara X.', 'Joaquín R.'];

function semilla() {
  const r = azar(42);
  const d = {
    escuelas: [], perfiles: [], temas: [], lecciones: [], consejos: [], grupos: [], miembros: [],
    invitaciones: [], vinculos: [], checkins: [], hechas: [], bitacora: [], platicas: [], alertas: [],
    sesion: null,
  };
  const esc = { id: 'esc1', nombre: 'Secundaria Treselefantes (demo)', codigo_personal: 'DEMO2026', protocolo: { dias_consecutivos: 3, notificar_tutor: true, notificar_psicologo: true, mensaje_ayuda: 'Lo que sientes importa. Puedes hablar con tu tutor/a o con el área de psicología de tu escuela. Si sientes que estás en peligro, llama a la Línea de la Vida: 800 911 2000 (24 horas, gratis).' } };
  d.escuelas.push(esc);

  TEMAS.forEach((t, i) => {
    const tid = 'tema' + (i + 1);
    d.temas.push({ id: tid, slug: t.slug, orden: i + 1, nombre: t.nombre, nombre_familia: t.nombre_familia, descripcion: t.descripcion, descripcion_familia: t.descripcion_familia, color: t.color, dinamica_titulo: t.dinamica_titulo, dinamica_texto: t.dinamica_texto, estado: i < 2 ? 'aprobado' : 'pendiente' });
    t.lecciones.forEach((l, j) => d.lecciones.push({ id: `${tid}-l${j + 1}`, tema_id: tid, orden: j + 1, titulo: l.titulo, pasos: l.pasos, estado: i < 2 ? 'aprobado' : 'pendiente' }));
    t.consejos.forEach((c, j) => d.consejos.push({ id: `${tid}-c${j + 1}`, tema_id: tid, orden: j + 1, ...c, estado: i < 2 ? 'aprobado' : 'pendiente' }));
  });

  const p = (id, nombre, rol, extra = {}) => d.perfiles.push({ id, nombre, rol, escuela_id: 'esc1', es_editor: false, codigo_familia: null, email: id + '@demo.mx', ...extra });
  p('alumno', 'Sofía M.', 'alumno', { codigo_familia: 'SOFI26' });
  p('tutor', 'Mtro. Luis', 'tutor');
  p('psicologo', 'Psic. Carla', 'psicologo');
  p('admin', 'Dir. Ana', 'admin', { es_editor: true });
  p('madre', 'Mariana', 'madre', { escuela_id: null });
  p('padre', 'Jorge', 'padre', { escuela_id: null });
  NOMBRES.forEach((n, i) => p('al' + i, n, 'alumno', { codigo_familia: 'FAM' + i }));

  d.grupos.push({ id: 'g1', escuela_id: 'esc1', nombre: '2°B', codigo: 'ELEFAN', tutor_id: 'tutor', tema_actual_id: 'tema4' });
  d.grupos.push({ id: 'g2', escuela_id: 'esc1', nombre: '3°A', codigo: 'TROMPA', tutor_id: 'tutor', tema_actual_id: 'tema5' });
  d.miembros.push({ grupo_id: 'g1', alumno_id: 'alumno' });
  NOMBRES.forEach((_, i) => d.miembros.push({ grupo_id: i < 20 ? 'g1' : 'g2', alumno_id: 'al' + i }));
  d.vinculos.push({ familiar_id: 'madre', alumno_id: 'alumno' }, { familiar_id: 'padre', alumno_id: 'alumno' });

  const h = hoy();
  // Sofía: racha de 12 días hasta ayer (hoy le toca a quien prueba la demo).
  for (let k = 1; k <= 12; k++) {
    const f = sumarDias(h, -k);
    d.checkins.push({ alumno_id: 'alumno', fecha: f, animo: [2, 1, 3, 2, 4, 4, 3, 2, 2, 1, 3, 2][k - 1], etiquetas: ['Escuela'], pide_ayuda: false });
    d.hechas.push({ alumno_id: 'alumno', leccion_id: k <= 2 ? `tema4-l${3 - k}` : 'tema3-l1', fecha: f, aciertos: 2, total: 2 });
  }
  // El resto del grupo: constancia variada.
  NOMBRES.forEach((_, i) => {
    const constancia = 0.55 + r() * 0.45;
    const base = 1 + Math.floor(r() * 3);
    for (let k = 0; k <= 13; k++) {
      if (r() > constancia) continue;
      const f = sumarDias(h, -k);
      let animo = Math.min(5, Math.max(1, base + Math.round((r() - 0.45) * 3)));
      if (i === 2 || i === 7) animo = k < 3 ? 4 + (k % 2) : animo; // dos con ánimo bajo seguido
      const et = ['Escuela', 'Familia', 'Amistades', 'Yo', 'Salud', 'Redes'].filter(() => r() < 0.3);
      d.checkins.push({ alumno_id: 'al' + i, fecha: f, animo, etiquetas: et.length ? et : ['Escuela'], pide_ayuda: false });
      if (r() < 0.85) d.hechas.push({ alumno_id: 'al' + i, leccion_id: `tema4-l${1 + (k % 3)}`, fecha: f, aciertos: 2, total: 2 });
    }
  });
  d.alertas.push({ id: 1, alumno_id: 'al2', escuela_id: 'esc1', tipo: 'animo_bajo', detalle: 'Marcó "Bajo" o "Mal" 3 días seguidos.', creada_en: new Date(Date.now() - 3 * 3600e3).toISOString(), atendida: false, nota: null });
  d.alertas.push({ id: 2, alumno_id: 'al7', escuela_id: 'esc1', tipo: 'animo_bajo', detalle: 'Marcó "Bajo" o "Mal" 3 días seguidos.', creada_en: new Date(Date.now() - 26 * 3600e3).toISOString(), atendida: false, nota: null });
  d.alertas.push({ id: 3, alumno_id: 'al11', escuela_id: 'esc1', tipo: 'pide_ayuda', detalle: 'Pidió hablar con alguien desde su check-in.', creada_en: new Date(Date.now() - 5 * 86400e3).toISOString(), atendida: true, nota: 'Platicamos en psicología; seguimiento el viernes.' });
  d.bitacora.push({ id: 1, autor_id: 'alumno', fecha: sumarDias(h, -3), texto: 'Me preocupa mucho el examen de mate del viernes.', etiquetas: ['Escuela'], creado_en: new Date(Date.now() - 3 * 86400e3).toISOString() });
  d.platicas.push({ familiar_id: 'madre', fecha: sumarDias(h, -1) }, { familiar_id: 'madre', fecha: sumarDias(h, -2) }, { familiar_id: 'madre', fecha: sumarDias(h, -3) }, { familiar_id: 'madre', fecha: sumarDias(h, -4) });
  return d;
}

export function crearBackendDemo() {
  let d;
  try { d = JSON.parse(localStorage.getItem(CLAVE)); } catch { d = null; }
  if (!d || d.dia !== hoy()) {
    const sesion = d?.sesion ?? null;
    d = semilla();
    d.dia = hoy();
    d.sesion = sesion;
  }
  const oyentes = new Set();
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch { /* sin almacenamiento: sigue en memoria */ } };
  guardar();

  const yo = () => d.perfiles.find((p) => p.id === d.sesion);
  const exigir = (cond, msg) => { if (!cond) throw new Error(msg); };

  // --- Reglas (mismas que en la base de datos) ---
  const diaCompleto = (a, f) => d.checkins.some((c) => c.alumno_id === a && c.fecha === f) && d.hechas.some((x) => x.alumno_id === a && x.fecha === f);
  const racha = (cumple) => {
    let f = hoy(); let n = 0;
    if (!cumple(f)) f = sumarDias(f, -1);
    while (cumple(f)) { n++; f = sumarDias(f, -1); }
    return n;
  };
  const rachaAlumno = (a) => racha((f) => diaCompleto(a, f));
  const miembrosDe = (g) => d.miembros.filter((m) => m.grupo_id === g).map((m) => m.alumno_id);
  const rachaGrupo = (g) => {
    const m = miembrosDe(g);
    return racha((f) => m.length > 0 && d.checkins.filter((c) => c.fecha === f && m.includes(c.alumno_id)).length >= 0.75 * m.length);
  };
  const grupoDeAlumno = (a) => d.grupos.find((g) => d.miembros.some((m) => m.grupo_id === g.id && m.alumno_id === a));
  const esDireccion = () => ['psicologo', 'admin'].includes(yo()?.rol);
  const puedePanel = (g) => d.grupos.find((x) => x.id === g)?.tutor_id === d.sesion || esDireccion();
  const desde = (dias) => sumarDias(hoy(), -dias);

  const revisarAlerta = (c) => {
    const p = d.perfiles.find((x) => x.id === c.alumno_id);
    const esc = d.escuelas.find((e) => e.id === p.escuela_id);
    if (!esc) return;
    const abierta = (tipo) => d.alertas.some((a) => a.alumno_id === c.alumno_id && a.tipo === tipo && !a.atendida);
    if (c.pide_ayuda && !abierta('pide_ayuda')) {
      d.alertas.unshift({ id: Date.now(), alumno_id: c.alumno_id, escuela_id: esc.id, tipo: 'pide_ayuda', detalle: 'Pidió hablar con alguien desde su check-in.', creada_en: new Date().toISOString(), atendida: false, nota: null });
    }
    if (c.animo >= 4) {
      const dias = Math.max(1, esc.protocolo.dias_consecutivos ?? 3);
      const malos = d.checkins.filter((x) => x.alumno_id === c.alumno_id && x.fecha > sumarDias(c.fecha, -dias) && x.fecha <= c.fecha && x.animo >= 4).length;
      if (malos >= dias && !abierta('animo_bajo')) {
        d.alertas.unshift({ id: Date.now() + 1, alumno_id: c.alumno_id, escuela_id: esc.id, tipo: 'animo_bajo', detalle: `Marcó "Bajo" o "Mal" ${dias} días seguidos.`, creada_en: new Date().toISOString(), atendida: false, nota: null });
      }
    }
  };

  const api = {
    modo: 'demo',
    reiniciarDemo() { const s = d.sesion; d = semilla(); d.dia = hoy(); d.sesion = s; guardar(); },

    // ---------- Sesión ----------
    async obtenerSesion() { return d.sesion ? { usuarioId: d.sesion, email: yo()?.email } : null; },
    alCambiarSesion(cb) { oyentes.add(cb); return () => oyentes.delete(cb); },
    async entrarComo(id) {
      d.sesion = id; guardar();
      oyentes.forEach((cb) => cb({ usuarioId: id }));
    },
    async entrar() { throw new Error('En la demo usa los botones “Entrar como…”.'); },
    async registrar() { throw new Error('El registro funciona cuando la app está conectada a Supabase. En la demo usa los botones “Entrar como…”.'); },
    async salir() { d.sesion = null; guardar(); oyentes.forEach((cb) => cb(null)); },
    async recuperar() { throw new Error('No disponible en la demo.'); },
    async nuevaContrasena() { throw new Error('No disponible en la demo.'); },

    // ---------- Perfil ----------
    async miPerfil() {
      await espera(60);
      const p = yo();
      if (!p) return null;
      return { ...p, escuela_nombre: d.escuelas.find((e) => e.id === p.escuela_id)?.nombre };
    },
    async cambiarNombre(nombre) { yo().nombre = nombre; guardar(); },
    async unirseGrupo(codigo) {
      exigir(yo().rol === 'alumno', 'Solo los alumnos se unen a un grupo con código.');
      const g = d.grupos.find((x) => x.codigo === codigo.trim().toUpperCase());
      exigir(g, 'No encontramos un grupo con ese código.');
      if (!d.miembros.some((m) => m.grupo_id === g.id && m.alumno_id === d.sesion)) d.miembros.push({ grupo_id: g.id, alumno_id: d.sesion });
      yo().escuela_id ??= g.escuela_id; guardar();
      return { grupo_id: g.id, nombre: g.nombre };
    },
    async unirseEscuela(codigo) {
      const e = d.escuelas.find((x) => x.codigo_personal === codigo.trim().toUpperCase());
      exigir(e, 'No encontramos una escuela con ese código.');
      yo().escuela_id = e.id; guardar();
      return { escuela_id: e.id, nombre: e.nombre };
    },
    async crearEscuela(nombre) {
      const e = { id: nuevoId(), nombre, codigo_personal: 'NUEVA' + Math.floor(Math.random() * 900 + 100), protocolo: { ...d.escuelas[0].protocolo } };
      d.escuelas.push(e); yo().escuela_id = e.id; guardar();
      return { escuela_id: e.id, nombre, codigo_personal: e.codigo_personal };
    },
    async vincularFamilia(codigo) {
      exigir(['padre', 'madre'].includes(yo().rol), 'Solo las cuentas de papá o mamá se vinculan con este código.');
      const a = d.perfiles.find((p) => p.rol === 'alumno' && p.codigo_familia === codigo.trim().toUpperCase());
      exigir(a, 'No encontramos ese código. Pídele a tu hijo/a que lo revise en su perfil.');
      if (!d.vinculos.some((v) => v.familiar_id === d.sesion && v.alumno_id === a.id)) d.vinculos.push({ familiar_id: d.sesion, alumno_id: a.id });
      guardar();
      return { alumno_id: a.id, nombre: a.nombre };
    },

    // ---------- Contenido ----------
    async temas() { await espera(); return [...d.temas].sort((a, b) => a.orden - b.orden); },
    async tema(id) { return d.temas.find((t) => t.id === id); },
    async lecciones(temaId) { return d.lecciones.filter((l) => l.tema_id === temaId).sort((a, b) => a.orden - b.orden); },
    async leccion(id) {
      await espera();
      const l = d.lecciones.find((x) => x.id === id);
      const t = d.temas.find((x) => x.id === l?.tema_id);
      return l && { ...l, temas: { nombre: t.nombre, color: t.color } };
    },
    async consejos(temaId) { return d.consejos.filter((c) => !temaId || c.tema_id === temaId).sort((a, b) => a.orden - b.orden); },
    async guardarTema(t) { exigir(yo().es_editor, 'No tienes permiso.'); Object.assign(d.temas.find((x) => x.id === t.id), t); guardar(); },
    async guardarLeccion(l) {
      exigir(yo().es_editor, 'No tienes permiso.');
      const { temas: _t, ...campos } = l;
      if (campos.id) Object.assign(d.lecciones.find((x) => x.id === campos.id), campos);
      else { campos.id = nuevoId(); campos.estado ??= 'pendiente'; d.lecciones.push(campos); guardar(); return campos; }
      guardar();
    },
    async borrarLeccion(id) { d.lecciones = d.lecciones.filter((l) => l.id !== id); guardar(); },
    async guardarConsejo(c) {
      exigir(yo().es_editor, 'No tienes permiso.');
      if (c.id) Object.assign(d.consejos.find((x) => x.id === c.id), c);
      else { c = { ...c, id: nuevoId(), estado: c.estado ?? 'pendiente' }; d.consejos.push(c); guardar(); return c; }
      guardar();
    },
    async borrarConsejo(id) { d.consejos = d.consejos.filter((c) => c.id !== id); guardar(); },

    // ---------- Alumno ----------
    async miResumen() {
      await espera();
      const g = grupoDeAlumno(d.sesion);
      return {
        racha: rachaAlumno(d.sesion),
        grupo_id: g?.id ?? null,
        grupo: g?.nombre ?? null,
        tema_actual_id: g?.tema_actual_id ?? null,
        racha_grupo: g ? rachaGrupo(g.id) : null,
        checkin_hoy: d.checkins.find((c) => c.alumno_id === d.sesion && c.fecha === hoy()) ?? null,
        leccion_hoy: d.hechas.some((x) => x.alumno_id === d.sesion && x.fecha === hoy()),
      };
    },
    async hacerCheckin({ animo, etiquetas, pide_ayuda }) {
      exigir(yo().rol === 'alumno', 'Solo los alumnos hacen check-in.');
      let c = d.checkins.find((x) => x.alumno_id === d.sesion && x.fecha === hoy());
      if (c) Object.assign(c, { animo, etiquetas, pide_ayuda });
      else { c = { alumno_id: d.sesion, fecha: hoy(), animo, etiquetas, pide_ayuda }; d.checkins.push(c); }
      revisarAlerta(c); guardar();
    },
    async completarLeccion(leccionId, aciertos, total) {
      d.hechas.push({ alumno_id: d.sesion, leccion_id: leccionId, fecha: hoy(), aciertos, total }); guardar();
    },
    async leccionesHechas() { return new Set(d.hechas.filter((x) => x.alumno_id === d.sesion).map((x) => x.leccion_id)); },
    async miSemana() { return d.checkins.filter((c) => c.alumno_id === d.sesion).sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).slice(0, 7); },
    async mensajeAyuda() { return d.escuelas.find((e) => e.id === yo()?.escuela_id)?.protocolo.mensaje_ayuda ?? d.escuelas[0].protocolo.mensaje_ayuda; },
    async misGruposAlumno() { return d.grupos.filter((g) => d.miembros.some((m) => m.grupo_id === g.id && m.alumno_id === d.sesion)); },

    // ---------- Bitácora ----------
    async misEntradas() { await espera(); return d.bitacora.filter((b) => b.autor_id === d.sesion).sort((a, b) => (a.creado_en < b.creado_en ? 1 : -1)); },
    async guardarEntrada({ texto, etiquetas }) { d.bitacora.push({ id: Date.now(), autor_id: d.sesion, fecha: hoy(), texto, etiquetas: etiquetas ?? [], creado_en: new Date().toISOString() }); guardar(); },
    async borrarEntrada(id) { d.bitacora = d.bitacora.filter((b) => b.id !== id || b.autor_id !== d.sesion); guardar(); },

    // ---------- Familia ----------
    async infoHijos() {
      await espera();
      return d.vinculos.filter((v) => v.familiar_id === d.sesion).map((v) => {
        const a = d.perfiles.find((p) => p.id === v.alumno_id);
        const g = grupoDeAlumno(a.id);
        const t = d.temas.find((x) => x.id === g?.tema_actual_id);
        return { alumno_id: a.id, nombre: a.nombre, grupo: g?.nombre ?? null, tema_id: t?.id ?? null, tema: t?.nombre_familia ?? null, racha: rachaAlumno(a.id) };
      });
    },
    async aprendizajeHijo(a) {
      if (!d.vinculos.some((v) => v.familiar_id === d.sesion && v.alumno_id === a)) return [];
      const recientes = d.hechas.filter((x) => x.alumno_id === a && x.fecha > desde(7));
      const porLeccion = new Map();
      recientes.forEach((x) => { if (!porLeccion.has(x.leccion_id) || porLeccion.get(x.leccion_id) < x.fecha) porLeccion.set(x.leccion_id, x.fecha); });
      return [...porLeccion.entries()].map(([id, fecha]) => {
        const l = d.lecciones.find((y) => y.id === id);
        const t = d.temas.find((y) => y.id === l?.tema_id);
        const idea = l?.pasos.find((p) => p.tipo === 'idea');
        return l && { leccion_id: id, titulo: l.titulo, tema: t.nombre, color: t.color, idea_titulo: idea?.titulo ?? null, idea_texto: idea?.texto ?? null, fecha };
      }).filter(Boolean).sort((x, y) => (x.fecha < y.fecha ? 1 : -1));
    },
    async rachaFamilia() { return racha((f) => d.platicas.some((p) => p.familiar_id === d.sesion && p.fecha === f)); },
    async platicamosHoy() { return d.platicas.some((p) => p.familiar_id === d.sesion && p.fecha === hoy()); },
    async marcarPlatica() { if (!(await api.platicamosHoy())) d.platicas.push({ familiar_id: d.sesion, fecha: hoy() }); guardar(); },

    // ---------- Tutor / escuela ----------
    async misGrupos() {
      await espera();
      const p = yo();
      const visibles = d.grupos.filter((g) => g.tutor_id === p.id || (esDireccion() && g.escuela_id === p.escuela_id));
      return visibles.map((g) => ({ ...g, tema_nombre: d.temas.find((t) => t.id === g.tema_actual_id)?.nombre, alumnos: miembrosDe(g.id).length, racha: rachaGrupo(g.id) }));
    },
    async crearGrupo(nombre) {
      exigir(yo().escuela_id, 'Primero únete a tu escuela con el código del personal.');
      const g = { id: nuevoId(), escuela_id: yo().escuela_id, nombre, codigo: Math.random().toString(36).slice(2, 8).toUpperCase(), tutor_id: d.sesion, tema_actual_id: 'tema1' };
      d.grupos.push(g); guardar();
      return { grupo_id: g.id, nombre, codigo: g.codigo };
    },
    async grupo(id) { return d.grupos.find((g) => g.id === id); },
    async panelGrupo(g) {
      await espera();
      exigir(puedePanel(g), 'No tienes permiso sobre este grupo.');
      const m = miembrosDe(g);
      const recientes = d.checkins.filter((c) => m.includes(c.alumno_id) && c.fecha > desde(7));
      const distintos = new Set(recientes.map((c) => c.alumno_id)).size;
      const clima = distintos < 3 ? [] : [1, 2, 3, 4, 5].map((a) => ({ animo: a, total: recientes.filter((c) => c.animo === a).length })).filter((x) => x.total);
      const cuenta = {};
      recientes.forEach((c) => c.etiquetas.forEach((e) => { cuenta[e] = (cuenta[e] ?? 0) + 1; }));
      const etiquetas = Object.entries(cuenta).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([etiqueta, total]) => ({ etiqueta, total }));
      const rachas = m.map((a) => ({ alumno_id: a, nombre: d.perfiles.find((p) => p.id === a).nombre, racha: rachaAlumno(a), hizo_hoy: diaCompleto(a, hoy()) })).sort((a, b) => b.racha - a.racha || a.nombre.localeCompare(b.nombre));
      const gr = d.grupos.find((x) => x.id === g);
      const lecc = d.lecciones.filter((l) => l.tema_id === gr.tema_actual_id).map((l) => l.id);
      const pares = new Set(d.hechas.filter((x) => m.includes(x.alumno_id) && lecc.includes(x.leccion_id)).map((x) => x.alumno_id + x.leccion_id));
      const avance = m.length && lecc.length ? Math.round((100 * pares.size) / (m.length * lecc.length)) : 0;
      return { clima, etiquetas, rachas, racha_grupo: rachaGrupo(g), avance };
    },
    async cambiarTema(g, temaId) { d.grupos.find((x) => x.id === g).tema_actual_id = temaId; guardar(); },
    async renombrarGrupo(g, nombre) { d.grupos.find((x) => x.id === g).nombre = nombre; guardar(); },
    async invitar(g, correos) {
      let agregados = 0; let invitados = 0;
      correos.map((c) => c.trim().toLowerCase()).filter((c) => c.includes('@')).forEach((c) => {
        const p = d.perfiles.find((x) => x.email === c && x.rol === 'alumno');
        if (p) { if (!d.miembros.some((m) => m.grupo_id === g && m.alumno_id === p.id)) d.miembros.push({ grupo_id: g, alumno_id: p.id }); agregados++; }
        else if (!d.invitaciones.some((i) => i.grupo_id === g && i.email === c)) { d.invitaciones.push({ id: nuevoId(), grupo_id: g, email: c }); invitados++; }
      });
      guardar();
      return { agregados, invitados };
    },
    async invitacionesPendientes(g) { return d.invitaciones.filter((i) => i.grupo_id === g); },
    async quitarAlumno(g, a) { d.miembros = d.miembros.filter((m) => !(m.grupo_id === g && m.alumno_id === a)); guardar(); },
    async alertas() {
      await espera();
      const p = yo();
      const esc = d.escuelas.find((e) => e.id === p.escuela_id);
      return d.alertas.filter((a) => {
        if (a.escuela_id !== p.escuela_id) return false;
        if (p.rol === 'admin') return true;
        if (p.rol === 'psicologo') return esc.protocolo.notificar_psicologo !== false;
        if (p.rol === 'tutor') return esc.protocolo.notificar_tutor !== false && d.grupos.some((g) => g.tutor_id === p.id && miembrosDe(g.id).includes(a.alumno_id));
        return false;
      }).map((a) => ({ ...a, alumno_nombre: d.perfiles.find((x) => x.id === a.alumno_id)?.nombre }));
    },
    async atenderAlerta(id, nota) { Object.assign(d.alertas.find((a) => a.id === id), { atendida: true, nota, atendida_por: d.sesion, atendida_en: new Date().toISOString() }); guardar(); },
    async miEscuela() { return d.escuelas.find((e) => e.id === yo()?.escuela_id) ?? null; },
    async guardarEscuela(id, cambios) { exigir(esDireccion(), 'No tienes permiso.'); Object.assign(d.escuelas.find((e) => e.id === id), cambios); guardar(); },
    async resumenEscuela() {
      return d.grupos.filter((g) => g.escuela_id === yo().escuela_id).map((g) => ({ grupo_id: g.id, grupo: g.nombre, codigo: g.codigo, tutor: d.perfiles.find((p) => p.id === g.tutor_id)?.nombre ?? '—', alumnos: miembrosDe(g.id).length, racha: rachaGrupo(g.id) }));
    },
  };
  return api;
}
