import { NavLink, Outlet } from 'react-router-dom';
import { Icono } from './Iconos.jsx';
import { useSesion, esFamilia, esDireccion } from '../estado/Sesion.jsx';
import { esDemo } from '../api/index.js';

function enlaces(perfil) {
  const r = perfil.rol;
  let lista;
  if (r === 'alumno') {
    lista = [
      ['/alumno', 'Inicio', Icono.Casa],
      ['/alumno/temas', 'Temas', Icono.Brote],
      ['/bitacora', 'Bitácora', Icono.Diario],
    ];
  } else if (esFamilia(r)) {
    lista = [
      ['/familia', 'Inicio', Icono.Casa],
      ['/familia/temas', 'Temas', Icono.Brote],
      ['/bitacora', 'Bitácora', Icono.Diario],
    ];
  } else {
    lista = [
      ...(esDireccion(r) ? [['/escuela', 'Escuela', Icono.Escuela]] : []),
      ['/grupos', 'Grupos', Icono.Grupo],
      ['/alertas', 'Alertas', Icono.Campana],
    ];
  }
  if (perfil.es_editor) lista.push(['/contenido', 'Contenido', Icono.Lapiz]);
  lista.push(['/perfil', 'Yo', Icono.Persona]);
  return lista;
}

export function Marco() {
  const { perfil } = useSesion();
  return (
    <>
      {esDemo && <div className="banda-demo">Modo demo · datos de ejemplo, nada se guarda en un servidor</div>}
      <div className="app">
        <nav className="nav" aria-label="Principal">
          <div className="marca">
            <span className="marca-nombre">al100 Escuelas</span>
            <span className="marca-sub">por treselefantes</span>
          </div>
          {enlaces(perfil).map(([ruta, texto, Ic]) => (
            <NavLink key={ruta} to={ruta} end={ruta === '/alumno' || ruta === '/familia'} className={({ isActive }) => (isActive ? 'activo' : '')}>
              <Ic />
              {texto}
            </NavLink>
          ))}
        </nav>
        <main className="contenido-envoltura" style={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
