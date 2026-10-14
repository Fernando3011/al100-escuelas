import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { hoy } from '../../api/fechas.js';
import { useSesion } from '../../estado/Sesion.jsx';
import { Avatar } from '../../componentes/Avatar.jsx';
import { Icono } from '../../componentes/Iconos.jsx';
import { Aviso, Cargando, Racha, dias, useAccion, useDatos } from '../../componentes/Ui.jsx';
import { FRASES } from '../../datos/contenido.js';
import { VincularHijo } from '../Perfil.jsx';

// Número estable por día para rotar consejos y frases.
const diaDelAno = () => {
  const [a, m, d] = hoy().split('-').map(Number);
  return Math.floor((Date.UTC(a, m - 1, d) - Date.UTC(a, 0, 0)) / 86400000);
};

export function ConsejoTarjeta({ consejo }) {
  return (
    <div className="pila">
      <h2 style={{ fontSize: 22 }}>{consejo.titulo}</h2>
      {consejo.evita && <p style={{ textDecoration: 'line-through', opacity: 0.75 }}>{consejo.evita}</p>}
      <div style={{ background: 'var(--verde-oscuro)', borderRadius: 16, padding: 14, fontWeight: 700, fontSize: 16 }}>{consejo.prueba}</div>
    </div>
  );
}

const recortar = (t, n = 150) => (t && t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t);

// Lo que el alumno aprendió en los últimos 7 días: lecciones e idea clave.
// Nunca muestra ánimo, respuestas ni bitácora.
function LoQueAprendio({ hijo }) {
  const lista = hijo.aprendio ?? [];
  const nombre = hijo.nombre.split(' ')[0];
  return (
    <div className="pila" style={{ borderTop: '1px solid var(--borde)', paddingTop: 12 }}>
      <div className="fila entre">
        <span className="etiqueta">Lo que aprendió esta semana</span>
        <span className="pildora">{lista.length} {lista.length === 1 ? 'lección' : 'lecciones'}</span>
      </div>
      {lista.length === 0 ? (
        <p className="tenue chico">{nombre} todavía no completa lecciones esta semana. Cuando lo haga, aquí verás la idea clave de cada una.</p>
      ) : (
        <>
          {lista.map((l) => (
            <div key={l.leccion_id} style={{ borderLeft: `4px solid ${l.color}`, paddingLeft: 12 }} className="pila-chica">
              <span className="chico" style={{ fontWeight: 800, color: l.color }}>{l.tema} · {l.titulo}</span>
              {l.idea_titulo && <span style={{ fontWeight: 800 }}>{l.idea_titulo}</span>}
              {l.idea_texto && <span className="tenue chico">{recortar(l.idea_texto)}</span>}
            </div>
          ))}
          <div className="aviso info chico">
            <b>Para platicarlo:</b> “Vi que aprendiste sobre {lista[0].titulo.toLowerCase()}. ¿Me cuentas qué fue lo que más te sirvió?”
          </div>
        </>
      )}
    </div>
  );
}

