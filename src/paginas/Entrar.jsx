import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api, esDemo } from '../api/index.js';
import { useSesion } from '../estado/Sesion.jsx';
import { Avatar, NOMBRE_ROL } from '../componentes/Avatar.jsx';
import { Aviso, useAccion } from '../componentes/Ui.jsx';

export function Logo() {
  return (
    <div className="pila centro" style={{ alignItems: 'center', gap: 8 }}>
      <div className="fila" style={{ gap: 0, alignItems: 'flex-end' }} aria-hidden="true">
        <Avatar rol="padre" tamano={64} />
        <div style={{ marginLeft: -12 }}><Avatar rol="madre" tamano={56} /></div>
        <div style={{ marginLeft: -12 }}><Avatar rol="alumno" expresion="feliz" tamano={48} /></div>
      </div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--verde-oscuro)', lineHeight: 1.1 }}>al100 Escuelas</div>
        <div className="tenue" style={{ fontWeight: 700 }}>por treselefantes</div>
      </div>
    </div>
  );
}

const DEMO = [
  ['alumno', 'Sofía · alumna de 2°B'],
  ['madre', 'Mariana · mamá de Sofía'],
  ['padre', 'Jorge · papá de Sofía'],
  ['tutor', 'Mtro. Luis · tutor'],
  ['psicologo', 'Psic. Carla · psicología'],
  ['admin', 'Dir. Ana · dirección y editora'],
];

export default function Entrar() {
  const { sesion } = useSesion();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [recuperando, setRecuperando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const { ocupado, error, ejecutar } = useAccion();

  if (sesion) return <Navigate to="/" replace />;

  const enviar = (e) => {
    e.preventDefault();
    if (recuperando) ejecutar(async () => { await api.recuperar(email); setEnviado(true); });
    else ejecutar(() => api.entrar(email, contrasena));
  };

  return (
    <div className="portada">
      <div className="caja">
        <Logo />
        <p className="centro tenue">Aprender a sentir, un día a la vez. Para alumnos, familias y escuelas.</p>

        {esDemo ? (
          <div className="tarjeta">
            <div className="pila-chica">
              <span className="etiqueta">Modo demo</span>
              <h2>¿Con qué perfil quieres entrar?</h2>
              <p className="tenue chico">Datos de ejemplo. Cuando conectes Supabase, aquí aparece el inicio de sesión real.</p>
            </div>
            <div className="pila" style={{ gap: 8 }}>
              {DEMO.map(([rol, texto]) => (
                <button key={rol} className="boton secundario ancho" style={{ justifyContent: 'flex-start', minHeight: 60 }} onClick={() => api.entrarComo(rol)}>
                  <Avatar rol={rol} tamano={40} />
                  <span className="pila-chica" style={{ gap: 0, textAlign: 'left' }}>
                    <span>{NOMBRE_ROL[rol]}</span>
                    <span className="tenue chico" style={{ fontWeight: 700 }}>{texto}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form className="tarjeta" onSubmit={enviar}>
            <h2>{recuperando ? 'Recuperar contraseña' : 'Entrar'}</h2>
            <div className="campo">
              <label htmlFor="email">Correo</label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {!recuperando && (
              <div className="campo">
                <label htmlFor="contrasena">Contraseña</label>
                <input id="contrasena" type="password" autoComplete="current-password" required value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
              </div>
            )}
            <Aviso>{error}</Aviso>
            {enviado && <Aviso tipo="ok">Te enviamos un correo con un enlace para crear una nueva contraseña.</Aviso>}
            <button className="boton ancho" disabled={ocupado}>{ocupado ? 'Un momento…' : recuperando ? 'Enviar enlace' : 'Entrar'}</button>
            <button type="button" className="boton-texto" onClick={() => { setRecuperando(!recuperando); setEnviado(false); }}>
              {recuperando ? 'Volver a entrar' : 'Olvidé mi contraseña'}
            </button>
          </form>
        )}

        {!esDemo && (
          <p className="centro">¿Primera vez? <Link to="/registro">Crea tu cuenta</Link></p>
        )}
        <p className="centro chico"><Link to="/privacidad">Aviso de privacidad</Link></p>
      </div>
    </div>
  );
}
