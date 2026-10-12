import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/index.js';
import { Icono } from '../../componentes/Iconos.jsx';
import { Aviso, Cargando, useDatos } from '../../componentes/Ui.jsx';

export default function TemaFamilia() {
  const { id } = useParams();
  const { datos, cargando, error } = useDatos(async () => {
    const [tema, consejos, lecciones] = await Promise.all([api.tema(id), api.consejos(id), api.lecciones(id)]);
    return { tema, consejos, lecciones };
  }, [id]);
  if (cargando) return <div className="contenido"><Cargando /></div>;
  if (error) return <div className="contenido"><Aviso>{error}</Aviso></div>;
  const { tema, consejos, lecciones } = datos;
  return (
    <div className="contenido">
      <Link to="/familia/temas" className="boton-texto" style={{ alignSelf: 'flex-start' }}><Icono.Flecha width={18} height={18} /> Temas</Link>
      <div className="tarjeta" style={{ background: tema.color, color: '#fff', boxShadow: 'none' }}>
        <h1>{tema.nombre_familia}</h1>
        <p>{tema.descripcion_familia}</p>
      </div>

      {consejos.map((c) => (
        <div key={c.id} className="tarjeta">
          <h2>{c.titulo}</h2>
          {c.evita && (
            <div className="pila-chica">
              <span className="etiqueta" style={{ color: 'var(--rojo)' }}>En lugar de</span>
              <p style={{ textDecoration: 'line-through', color: 'var(--texto-2)' }}>{c.evita}</p>
            </div>
          )}
          <div className="pila-chica">
            <span className="etiqueta">Prueba con</span>
            <p style={{ fontWeight: 700, fontSize: 17 }}>{c.prueba}</p>
          </div>
          {c.pregunta && (
            <div className="aviso info">
              <b>Para platicar:</b> “{c.pregunta}”
            </div>
          )}
        </div>
      ))}

      <div className="tarjeta menta">
        <span className="etiqueta">Lo que aprenden los alumnos</span>
        <p>En la tutoría este tema se llama <b>“{tema.nombre}”</b>. Las lecciones son:</p>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {lecciones.map((l) => <li key={l.id}>{l.titulo}</li>)}
        </ul>
      </div>
    </div>
  );
}
