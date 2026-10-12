import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import '@fontsource/nunito/900.css';
import './estilos.css';

import { ProveedorSesion, useSesion, esFamilia } from './estado/Sesion.jsx';
import { Marco } from './componentes/Marco.jsx';
import { Cargando } from './componentes/Ui.jsx';
import Entrar from './paginas/Entrar.jsx';
import Registro from './paginas/Registro.jsx';
import Privacidad from './paginas/Privacidad.jsx';
import NuevaContrasena from './paginas/NuevaContrasena.jsx';
import Perfil from './paginas/Perfil.jsx';
import Bitacora from './paginas/Bitacora.jsx';
import InicioAlumno from './paginas/alumno/Inicio.jsx';
import TemasAlumno from './paginas/alumno/Temas.jsx';
import TemaAlumno from './paginas/alumno/Tema.jsx';
import Leccion from './paginas/alumno/Leccion.jsx';
import InicioFamilia from './paginas/familia/Inicio.jsx';
import TemasFamilia from './paginas/familia/Temas.jsx';
import TemaFamilia from './paginas/familia/Tema.jsx';
import Grupos from './paginas/personal/Grupos.jsx';
import Grupo from './paginas/personal/Grupo.jsx';
import Proyectar from './paginas/personal/Proyectar.jsx';
import Alertas from './paginas/personal/Alertas.jsx';
import Escuela from './paginas/personal/Escuela.jsx';
import Contenido from './paginas/contenido/Contenido.jsx';
import EditarTema from './paginas/contenido/EditarTema.jsx';

function inicioDe(perfil) {
  if (perfil.rol === 'alumno') return '/alumno';
  if (esFamilia(perfil.rol)) return '/familia';
  if (perfil.rol === 'tutor') return '/grupos';
  return '/escuela';
}

function Protegida({ children, roles }) {
  const { sesion, perfil } = useSesion();
  const ubic = useLocation();
  if (sesion === undefined) return <Cargando />;
  if (!sesion) return <Navigate to="/entrar" replace state={{ desde: ubic.pathname }} />;
  if (!perfil) return <div className="contenido"><Cargando texto="Preparando tu cuenta…" /></div>;
  if (roles && !roles.includes(perfil.rol)) return <Navigate to={inicioDe(perfil)} replace />;
  return children;
}

function Raiz() {
  const { sesion, perfil } = useSesion();
  if (sesion === undefined) return <Cargando />;
  if (!sesion) return <Navigate to="/entrar" replace />;
  if (!perfil) return <Cargando texto="Preparando tu cuenta…" />;
  return <Navigate to={inicioDe(perfil)} replace />;
}

function SoloEditor({ children }) {
  const { perfil } = useSesion();
  return perfil?.es_editor ? children : <Navigate to="/" replace />;
}

const ALUMNO = ['alumno'];
const FAMILIA = ['padre', 'madre'];
const PERSONAL = ['tutor', 'psicologo', 'admin'];
const DIRECCION = ['psicologo', 'admin'];

function App() {
  return (
    <Routes>
      <Route path="/" element={<Raiz />} />
      <Route path="/entrar" element={<Entrar />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/privacidad" element={<Privacidad />} />
      <Route path="/nueva-contrasena" element={<NuevaContrasena />} />

      <Route path="/alumno/leccion/:id" element={<Protegida roles={ALUMNO}><Leccion /></Protegida>} />
      <Route path="/grupo/:id/proyectar" element={<Protegida roles={PERSONAL}><Proyectar /></Protegida>} />

      <Route element={<Protegida><Marco /></Protegida>}>
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/bitacora" element={<Protegida roles={[...ALUMNO, ...FAMILIA]}><Bitacora /></Protegida>} />
        <Route path="/alumno" element={<Protegida roles={ALUMNO}><InicioAlumno /></Protegida>} />
        <Route path="/alumno/temas" element={<Protegida roles={ALUMNO}><TemasAlumno /></Protegida>} />
        <Route path="/alumno/tema/:id" element={<Protegida roles={ALUMNO}><TemaAlumno /></Protegida>} />
        <Route path="/familia" element={<Protegida roles={FAMILIA}><InicioFamilia /></Protegida>} />
        <Route path="/familia/temas" element={<Protegida roles={FAMILIA}><TemasFamilia /></Protegida>} />
        <Route path="/familia/tema/:id" element={<Protegida roles={FAMILIA}><TemaFamilia /></Protegida>} />
        <Route path="/grupos" element={<Protegida roles={PERSONAL}><Grupos /></Protegida>} />
        <Route path="/grupo/:id" element={<Protegida roles={PERSONAL}><Grupo /></Protegida>} />
        <Route path="/alertas" element={<Protegida roles={PERSONAL}><Alertas /></Protegida>} />
        <Route path="/escuela" element={<Protegida roles={DIRECCION}><Escuela /></Protegida>} />
        <Route path="/contenido" element={<SoloEditor><Contenido /></SoloEditor>} />
        <Route path="/contenido/tema/:id" element={<SoloEditor><EditarTema /></SoloEditor>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProveedorSesion>
        <App />
      </ProveedorSesion>
    </BrowserRouter>
  </React.StrictMode>,
);
