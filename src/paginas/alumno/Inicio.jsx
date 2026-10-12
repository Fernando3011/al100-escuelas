import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { fechaBonita, hoy } from '../../api/fechas.js';
import { useSesion } from '../../estado/Sesion.jsx';
import { Avatar, expresionDeAnimo } from '../../componentes/Avatar.jsx';
import { Icono } from '../../componentes/Iconos.jsx';
import { Aviso, Cargando, Racha, animoInfo, useAccion, useDatos } from '../../componentes/Ui.jsx';
import { ANIMOS, ETIQUETAS } from '../../datos/contenido.js';
import { RutaLecciones } from './Tema.jsx';
import { UnirseGrupo } from '../Perfil.jsx';

function CheckIn({ actual, alGuardar }) {
  const [animo, setAnimo] = useState(actual?.animo ?? null);
  const [etiquetas, setEtiquetas] = useState(actual?.etiquetas ?? []);
  const [ayuda, setAyuda] = useState(actual?.pide_ayuda ?? false);
  const { ocupado, error, ejecutar } = useAccion();
  const alternar = (e) => setEtiquetas((xs) => (xs.includes(e) ? xs.filter((x) => x !== e) : [...xs, e]));

  return (
    <div className="tarjeta">
      <div className="pila-chica">
        <span className="etiqueta">Check-in de hoy</span>
        <h2>¿Cómo llegas hoy?</h2>
      </div>
      <div className="animos" role="group" aria-label="Tu ánimo">
        {ANIMOS.map((a) => (
          <button key={a.valor} className="animo" aria-pressed={animo === a.valor} onClick={() => setAnimo(a.valor)}>
            <span className="punto" style={{ background: a.color }} />
            {a.nombre}
          </button>
        ))}
      </div>
      {animo && (
        <>
          <div className="pila-chica">
            <span className="rotulo" style={{ fontWeight: 800, fontSize: 14 }}>¿Con qué tiene que ver? (opcional)</span>
            <div className="fila-envuelve">
              {ETIQUETAS.map((e) => (
                <button key={e} className="chip" aria-pressed={etiquetas.includes(e)} onClick={() => alternar(e)}>{e}</button>
              ))}
            </div>
          </div>
          <label className="casilla">
            <input type="checkbox" checked={ayuda} onChange={(e) => setAyuda(e.target.checked)} />
            <span><b>Me gustaría hablar con alguien de la escuela.</b> Solo avisamos que quieres platicar; nunca compartimos tu bitácora.</span>
          </label>
          <Aviso>{error}</Aviso>
          <button className="boton" disabled={ocupado} onClick={() => ejecutar(async () => { await api.hacerCheckin({ animo, etiquetas, pide_ayuda: ayuda }); alGuardar(); })}>
            {ocupado ? 'Guardando…' : 'Guardar mi check-in'}
          </button>
        </>
      )}
    </div>
  );
}

function MensajeAyuda() {
  const { datos } = useDatos(() => api.mensajeAyuda(), []);
  if (!datos) return null;
  return (
    <div className="tarjeta durazno">
      <span className="etiqueta">No estás solo/a</span>
      <p>{datos}</p>
    </div>
  );
}