export default function InicioFamilia() {
  const { perfil } = useSesion();
  const marcar = useAccion();
  const datos = useDatos(async () => {
    const [hijosBase, racha, platicamos, temas] = await Promise.all([api.infoHijos(), api.rachaFamilia(), api.platicamosHoy(), api.temas()]);
    const hijos = await Promise.all(hijosBase.map(async (h) => ({ ...h, aprendio: await api.aprendizajeHijo(h.alumno_id) })));
    const temaId = hijos.find((h) => h.tema_id)?.tema_id ?? temas[diaDelAno() % temas.length].id;
    const consejos = await api.consejos(temaId);
    const tema = temas.find((t) => t.id === temaId);
    return { hijos, racha, platicamos, tema, consejo: consejos[diaDelAno() % Math.max(consejos.length, 1)] };
  }, []);

  if (datos.cargando) return <div className="contenido"><Cargando /></div>;
  if (datos.error) return <div className="contenido"><Aviso>{datos.error}</Aviso></div>;
  const { hijos, racha, platicamos, tema, consejo } = datos.datos;
  const nombre = (perfil.nombre || '').split(' ')[0];
  const hijo = hijos[0];

  return (
    <div className="contenido">
      <div className="fila entre" style={{ flexWrap: 'wrap' }}>
        <div className="fila">
          <Avatar rol={perfil.rol} tamano={60} />
          <div className="pila-chica" style={{ gap: 0 }}>
            <span className="tenue chico">Espacio para familias</span>
            <h1>Hola{nombre ? `, ${nombre}` : ''}</h1>
          </div>
        </div>
        <Racha tipo="propia" rotulo="Racha familiar" dias={racha} />
      </div>

      {hijos.length === 0 && (
        <div className="tarjeta durazno">
          <span className="etiqueta">Vincula a tu hijo/a</span>
          <p>Así verás qué tema trabajan en su tutoría y te llegarán consejos sobre ese tema.</p>
          <VincularHijo alVincular={datos.recargar} />
        </div>
      )}

      {consejo && (
        <div className="tarjeta verde">
          <span className="etiqueta">Consejo del día · crianza respetuosa</span>
          <ConsejoTarjeta consejo={consejo} />
          <Link to={`/familia/tema/${tema.id}`} className="boton blanco chico" style={{ alignSelf: 'flex-start' }}>Más sobre {tema.nombre_familia}</Link>
        </div>
      )}

      {hijos.map((h) => (
        <div key={h.alumno_id} className="tarjeta">
          <div className="fila">
            <Avatar rol="alumno" expresion="feliz" tamano={44} />
            <div className="pila-chica crece" style={{ gap: 0 }}>
              <span className="etiqueta" style={{ color: 'var(--texto-2)' }}>{h.grupo ? `Esta semana en ${h.grupo}` : 'Aún sin grupo'}</span>
              <span style={{ fontSize: 16 }}>
                {h.tema ? <><b>{h.nombre}</b> está aprendiendo sobre <b>{h.tema}</b>.</> : <><b>{h.nombre}</b> todavía no se une a su grupo.</>}
              </span>
            </div>
          </div>
          <div className="fila chico tenue"><Icono.Fuego width={18} height={18} style={{ color: 'var(--naranja)' }} /> Racha de {h.nombre.split(' ')[0]}: <b style={{ color: 'var(--naranja-texto)' }}>{dias(h.racha)}</b></div>
          <LoQueAprendio hijo={h} />
        </div>
      ))}

      {consejo?.pregunta && (
        <div className="tarjeta durazno">
          <span className="etiqueta">Pregunta para la cena</span>
          <h2>“{consejo.pregunta}”</h2>
          <p className="chico" style={{ color: '#6b4a30' }}>Escucha sin corregir. Al terminar, márcalo para sumar a tu racha familiar.</p>
          <Aviso>{marcar.error}</Aviso>
          {platicamos ? (
            <span className="pildora" style={{ alignSelf: 'flex-start' }}><Icono.Check width={14} height={14} /> Hoy ya platicaron</span>
          ) : (
            <button className="boton naranja" disabled={marcar.ocupado} onClick={() => marcar.ejecutar(async () => { await api.marcarPlatica(); datos.recargar(); })}>
              Ya platicamos hoy
            </button>
          )}
        </div>
      )}

      <div className="tarjeta borde">
        <span className="etiqueta" style={{ color: 'var(--texto-2)' }}>Frase del día</span>
        <p style={{ fontSize: 18, fontWeight: 800 }}>“{FRASES[diaDelAno() % FRASES.length]}”</p>
      </div>

      {hijo && (
        <p className="tenue chico centro">Ves los temas y la racha de tu hijo/a. Su ánimo diario y su bitácora son privados.</p>
      )}
    </div>
  );
}
