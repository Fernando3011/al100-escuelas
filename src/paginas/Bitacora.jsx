import { useState } from 'react';
import { api } from '../api/index.js';
import { diaCorto, fechaBonita, hoy, sumarDias } from '../api/fechas.js';
import { useSesion } from '../estado/Sesion.jsx';
import { Icono } from '../componentes/Iconos.jsx';
import { Aviso, Cargando, Encabezado, animoInfo, useAccion, useDatos } from '../componentes/Ui.jsx';
import { ETIQUETAS } from '../datos/contenido.js';

const PROMPTS_ALUMNO = ['Hoy, algo que me hizo sentir bien fue…', 'Algo que me preocupa es…', 'Hoy aprendí de mí que…', 'Me gustaría que mañana…'];
const PROMPTS_FAMILIA = ['Hoy, como mamá/papá, me sentí…', 'Algo que me salió bien con mi hijo/a fue…', 'Lo que más me pesa hoy es…', 'Quiero intentar diferente…'];

function Semana() {
  const { datos } = useDatos(() => api.miSemana(), []);
  if (!datos) return null;
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(hoy(), i - 6));
  return (
    <div className="tarjeta">
      <span className="etiqueta" style={{ color: 'var(--texto-2)' }}>Tu semana</span>
      <div className="barras-semana" role="img" aria-label="Ánimo de los últimos 7 días">
        {dias.map((f) => {
          const c = datos.find((x) => x.fecha === f);
          const a = c && animoInfo(c.animo);
          return (
            <div className="col" key={f} title={a ? `${f}: ${a.nombre}` : `${f}: sin check-in`}>
              <div className="b" style={{ height: a ? `${(6 - c.animo) * 13 + 8}px` : 6, background: a ? a.color : 'var(--borde)' }} />
              <span className="chico tenue" style={{ fontWeight: f === hoy() ? 900 : 700 }}>{diaCorto(f)[0]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Bitacora() {
  const { perfil } = useSesion();
  const esAlumno = perfil.rol === 'alumno';
  const prompts = esAlumno ? PROMPTS_ALUMNO : PROMPTS_FAMILIA;
  const [prompt, setPrompt] = useState(0);
  const [seguimiento, setSeguimiento] = useState(null); // entrada pasada a la que se responde
  const [texto, setTexto] = useState('');
  const [etiquetas, setEtiquetas] = useState([]);
  const entradas = useDatos(() => api.misEntradas(), []);
  const { ocupado, error, ejecutar } = useAccion();

  // Continuidad: retomar algo que escribiste hace 2 a 7 días.
  const yaSeguidoHoy = entradas.datos?.some((e) => e.fecha === hoy() && e.etiquetas?.includes('Seguimiento'));
  const pendiente = !yaSeguidoHoy && entradas.datos?.find((e) => e.fecha <= sumarDias(hoy(), -2) && e.fecha >= sumarDias(hoy(), -7) && !e.etiquetas?.includes('Seguimiento'));
  const resumenDe = (t) => {
    const partes = t.split('\n\n');
    const cuerpo = (partes.length > 1 ? partes.slice(1).join(' ') : t).trim();
    return cuerpo.length > 140 ? cuerpo.slice(0, 140) + '…' : cuerpo;
  };
  const encabezado = seguimiento ? `Sobre lo que escribiste el ${fechaBonita(seguimiento.fecha)}: ¿cómo te fue?` : prompts[prompt];

  const guardar = () =>
    ejecutar(async () => {
      const ets = seguimiento ? [...new Set([...etiquetas, 'Seguimiento'])] : etiquetas;
      await api.guardarEntrada({ texto: `${encabezado}\n\n${texto.trim()}`, etiquetas: ets });
      setTexto('');
      setEtiquetas([]);
      setSeguimiento(null);
      entradas.recargar();
    });

  return (
    <div className="contenido">
      <Encabezado titulo="Mi bitácora" subtitulo={fechaBonita(hoy())}>
        <span className="pildora gris"><Icono.Candado width={14} height={14} /> Solo tú la lees</span>
      </Encabezado>

      {esAlumno && <Semana />}

      {pendiente && !seguimiento && (
        <div className="tarjeta durazno">
          <span className="etiqueta">Seguimiento · {fechaBonita(pendiente.fecha)}</span>
          <p style={{ fontStyle: 'italic' }}>“{resumenDe(pendiente.texto)}”</p>
          <p style={{ fontWeight: 800 }}>¿Cómo te fue? ¿Cambió lo que sentías?</p>
          <button className="boton naranja" style={{ alignSelf: 'flex-start' }} onClick={() => { setSeguimiento(pendiente); document.getElementById('entrada')?.focus(); }}>
            Responder
          </button>
        </div>
      )}

      <div className="tarjeta">
        {seguimiento ? (
          <div className="fila entre">
            <span className="pildora naranja">Respondiendo a tu entrada del {fechaBonita(seguimiento.fecha)}</span>
            <button className="boton-texto" onClick={() => setSeguimiento(null)}>Cancelar</button>
          </div>
        ) : (
          <div className="fila-envuelve">
            {prompts.map((p, i) => (
              <button key={p} className="chip" aria-pressed={prompt === i} onClick={() => setPrompt(i)}>{p.replace('…', '')}</button>
            ))}
          </div>
        )}
        <div className="campo">
          <label htmlFor="entrada">{encabezado}</label>
          <textarea id="entrada" value={texto} onChange={(e) => setTexto(e.target.value)} />
        </div>
        <div className="fila-envuelve">
          {ETIQUETAS.map((e) => (
            <button key={e} className="chip" aria-pressed={etiquetas.includes(e)} onClick={() => setEtiquetas((xs) => (xs.includes(e) ? xs.filter((x) => x !== e) : [...xs, e]))}>{e}</button>
          ))}
        </div>
        <Aviso>{error}</Aviso>
        <button className="boton" disabled={!texto.trim() || ocupado} onClick={guardar}>{ocupado ? 'Guardando…' : 'Guardar'}</button>
        <p className="tenue chico">
          {esAlumno
            ? 'Tu bitácora es privada: ni tu tutor/a, ni psicología, ni tu familia pueden leerla.'
            : 'Tu bitácora es privada: solo tú la lees.'}
        </p>
      </div>

      <section className="pila">
        <h2>Lo que has escrito</h2>
        {entradas.cargando && <Cargando />}
        {entradas.datos?.length === 0 && <p className="tenue">Todavía no hay entradas. Lo que escribas aparecerá aquí.</p>}
        {entradas.datos?.map((e) => (
          <article key={e.id} className="tarjeta" style={{ gap: 8 }}>
            <div className="fila entre">
              <span className="etiqueta" style={{ color: 'var(--texto-2)', textTransform: 'none', letterSpacing: 0 }}>{fechaBonita(e.fecha)}</span>
              <button className="boton-icono" aria-label="Borrar entrada" onClick={() => { if (confirm('¿Borrar esta entrada?')) api.borrarEntrada(e.id).then(entradas.recargar); }}>
                <Icono.Basura width={18} height={18} />
              </button>
            </div>
            <p style={{ whiteSpace: 'pre-line' }}>{e.texto}</p>
            {e.etiquetas?.length > 0 && <div className="fila-envuelve">{e.etiquetas.map((t) => <span key={t} className="pildora gris">{t}</span>)}</div>}
          </article>
        ))}
      </section>
    </div>
  );
}
