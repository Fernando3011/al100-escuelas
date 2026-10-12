import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/index.js';
import { Avatar } from '../../componentes/Avatar.jsx';
import { Icono } from '../../componentes/Iconos.jsx';
import { Aviso, Cargando, Racha, useAccion, useDatos } from '../../componentes/Ui.jsx';

export default function Leccion() {
  const { id } = useParams();
  const ir = useNavigate();
  const { datos: l, cargando, error } = useDatos(() => api.leccion(id), [id]);
  const [paso, setPaso] = useState(0);
  const [eleccion, setEleccion] = useState(null);
  const [comprobado, setComprobado] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const [reflexion, setReflexion] = useState('');
  const [guardarEnBitacora, setGuardarEnBitacora] = useState(true);
  const [final, setFinal] = useState(null);
  const guardado = useAccion();

  if (cargando) return <div className="contenido"><Cargando /></div>;
  if (error || !l) return <div className="contenido"><Aviso>{error ?? 'No encontramos esta lección.'}</Aviso></div>;

  const pasos = l.pasos ?? [];
  const preguntas = pasos.filter((p) => p.tipo === 'pregunta').length;
  const actual = pasos[paso];
  const color = l.temas?.color ?? 'var(--verde)';

  const terminar = () =>
    guardado.ejecutar(async () => {
      if (reflexion.trim() && guardarEnBitacora) {
        await api.guardarEntrada({ texto: `${actual?.texto ?? 'Reflexión'}\n\n${reflexion.trim()}`, etiquetas: ['Lección'] });
      }
      await api.completarLeccion(l.id, aciertos, preguntas);
      const r = await api.miResumen();
      setFinal(r);
    });

  const avanzar = () => {
    if (paso + 1 >= pasos.length) return terminar();
    setPaso(paso + 1);
    setEleccion(null);
    setComprobado(false);
  };

  const comprobar = () => {
    setComprobado(true);
    if (eleccion === actual.correcta) setAciertos((n) => n + 1);
  };

  if (final) {
    const completo = final.checkin_hoy && final.leccion_hoy;
    return (
      <div className="contenido" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 48 }}>
        <Avatar rol="alumno" expresion={completo ? 'racha' : 'feliz'} tamano={150} />
        <h1>¡Lección terminada!</h1>
        {preguntas > 0 && <p className="tenue">Acertaste {aciertos} de {preguntas}. Lo importante es lo que te llevas.</p>}
        {completo ? (
          <div style={{ width: '100%', maxWidth: 320 }}><Racha tipo="propia" rotulo="¡Tu racha sigue!" dias={final.racha} /></div>
        ) : (
          <Aviso tipo="info">Haz tu check-in de hoy para que este día cuente en tu racha.</Aviso>
        )}
        <button className="boton ancho" style={{ maxWidth: 360 }} onClick={() => ir('/alumno')}>Continuar</button>
      </div>
    );
  }

  const correcto = comprobado && eleccion === actual.correcta;

  return (
    <div className="contenido" style={{ minHeight: '100vh', paddingBottom: 110 }}>
      <div className="fila">
        <Link to="/alumno" className="boton-icono" aria-label="Salir de la lección"><Icono.X /></Link>
        <div className="barra crece" role="progressbar" aria-valuemin={0} aria-valuemax={pasos.length} aria-valuenow={paso}>
          <div style={{ width: `${(100 * paso) / Math.max(pasos.length, 1)}%` }} />
        </div>
        <span className="chico tenue" style={{ fontWeight: 800 }}>{paso + 1}/{pasos.length}</span>
      </div>

      <span className="etiqueta" style={{ color }}>{l.temas?.nombre} · {l.titulo}</span>

      {actual?.tipo === 'idea' && (
        <div className="pila" style={{ gap: 16 }}>
          <div className="fila" style={{ alignItems: 'flex-start' }}>
            <Avatar rol="alumno" tamano={64} />
            <div className="tarjeta borde crece">
              <h2>{actual.titulo}</h2>
              <p style={{ fontSize: 17 }}>{actual.texto}</p>
            </div>
          </div>
        </div>
      )}

      {actual?.tipo === 'pregunta' && (
        <div className="pila">
          <h2 style={{ fontSize: 22 }}>{actual.texto}</h2>
          <div className="pila" role="group" aria-label="Opciones">
            {actual.opciones.map((o, i) => {
              let clase = '';
              if (comprobado && i === actual.correcta) clase = 'correcta';
              else if (comprobado && i === eleccion) clase = 'incorrecta';
              return (
                <button key={i} className={`opcion ${clase}`} aria-pressed={eleccion === i} disabled={comprobado} onClick={() => setEleccion(i)}>
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {actual?.tipo === 'reflexion' && (
        <div className="pila">
          <div className="fila" style={{ alignItems: 'flex-start' }}>
            <Avatar rol="alumno" expresion="tranquilo" tamano={64} />
            <div className="tarjeta durazno crece">
              <span className="etiqueta">Para pensar</span>
              <h2>{actual.texto}</h2>
            </div>
          </div>
          <div className="campo">
            <label htmlFor="reflexion">Tu respuesta (opcional)</label>
            <textarea id="reflexion" value={reflexion} onChange={(e) => setReflexion(e.target.value)} placeholder="Escribe lo que quieras. Nadie más lo lee." />
          </div>
          <label className="casilla">
            <input type="checkbox" checked={guardarEnBitacora} onChange={(e) => setGuardarEnBitacora(e.target.checked)} />
            <span>Guardar en mi bitácora privada</span>
          </label>
        </div>
      )}

      <div style={{ flex: 1 }} />
      <Aviso>{guardado.error}</Aviso>

      {actual?.tipo === 'pregunta' && comprobado ? (
        <div className={`retro ${correcto ? 'bien' : 'mal'}`}>
          <h2>{correcto ? '¡Exacto!' : 'Casi. Esta es la idea:'}</h2>
          <p>{actual.explicacion}</p>
          <button className={`boton ${correcto ? '' : 'peligro'}`} onClick={avanzar} disabled={guardado.ocupado}>Continuar</button>
        </div>
      ) : actual?.tipo === 'pregunta' ? (
        <button className="boton ancho" disabled={eleccion === null} onClick={comprobar}>Comprobar</button>
      ) : (
        <button className="boton ancho" onClick={avanzar} disabled={guardado.ocupado}>
          {guardado.ocupado ? 'Guardando…' : paso + 1 >= pasos.length ? 'Terminar' : 'Continuar'}
        </button>
      )}
    </div>
  );
}
