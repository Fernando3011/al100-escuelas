import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { useSesion } from '../../estado/Sesion.jsx';
import { Avatar } from '../../componentes/Avatar.jsx';
import { Icono } from '../../componentes/Iconos.jsx';
import { Aviso, Cargando, Encabezado, useAccion, useDatos } from '../../componentes/Ui.jsx';
import { UnirseEscuela } from '../Perfil.jsx';

export default function Grupos() {
  const { perfil } = useSesion();
  const grupos = useDatos(() => api.misGrupos(), []);
  const [nombre, setNombre] = useState('');
  const crear = useAccion();

  if (!perfil.escuela_id) {
    return (
      <div className="contenido">
        <Encabezado titulo="Grupos" />
        <div className="tarjeta durazno">
          <div className="fila"><Avatar rol={perfil.rol} tamano={56} /><h2>Primero, únete a tu escuela</h2></div>
          {perfil.rol === 'admin'
            ? <p>Registra tu escuela en la sección <Link to="/escuela">Escuela</Link>.</p>
            : <UnirseEscuela alUnirse={grupos.recargar} />}
        </div>
      </div>
    );
  }

  return (
    <div className="contenido ancho">
      <Encabezado titulo={perfil.rol === 'tutor' ? 'Mis grupos' : 'Grupos de la escuela'} subtitulo={perfil.escuela_nombre} />
      {grupos.cargando && <Cargando />}
      <Aviso>{grupos.error}</Aviso>
      {grupos.datos?.length === 0 && <p className="tenue">Todavía no hay grupos. Crea el primero y comparte su código con tus alumnos.</p>}
      <div className="rejilla-auto">
        {grupos.datos?.map((g) => (
          <Link key={g.id} to={`/grupo/${g.id}`} className="tarjeta" style={{ textDecoration: 'none', color: 'var(--texto)' }}>
            <div className="fila entre">
              <h2>{g.nombre}</h2>
              <span className="codigo" style={{ fontSize: 15, padding: '4px 10px' }}>{g.codigo}</span>
            </div>
            <span className="tenue chico">Tema: <b>{g.tema_nombre ?? '—'}</b></span>
            <div className="fila chico" style={{ fontWeight: 800 }}>
              <span className="fila" style={{ gap: 4 }}><Icono.Grupo width={18} height={18} /> {g.alumnos} alumnos</span>
              <span className="fila" style={{ gap: 4, color: 'var(--verde)' }}><Icono.Fuego width={18} height={18} /> racha {g.racha ?? 0}</span>
            </div>
          </Link>
        ))}
      </div>
      <form className="tarjeta" style={{ maxWidth: 520 }} onSubmit={(e) => { e.preventDefault(); crear.ejecutar(async () => { await api.crearGrupo(nombre.trim()); setNombre(''); grupos.recargar(); }); }}>
        <h2>Crear un grupo</h2>
        <div className="campo">
          <label htmlFor="nuevo-grupo">Nombre del grupo</label>
          <div className="fila">
            <input id="nuevo-grupo" className="crece" placeholder="Ej. 2°B tutoría" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <button className="boton" disabled={!nombre.trim() || crear.ocupado}><Icono.Mas /> Crear</button>
          </div>
          <span className="ayuda">Se genera un código para que tus alumnos se unan.</span>
        </div>
        <Aviso>{crear.error}</Aviso>
      </form>
    </div>
  );
}
