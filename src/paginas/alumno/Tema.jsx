import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/index.js';
import { Icono } from '../../componentes/Iconos.jsx';
import { Aviso, Cargando, useDatos } from '../../componentes/Ui.jsx';

// Camino estilo Duolingo: lecciones hechas, la siguiente y las que faltan.
export function RutaLecciones({ lecciones, hechas, color }) {
  const siguiente = lecciones.find((l) => !hechas.has(l.id));
  return (
    <div className="ruta">
      {lecciones.map((l) => {
        const hecha = hechas.has(l.id);
        const esSig = siguiente?.id === l.id;
        const estado = hecha ? 'hecha' : esSig ? 'siguiente' : 'bloqueada';
        const contenido = (
          <>
            <span className="bola" style={hecha ? { background: color } : undefined}>
              {hecha ? <Icono.Check width={26} height={26} /> : esSig ? <Icono.Play width={30} height={30} /> : <Icono.Candado width={22} height={22} />}
            </span>
            <span className="pila-chica" style={{ gap: 0 }}>
              <span className="titulo">{l.titulo}</span>
              <span className="tenue chico">{hecha ? 'Repasar' : esSig ? 'Empezar · 3 min' : 'Después de la anterior'}</span>
            </span>
          </>
        );
        return estado === 'bloqueada' ? (
          <div key={l.id} className={`nodo ${estado}`} aria-disabled="true">{contenido}</div>
        ) : (
          <Link key={l.id} to={`/alumno/leccion/${l.id}`} className={`nodo ${estado}`}>{contenido}</Link>
        );
      })}
      {!siguiente && lecciones.length > 0 && <p className="tenue chico">¡Completaste este tema! Puedes repasar cualquier lección.</p>}
    </div>
  );
}

export default function TemaAlumno() {
  const { id } = useParams();
  const { datos, cargando, error } = useDatos(async () => {
    const [tema, lecciones, hechas] = await Promise.all([api.tema(id), api.lecciones(id), api.leccionesHechas()]);
    return { tema, lecciones, hechas };
  }, [id]);
  if (cargando) return <div className="contenido"><Cargando /></div>;
  if (error) return <div className="contenido"><Aviso>{error}</Aviso></div>;
  const { tema, lecciones, hechas } = datos;
  return (
    <div className="contenido">
      <Link to="/alumno/temas" className="boton-texto" style={{ alignSelf: 'flex-start' }}><Icono.Flecha width={18} height={18} /> Temas</Link>
      <div className="tarjeta" style={{ background: tema.color, color: '#fff', boxShadow: 'none' }}>
        <h1>{tema.nombre}</h1>
        <p>{tema.descripcion}</p>
      </div>
      <RutaLecciones lecciones={lecciones} hechas={hechas} color={tema.color} />
    </div>
  );
}
