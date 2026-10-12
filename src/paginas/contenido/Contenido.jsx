import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { Aviso, Cargando, Encabezado, useDatos } from '../../componentes/Ui.jsx';

export default function Contenido() {
  const { datos, cargando, error } = useDatos(async () => {
    const temas = await api.temas();
    return Promise.all(temas.map(async (t) => {
      const [lecciones, consejos] = await Promise.all([api.lecciones(t.id), api.consejos(t.id)]);
      const piezas = [t, ...lecciones, ...consejos];
      return { ...t, nLecciones: lecciones.length, nConsejos: consejos.length, pendientes: piezas.filter((p) => p.estado !== 'aprobado').length };
    }));
  }, []);
  if (cargando) return <div className="contenido"><Cargando /></div>;
  if (error) return <div className="contenido"><Aviso>{error}</Aviso></div>;
  const totalPend = datos.reduce((n, t) => n + t.pendientes, 0);
  return (
    <div className="contenido ancho">
      <Encabezado titulo="Panel de contenido" subtitulo="Equipo treselefantes" />
      <div className="aviso info">
        Aquí se revisa y aprueba lo que ven alumnos y familias. El contenido base es una propuesta: edítalo o reemplázalo con los recursos aprobados por treselefantes.
        {totalPend > 0 && <> Hay <b>{totalPend}</b> piezas pendientes de aprobar.</>}
      </div>
      <div className="rejilla-auto">
        {datos.map((t) => (
          <Link key={t.id} to={`/contenido/tema/${t.id}`} className="tarjeta tema-tarjeta">
            <div className="franja" style={{ background: t.color }} />
            <div className="fila entre"><h3 style={{ color: t.color }}>{t.nombre}</h3></div>
            <span className="tenue chico">Familias: {t.nombre_familia}</span>
            <div className="fila-envuelve">
              <span className="pildora gris">{t.nLecciones} lecciones</span>
              <span className="pildora gris">{t.nConsejos} consejos</span>
              {t.pendientes > 0 ? <span className="pildora naranja">{t.pendientes} pendientes</span> : <span className="pildora">Todo aprobado</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
