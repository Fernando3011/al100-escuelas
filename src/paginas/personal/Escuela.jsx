import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { useSesion } from '../../estado/Sesion.jsx';
import { Avatar } from '../../componentes/Avatar.jsx';
import { Aviso, Cargando, Encabezado, dias, useAccion, useDatos } from '../../componentes/Ui.jsx';
import { UnirseEscuela } from '../Perfil.jsx';

function CrearEscuela() {
  const { recargarPerfil } = useSesion();
  const [nombre, setNombre] = useState('');
  const { ocupado, error, ejecutar } = useAccion();
  return (
    <form className="tarjeta" onSubmit={(e) => { e.preventDefault(); ejecutar(async () => { await api.crearEscuela(nombre.trim()); await recargarPerfil(); }); }}>
      <div className="fila"><Avatar rol="admin" tamano={56} /><h2>Registra tu escuela</h2></div>
      <div className="campo">
        <label htmlFor="escuela">Nombre de la escuela</label>
        <input id="escuela" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <Aviso>{error}</Aviso>
      <button className="boton" disabled={!nombre.trim() || ocupado}>Registrar</button>
      <p className="tenue chico">Después compartirás un código con tutores y psicología para que se unan.</p>
    </form>
  );
}

function Protocolo({ escuela, alGuardar }) {
  const [p, setP] = useState(escuela.protocolo);
  const [ok, setOk] = useState(false);
  const { ocupado, error, ejecutar } = useAccion();
  useEffect(() => setP(escuela.protocolo), [escuela]);
  const cambiar = (k, v) => { setOk(false); setP({ ...p, [k]: v }); };
  return (
    <form className="tarjeta" onSubmit={(e) => { e.preventDefault(); ejecutar(async () => { await api.guardarEscuela(escuela.id, { protocolo: p }); setOk(true); alGuardar(); }); }}>
      <h2>Protocolo de riesgo</h2>
      <p className="tenue chico">Define cuándo se genera una alerta y quién la recibe. Los alumnos que pidan hablar con alguien siempre generan alerta.</p>
      <div className="campo">
        <label htmlFor="dias">Generar alerta si un alumno marca “Bajo” o “Mal” durante</label>
        <select id="dias" value={p.dias_consecutivos} onChange={(e) => cambiar('dias_consecutivos', Number(e.target.value))}>
          {[1, 2, 3, 4, 5, 7].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'día' : 'días seguidos'}</option>)}
        </select>
      </div>
      <label className="casilla"><input type="checkbox" checked={p.notificar_tutor !== false} onChange={(e) => cambiar('notificar_tutor', e.target.checked)} /><span>Avisar al tutor/a del grupo</span></label>
      <label className="casilla"><input type="checkbox" checked={p.notificar_psicologo !== false} onChange={(e) => cambiar('notificar_psicologo', e.target.checked)} /><span>Avisar al área de psicología</span></label>
      <p className="tenue chico">La administración siempre puede ver las alertas.</p>
      <div className="campo">
        <label htmlFor="mensaje">Mensaje de ayuda que ve el alumno cuando no se siente bien</label>
        <textarea id="mensaje" value={p.mensaje_ayuda} onChange={(e) => cambiar('mensaje_ayuda', e.target.value)} />
        <span className="ayuda">Incluye a quién acudir en la escuela y una línea de ayuda.</span>
      </div>
      <Aviso>{error}</Aviso>
      {ok && <Aviso tipo="ok">Protocolo guardado.</Aviso>}
      <button className="boton" disabled={ocupado}>Guardar protocolo</button>
    </form>
  );
}

export default function Escuela() {
  const { perfil } = useSesion();
  const datos = useDatos(async () => {
    if (!perfil.escuela_id) return null;
    const [escuela, resumen, alertas] = await Promise.all([api.miEscuela(), api.resumenEscuela(), api.alertas()]);
    return { escuela, resumen, pendientes: alertas.filter((a) => !a.atendida).length };
  }, [perfil.escuela_id]);

  if (!perfil.escuela_id) {
    return (
      <div className="contenido">
        <Encabezado titulo="Escuela" />
        {perfil.rol === 'admin' ? <CrearEscuela /> : (
          <div className="tarjeta durazno"><span className="etiqueta">Únete a tu escuela</span><UnirseEscuela /></div>
        )}
        {perfil.rol === 'admin' && (
          <div className="tarjeta"><span className="etiqueta">¿Tu escuela ya está registrada?</span><UnirseEscuela /></div>
        )}
      </div>
    );
  }
  if (datos.cargando) return <div className="contenido"><Cargando /></div>;
  if (datos.error) return <div className="contenido"><Aviso>{datos.error}</Aviso></div>;
  const { escuela, resumen, pendientes } = datos.datos;
  const alumnos = resumen.reduce((n, g) => n + Number(g.alumnos), 0);

  return (
    <div className="contenido ancho">
      <Encabezado titulo={escuela.nombre} subtitulo={perfil.rol === 'admin' ? 'Administración' : 'Psicología'} />
      <div className="rejilla-auto">
        <div className="tarjeta"><span className="etiqueta" style={{ color: 'var(--texto-2)' }}>Grupos</span><span style={{ fontSize: 34, fontWeight: 900 }}>{resumen.length}</span></div>
        <div className="tarjeta"><span className="etiqueta" style={{ color: 'var(--texto-2)' }}>Alumnos</span><span style={{ fontSize: 34, fontWeight: 900 }}>{alumnos}</span></div>
        <Link to="/alertas" className={`tarjeta ${pendientes ? 'alerta' : ''}`} style={{ textDecoration: 'none', color: 'var(--texto)' }}>
          <span className="etiqueta" style={{ color: pendientes ? '#8a4515' : 'var(--texto-2)' }}>Alertas pendientes</span>
          <span style={{ fontSize: 34, fontWeight: 900 }}>{pendientes}</span>
        </Link>
      </div>

      <div className="tarjeta">
        <span className="etiqueta">Código del personal</span>
        <p>Compártelo <b>solo con tutores y psicología</b> para que se unan a la escuela.</p>
        <span className="codigo" style={{ alignSelf: 'flex-start' }}>{escuela.codigo_personal}</span>
      </div>

      <div className="tarjeta">
        <h2>Grupos</h2>
        <div className="caja-tabla">
          <table className="tabla">
            <thead><tr><th>Grupo</th><th>Código</th><th>Tutor/a</th><th>Alumnos</th><th>Racha</th></tr></thead>
            <tbody>
              {resumen.map((g) => (
                <tr key={g.grupo_id}>
                  <td><Link to={`/grupo/${g.grupo_id}`}>{g.grupo}</Link></td>
                  <td style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 800 }}>{g.codigo}</td>
                  <td>{g.tutor}</td>
                  <td>{g.alumnos}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{dias(g.racha)}</td>
                </tr>
              ))}
              {resumen.length === 0 && <tr><td colSpan={5} className="tenue">Aún no hay grupos. Los tutores los crean desde su cuenta.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Protocolo escuela={escuela} alGuardar={datos.recargar} />
    </div>
  );
}