export default function InicioAlumno() {
  const { perfil } = useSesion();
  const [editando, setEditando] = useState(false);
  const resumen = useDatos(() => api.miResumen(), []);
  const tema = useDatos(async () => {
    const r = resumen.datos;
    if (!r) return null;
    const temas = await api.temas();
    const t = temas.find((x) => x.id === r.tema_actual_id) ?? temas[0];
    const [lecciones, hechas] = await Promise.all([api.lecciones(t.id), api.leccionesHechas()]);
    return { tema: t, lecciones, hechas };
  }, [resumen.datos]);

  if (resumen.cargando) return <div className="contenido"><Cargando /></div>;
  if (resumen.error) return <div className="contenido"><Aviso>{resumen.error}</Aviso></div>;
  const r = resumen.datos;
  const checkin = r.checkin_hoy;
  const completo = checkin && r.leccion_hoy;
  const nombre = (perfil.nombre || '').split(' ')[0];

  return (
    <div className="contenido">
      <div className="fila entre">
        <div className="fila">
          <Avatar rol="alumno" expresion={completo ? 'racha' : expresionDeAnimo(checkin?.animo)} tamano={60} />
          <div className="pila-chica" style={{ gap: 0 }}>
            <span className="tenue chico" style={{ textTransform: 'capitalize' }}>{fechaBonita(hoy())}</span>
            <h1>Hola{nombre ? `, ${nombre}` : ''}</h1>
          </div>
        </div>
      </div>

      <div className="rejilla-2">
        <Racha tipo="propia" rotulo="Mi racha" dias={r.racha} />
        <Racha tipo="grupal" rotulo={r.grupo ? `Racha de ${r.grupo}` : 'Racha de grupo'} dias={r.racha_grupo} />
      </div>

      <div className="tarjeta borde" style={{ padding: 14 }}>
        <div className="fila entre">
          <span style={{ fontWeight: 800 }}>{completo ? '¡Día completo! Tu racha sigue viva.' : 'Para mantener tu racha hoy:'}</span>
        </div>
        <div className="fila-envuelve">
          <span className={`pildora ${checkin ? '' : 'gris'}`}>{checkin ? <Icono.Check width={14} height={14} /> : '1'} Check-in</span>
          <span className={`pildora ${r.leccion_hoy ? '' : 'gris'}`}>{r.leccion_hoy ? <Icono.Check width={14} height={14} /> : '2'} Una lección</span>
        </div>
      </div>

      {!checkin || editando ? (
        <CheckIn actual={checkin} alGuardar={() => { setEditando(false); resumen.recargar(); }} />
      ) : (
        <div className="tarjeta">
          <div className="fila entre">
            <div className="fila">
              <span className="animo-punto" style={{ width: 28, height: 28, borderRadius: '50%', background: animoInfo(checkin.animo).color, display: 'inline-block' }} />
              <div className="pila-chica" style={{ gap: 0 }}>
                <span className="etiqueta">Check-in de hoy</span>
                <span style={{ fontWeight: 800 }}>Llegaste: {animoInfo(checkin.animo).nombre}</span>
              </div>
            </div>
            <button className="boton-texto" onClick={() => setEditando(true)}>Cambiar</button>
          </div>
          {checkin.animo <= 3 && !checkin.pide_ayuda && (
            <p className="tenue chico">Gracias por contarlo. Nombrar lo que sientes ya es un paso. <Link to="/bitacora">¿Quieres escribir por qué?</Link></p>
          )}
        </div>
      )}

      {checkin && (checkin.animo >= 4 || checkin.pide_ayuda) && !editando && <MensajeAyuda />}

      {!r.grupo_id && (
        <div className="tarjeta durazno">
          <span className="etiqueta">Únete a tu grupo</span>
          <p>Escribe el código que te dio tu tutor/a para ver los temas de tu clase y sumar a la racha grupal.</p>
          <UnirseGrupo alUnirse={resumen.recargar} />
        </div>
      )}

      {tema.datos && (
        <section className="pila">
          <div className="fila entre">
            <div className="pila-chica" style={{ gap: 0 }}>
              <span className="etiqueta" style={{ color: tema.datos.tema.color }}>{r.grupo ? `Tema de ${r.grupo}` : 'Tema sugerido'}</span>
              <h2>{tema.datos.tema.nombre}</h2>
            </div>
            <Link to="/alumno/temas" className="chico" style={{ whiteSpace: 'nowrap' }}>Ver todos</Link>
          </div>
          <RutaLecciones lecciones={tema.datos.lecciones} hechas={tema.datos.hechas} color={tema.datos.tema.color} />
        </section>
      )}
    </div>
  );
}
