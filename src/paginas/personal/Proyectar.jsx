import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/index.js';
import { Avatar } from '../../componentes/Avatar.jsx';
import { Icono } from '../../componentes/Iconos.jsx';
import { Aviso, Cargando, dias, useDatos } from '../../componentes/Ui.jsx';
import { Clima } from './Grupo.jsx';

// Vista para proyectar en el salón: código, racha grupal, clima y dinámica.
// No muestra nombres de alumnos.
export default function Proyectar() {
  const { id } = useParams();
  const { datos, cargando, error } = useDatos(async () => {
    const [grupo, panel, temas] = await Promise.all([api.grupo(id), api.panelGrupo(id), api.temas()]);
    return { grupo, panel, tema: temas.find((t) => t.id === grupo.tema_actual_id) };
  }, [id]);
  if (cargando) return <Cargando />;
  if (error) return <div className="contenido"><Aviso>{error}</Aviso></div>;
  const { grupo, panel, tema } = datos;
  return (
    <div className="proyector">
      <div className="fila entre" style={{ flexWrap: 'wrap', gap: 20 }}>
        <div className="fila" style={{ gap: 20 }}>
          <Avatar rol="alumno" expresion="racha" tamano={110} />
          <div className="pila-chica">
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--verde-claro)' }}>al100 Escuelas · Grupo {grupo.nombre}</span>
            <span style={{ fontSize: 56, fontWeight: 900, lineHeight: 1 }}>Racha: {dias(panel.racha_grupo)}</span>
          </div>
        </div>
        <div className="pila-chica" style={{ alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--verde-claro)' }}>Únete con el código</span>
          <span className="codigo">{grupo.codigo}</span>
        </div>
      </div>
      {tema && (
        <div style={{ background: 'var(--verde-oscuro)', borderRadius: 28, padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--verde-claro)' }}>HOY · {tema.nombre.toUpperCase()}</span>
          <span style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.1 }}>{tema.dinamica_titulo}</span>
          <span style={{ fontSize: 24, lineHeight: 1.45, maxWidth: 1100 }}>{tema.dinamica_texto}</span>
        </div>
      )}
      <div style={{ background: '#fff', color: 'var(--texto)', borderRadius: 28, padding: 28, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 18 }}>
        <span style={{ fontSize: 22, fontWeight: 900 }}>¿Cómo llegamos esta semana?</span>
        <Clima clima={panel.clima} />
      </div>
      <Link to={`/grupo/${id}`} className="boton blanco" style={{ alignSelf: 'flex-start' }}><Icono.X /> Salir de la proyección</Link>
    </div>
  );
}
