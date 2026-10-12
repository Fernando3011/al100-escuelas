import { useState } from 'react';
import { api } from '../../api/index.js';
import { hace } from '../../api/fechas.js';
import { useSesion } from '../../estado/Sesion.jsx';
import { Icono } from '../../componentes/Iconos.jsx';
import { Aviso, Cargando, Encabezado, Iniciales, useAccion, useDatos } from '../../componentes/Ui.jsx';

function Alerta({ a, alAtender }) {
  const [abierta, setAbierta] = useState(false);
  const [nota, setNota] = useState('');
  const { ocupado, error, ejecutar } = useAccion();
  const pide = a.tipo === 'pide_ayuda';
  return (
    <div className={`tarjeta ${a.atendida ? 'borde' : 'alerta'}`}>
      <div className="fila entre" style={{ alignItems: 'flex-start' }}>
        <div className="fila">
          <Iniciales nombre={a.alumno_nombre} />
          <div className="pila-chica" style={{ gap: 0 }}>
            <b>{a.alumno_nombre ?? 'Alumno'}</b>
            <span className="tenue chico">{hace(a.creada_en)}</span>
          </div>
        </div>
        <span className={`pildora ${a.atendida ? 'gris' : 'naranja'}`}>{a.atendida ? 'Atendida' : pide ? 'Pidió hablar' : 'Ánimo bajo'}</span>
      </div>
      <p>{a.detalle}</p>
      {a.atendida && a.nota && <p className="chico tenue"><b>Nota:</b> {a.nota}</p>}
      {!a.atendida && !abierta && (
        <button className="boton chico naranja" style={{ alignSelf: 'flex-start' }} onClick={() => setAbierta(true)}>Marcar como atendida</button>
      )}
      {abierta && (
        <div className="pila">
          <div className="campo">
            <label htmlFor={`nota-${a.id}`}>Nota de seguimiento (la ve el personal autorizado)</label>
            <textarea id={`nota-${a.id}`} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej. Platiqué con el alumno; se canaliza a psicología." />
          </div>
          <Aviso>{error}</Aviso>
          <div className="fila">
            <button className="boton chico" disabled={ocupado} onClick={() => ejecutar(async () => { await api.atenderAlerta(a.id, nota.trim()); alAtender(); })}>Guardar</button>
            <button className="boton-texto" onClick={() => setAbierta(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Alertas() {
  const { perfil } = useSesion();
  const { datos, cargando, error, recargar } = useDatos(() => api.alertas(), []);
  const [verAtendidas, setVerAtendidas] = useState(false);
  const abiertas = datos?.filter((a) => !a.atendida) ?? [];
  const atendidas = datos?.filter((a) => a.atendida) ?? [];
  return (
    <div className="contenido">
      <Encabezado titulo="Alertas" subtitulo="Requieren atención" />
      <div className="aviso info">
        Las alertas siguen el protocolo de tu escuela. Sugerimos un acercamiento individual y discreto. Solo ves la tendencia; nunca la bitácora del alumno.
      </div>
      {!perfil.escuela_id && <Aviso tipo="info">Únete a tu escuela para recibir alertas.</Aviso>}
      {cargando && <Cargando />}
      <Aviso>{error}</Aviso>
      {datos && abiertas.length === 0 && (
        <div className="tarjeta borde fila"><Icono.Check style={{ color: 'var(--verde)' }} /> No hay alertas pendientes.</div>
      )}
      {abiertas.map((a) => <Alerta key={a.id} a={a} alAtender={recargar} />)}
      {atendidas.length > 0 && (
        <button className="boton-texto" style={{ alignSelf: 'flex-start' }} onClick={() => setVerAtendidas(!verAtendidas)}>
          {verAtendidas ? 'Ocultar atendidas' : `Ver atendidas (${atendidas.length})`}
        </button>
      )}
      {verAtendidas && atendidas.map((a) => <Alerta key={a.id} a={a} alAtender={recargar} />)}
    </div>
  );
}
