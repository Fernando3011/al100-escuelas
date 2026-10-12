import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api, esDemo } from '../api/index.js';
import { useSesion } from '../estado/Sesion.jsx';
import { Avatar, NOMBRE_ROL } from '../componentes/Avatar.jsx';
import { Aviso, useAccion } from '../componentes/Ui.jsx';
import { Logo } from './Entrar.jsx';

const ROLES = ['alumno', 'padre', 'madre', 'tutor', 'psicologo', 'admin'];
const AYUDA = {
  alumno: 'Tu tutor/a te dará un código para entrar a tu grupo.',
  padre: 'Tu hijo/a te dará un código para vincular sus cuentas.',
  madre: 'Tu hijo/a te dará un código para vincular sus cuentas.',
  tutor: 'Tu escuela te dará el código del personal.',
  psicologo: 'Tu escuela te dará el código del personal.',
  admin: 'Podrás registrar tu escuela y compartir el código con tu personal.',
};

export default function Registro() {
  const { sesion } = useSesion();
  const [rol, setRol] = useState('alumno');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [acepto, setAcepto] = useState(false);
  const [permiso, setPermiso] = useState(false);
  const [listo, setListo] = useState(false);
  const { ocupado, error, ejecutar } = useAccion();

  if (sesion) return <Navigate to="/" replace />;
  if (esDemo) return <Navigate to="/entrar" replace />;

  const enviar = (e) => {
    e.preventDefault();
    ejecutar(async () => {
      const r = await api.registrar({ email, contrasena, nombre: nombre.trim(), rol });
      if (r.necesitaConfirmar) setListo(true);
    });
  };

  if (listo) {
    return (
      <div className="portada">
        <div className="caja">
          <div className="tarjeta centro" style={{ alignItems: 'center' }}>
            <Avatar rol={rol} expresion="feliz" tamano={110} />
            <h2>¡Revisa tu correo!</h2>
            <p className="tenue">Te enviamos un enlace a <b>{email}</b> para confirmar tu cuenta. Después podrás entrar.</p>
            <Link className="boton ancho" to="/entrar">Ir a entrar</Link>
          </div>
        </div>
      </div>
    );
  }

  const puede = acepto && (rol !== 'alumno' || permiso) && nombre.trim() && email && contrasena.length >= 6;

  return (
    <div className="portada">
      <form className="caja" onSubmit={enviar}>
        <Logo />
        <div className="tarjeta">
          <h2>Crea tu cuenta</h2>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="pila">
            <legend className="rotulo" style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>¿Quién eres?</legend>
            <div className="roles">
              {ROLES.map((r) => (
                <button type="button" key={r} className="rol" aria-pressed={rol === r} onClick={() => setRol(r)}>
                  <Avatar rol={r} tamano={64} expresion={r === 'alumno' ? 'feliz' : 'normal'} />
                  {NOMBRE_ROL[r]}
                </button>
              ))}
            </div>
            <p className="tenue chico">{AYUDA[rol]}</p>
          </fieldset>
          <div className="campo">
            <label htmlFor="nombre">Tu nombre</label>
            <input id="nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" placeholder={rol === 'alumno' ? 'Como te dicen en tu grupo' : ''} />
          </div>
          <div className="campo">
            <label htmlFor="email">Correo</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            {rol === 'alumno' && <span className="ayuda">Usa tu correo escolar si tu escuela te dio uno.</span>}
          </div>
          <div className="campo">
            <label htmlFor="contrasena">Contraseña</label>
            <input id="contrasena" type="password" required minLength={6} value={contrasena} onChange={(e) => setContrasena(e.target.value)} autoComplete="new-password" />
            <span className="ayuda">Mínimo 6 caracteres.</span>
          </div>
          <label className="casilla">
            <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
            <span>Leí y acepto el <Link to="/privacidad" target="_blank">aviso de privacidad</Link>.</span>
          </label>
          {rol === 'alumno' && (
            <label className="casilla">
              <input type="checkbox" checked={permiso} onChange={(e) => setPermiso(e.target.checked)} />
              <span>Si soy menor de edad, mi mamá, papá o tutor sabe que uso al100 Escuelas y está de acuerdo.</span>
            </label>
          )}
          <Aviso>{error}</Aviso>
          <button className="boton ancho" disabled={!puede || ocupado}>{ocupado ? 'Creando…' : 'Crear cuenta'}</button>
        </div>
        <p className="centro">¿Ya tienes cuenta? <Link to="/entrar">Entra aquí</Link></p>
      </form>
    </div>
  );
}
