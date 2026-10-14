import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, esDemo } from '../api/index.js';
import { useSesion, esFamilia, esPersonal } from '../estado/Sesion.jsx';
import { Avatar, NOMBRE_ROL } from '../componentes/Avatar.jsx';
import { Icono } from '../componentes/Iconos.jsx';
import { Aviso, useAccion, useDatos } from '../componentes/Ui.jsx';

// Formulario reutilizable: escribir un código y ejecutar una acción.
export function FormCodigo({ etiqueta, boton, accion, alTerminar, ayuda }) {
  const [codigo, setCodigo] = useState('');
  const [ok, setOk] = useState(null);
  const { ocupado, error, ejecutar } = useAccion();
  const id = 'codigo-' + boton.replace(/\s/g, '');
  return (
    <form className="pila" onSubmit={(e) => {
      e.preventDefault();
      ejecutar(async () => {
        const r = await accion(codigo);
        setOk(r?.nombre ? `¡Listo! ${r.nombre}` : '¡Listo!');
        setCodigo('');
        alTerminar?.(r);
      });
    }}>
      <div className="campo">
        <label htmlFor={id}>{etiqueta}</label>
        <div className="fila">
          <input id={id} className="crece" value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} autoCapitalize="characters" autoComplete="off" style={{ letterSpacing: '0.1em', fontWeight: 800 }} />
          <button className="boton" disabled={!codigo.trim() || ocupado}>{boton}</button>
        </div>
        {ayuda && <span className="ayuda">{ayuda}</span>}
      </div>
      <Aviso>{error}</Aviso>
      <Aviso tipo="ok">{ok}</Aviso>
    </form>
  );
}

export const UnirseGrupo = ({ alUnirse }) => (
  <FormCodigo etiqueta="Código de grupo" boton="Unirme" alTerminar={alUnirse}
    ayuda="Tiene 6 letras y números. Te lo da tu tutor/a."
    accion={async (c) => {
      try {
        return await api.unirseGrupo(c);
      } catch (e) {
        if (c.trim().length === 8) throw new Error('Ese parece el código del personal de la escuela. Pídele a tu tutor/a el código de tu grupo (6 caracteres).');
        throw e;
      }
    }} />
);

export const VincularHijo = ({ alVincular }) => (
  <FormCodigo etiqueta="Código familiar de tu hijo/a" boton="Vincular" accion={(c) => api.vincularFamilia(c)} alTerminar={alVincular}
    ayuda="Tu hijo/a lo encuentra en su app, en la sección “Yo”." />
);

export function UnirseEscuela({ alUnirse }) {
  const { recargarPerfil } = useSesion();
  return (
    <FormCodigo etiqueta="Código del personal de tu escuela" boton="Unirme" accion={(c) => api.unirseEscuela(c)}
      alTerminar={async (r) => { await recargarPerfil(); alUnirse?.(r); }}
      ayuda="Lo tiene la dirección o el área de psicología." />
  );
}

export default function Perfil() {
  const { perfil, recargarPerfil } = useSesion();
  const [nombre, setNombre] = useState(perfil.nombre);
  const guardar = useAccion();
  const grupos = useDatos(() => (perfil.rol === 'alumno' ? api.misGruposAlumno() : Promise.resolve([])), [perfil.rol]);
  const hijos = useDatos(() => (esFamilia(perfil.rol) ? api.infoHijos() : Promise.resolve([])), [perfil.rol]);

  return (
    <div className="contenido">
      <div className="tarjeta" style={{ alignItems: 'center', textAlign: 'center' }}>
        <Avatar rol={perfil.rol} expresion={perfil.rol === 'alumno' ? 'feliz' : 'normal'} tamano={120} />
        <h1>{perfil.nombre || 'Sin nombre'}</h1>
        <span className="pildora">{NOMBRE_ROL[perfil.rol]}</span>
        {perfil.escuela_nombre && <span className="tenue">{perfil.escuela_nombre}</span>}
      </div>

      <form className="tarjeta" onSubmit={(e) => { e.preventDefault(); guardar.ejecutar(async () => { await api.cambiarNombre(nombre.trim()); await recargarPerfil(); }); }}>
        <div className="campo">
          <label htmlFor="nombre">Tu nombre</label>
          <div className="fila">
            <input id="nombre" className="crece" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <button className="boton secundario" disabled={guardar.ocupado || nombre.trim() === perfil.nombre}>Guardar</button>
          </div>
        </div>
        <Aviso>{guardar.error}</Aviso>
      </form>

      {perfil.rol === 'alumno' && (
        <>
          <div className="tarjeta">
            <span className="etiqueta">Código familiar</span>
            <p>Compártelo con tu mamá o papá para que vean qué temas trabajas en clase, qué lecciones completas y tu racha. <b>Nunca verán tu ánimo ni tu bitácora.</b></p>
            <span className="codigo" style={{ alignSelf: 'flex-start' }}>{perfil.codigo_familia}</span>
          </div>
          <div className="tarjeta">
            <span className="etiqueta">Mis grupos</span>
            {grupos.datos?.length ? grupos.datos.map((g) => <div key={g.id} className="lista-fila"><Icono.Grupo /> <b>{g.nombre}</b></div>) : <p className="tenue">Todavía no estás en un grupo.</p>}
            <UnirseGrupo alUnirse={() => { grupos.recargar(); recargarPerfil(); }} />
          </div>
        </>
      )}

      {esFamilia(perfil.rol) && (
        <div className="tarjeta">
          <span className="etiqueta">Mis hijos/as</span>
          {hijos.datos?.length ? hijos.datos.map((h) => <div key={h.alumno_id} className="lista-fila"><Avatar rol="alumno" tamano={34} /> <b>{h.nombre}</b> <span className="tenue chico">{h.grupo ?? ''}</span></div>) : <p className="tenue">Aún no vinculas a tu hijo/a.</p>}
          <VincularHijo alVincular={hijos.recargar} />
        </div>
      )}

      {esPersonal(perfil.rol) && !perfil.escuela_id && perfil.rol !== 'admin' && (
        <div className="tarjeta durazno">
          <span className="etiqueta">Únete a tu escuela</span>
          <UnirseEscuela />
        </div>
      )}

      <div className="tarjeta" style={{ gap: 4 }}>
        {perfil.es_editor && <Link to="/contenido" className="lista-fila"><Icono.Lapiz /> Panel de contenido</Link>}
        <Link to="/privacidad" className="lista-fila"><Icono.Candado /> Aviso de privacidad</Link>
        {esDemo && (
          <button className="lista-fila boton-texto" style={{ textDecoration: 'none' }} onClick={() => { api.reiniciarDemo(); window.location.reload(); }}>
            <Icono.Brote /> Reiniciar datos de la demo
          </button>
        )}
        <button className="lista-fila boton-texto" style={{ textDecoration: 'none', color: 'var(--rojo)' }} onClick={() => api.salir()}>
          <Icono.Salir /> {esDemo ? 'Cambiar de perfil' : 'Cerrar sesión'}
        </button>
      </div>
    </div>
  );
}
