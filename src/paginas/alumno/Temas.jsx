import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { Aviso, Cargando, Encabezado, useDatos } from '../../componentes/Ui.jsx';

export default function TemasAlumno() {
  const { datos, cargando, error } = useDatos(async () => {
    const [temas, hechas] = await Promise.all([api.temas(), api.leccionesHechas()]);
    const conLecciones = await Promise.all(temas.map(async (t) => ({ ...t, lecciones: await api.lecciones(t.id) })));
    return { temas: conLecciones, hechas };
  }, []);
  if (cargando) return <div className="contenido"><Cargando /></div>;
  if (error) return <div className="contenido"><Aviso>{error}</Aviso></div>;
  return (
    <div className="contenido">
      <Encabezado titulo="Temas" subtitulo="Explora a tu ritmo" />
      <div className="rejilla-auto">
        {datos.temas.map((t) => {
          const hechas = t.lecciones.filter((l) => datos.hechas.has(l.id)).length;
          return (
            <Link key={t.id} to={`/alumno/tema/${t.id}`} className="tarjeta tema-tarjeta">
              <div className="franja" style={{ background: t.color }} />
              <h3 style={{ color: t.color }}>{t.nombre}</h3>
              <p className="tenue chico">{t.descripcion}</p>
              <div className="fila" style={{ gap: 8 }}>
                <div className="barra crece" aria-hidden="true"><div style={{ width: `${(100 * hechas) / Math.max(t.lecciones.length, 1)}%`, background: t.color }} /></div>
                <span className="chico" style={{ fontWeight: 800 }}>{hechas}/{t.lecciones.length}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
