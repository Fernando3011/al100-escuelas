import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/index.js';
import { Aviso, useAccion } from '../componentes/Ui.jsx';
import { Logo } from './Entrar.jsx';

export default function NuevaContrasena() {
  const [contrasena, setContrasena] = useState('');
  const { ocupado, error, ejecutar } = useAccion();
  const ir = useNavigate();
  return (
    <div className="portada">
      <form className="caja" onSubmit={(e) => { e.preventDefault(); ejecutar(async () => { await api.nuevaContrasena(contrasena); ir('/'); }); }}>
        <Logo />
        <div className="tarjeta">
          <h2>Crea una nueva contraseña</h2>
          <div className="campo">
            <label htmlFor="nueva">Nueva contraseña</label>
            <input id="nueva" type="password" minLength={6} required value={contrasena} onChange={(e) => setContrasena(e.target.value)} autoComplete="new-password" />
          </div>
          <Aviso>{error}</Aviso>
          <button className="boton ancho" disabled={ocupado}>Guardar</button>
        </div>
      </form>
    </div>
  );
}
