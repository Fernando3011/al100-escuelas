import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { Aviso, Cargando, Encabezado, useDatos } from '../../componentes/Ui.jsx';

export default function TemasFamilia() {
  const { datos, cargando, error } = useDatos(() => api.temas(), []);
  if (cargando) return <div className="contenido"><Cargando /></div>;
  if (error) return <div className="contenido"><Aviso>{error}</Aviso></div>;
  return (
    <div className="contenido">
      <Encabezado titulo="Menú de soluciones directas" subtitulo="Temas para familias" />
      <div className="rejilla-auto">
        {datos.map((t) => (
          <Link key={t.id} to={`/familia/tema/${t.id}`} className="tarjeta tema-tarjeta">
            <div className="franja" style={{ background: t.color }} />
            <h3 style={{ color: t.color }}>{t.nombre_familia}</h3>
            <p className="tenue chico">{t.descripcion_familia}</p>
            <span className="chico" style={{ fontWeight: 800, color: 'var(--verde)' }}>Ver consejos</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
