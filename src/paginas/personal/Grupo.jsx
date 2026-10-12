import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/index.js';
import { Icono } from '../../componentes/Iconos.jsx';
import { Aviso, Cargando, Iniciales, dias, useAccion, useDatos } from '../../componentes/Ui.jsx';
import { ANIMOS } from '../../datos/contenido.js';

export function Clima({ clima, oscuro }) {
  const total = clima.reduce((n, c) => n + Number(c.total), 0);
  if (!total) {
    return <p className={oscuro ? '' : 'tenue chico'}>Se mostrará cuando al menos 3 alumnos hayan hecho check-in esta semana (así nadie queda identificado).</p>;
  }
  return (
    <div className="pila">
      <div className="clima" role="img" aria-label={clima.map((c) => `${ANIMOS[c.animo - 1].nombre} ${Math.round((100 * c.total) / total)}%`).join(', ')}>
        {clima.map((c) => <div key={c.animo} style={{ width: `${(100 * c.total) / total}%`, background: ANIMOS[c.animo - 1].color }} />)}
      </div>
      <div className="leyenda">
        {clima.map((c) => (
          <span key={c.animo}><i className="cuadro" style={{ background: ANIMOS[c.animo - 1].color, outline: oscuro ? '2px solid #fff' : 'none' }} />{ANIMOS[c.animo - 1].nombre} {Math.round((100 * c.total) / total)}%</span>
        ))}
      </div>
    </div>
  );
}

export default function Grupo() {
  const { id } = useParams();
  const datos = useDatos(async () => {
    const [grupo, panel, temas, pendientes] = await Promise.all([api.grupo(id), api.panelGrupo(id), api.temas(), api.invitacionesPendientes(id)]);
    return { grupo, panel, temas, pendientes };
  }, [id]);
  const [correos, setCorreos] = useState('');
  const [resultado, setResultado] = useState(null);
  const accion = useAccion();

  if (datos.cargando) return <div className="contenido"><Cargando /></div>;
  if (datos.error) return <div className="contenido"><Aviso>{datos.error}</Aviso></div>;
  const { grupo, panel, temas, pendientes } = datos.datos;
  const tema = temas.find((t) => t.id === grupo.tema_actual_id);
  const activas = panel.rachas.filter((r) => r.racha > 0).length;

  return (
    <div className="contenido ancho">
      <Link to="/grupos" className="boton-texto" style={{ alignSelf: 'flex-start' }}><Icono.Flecha width={18} height={18} /> Grupos</Link>
      <div className="fila entre" style={{ flexWrap: 'wrap' }}>
        <div className="pila-chica">
          <span className="tenue chico">Código para unirse</span>
          <div className="fila"><h1>Grupo {grupo.nombre}</h1><span className="codigo">{grupo.codigo}</span></div>
        </div>
        <Link to={`/grupo/${id}/proyectar`} className="boton"><Icono.Proyector /> Proyectar en clase</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, alignItems: 'start' }}>
        <div className="pila" style={{ gap: 16 }}>
          <div className="tarjeta">
            <div className="fila entre"><h2>Clima emocional · 7 días</h2><span className="tenue chico">Anónimo y agregado</span></div>
            <Clima clima={panel.clima} />
            {panel.etiquetas.length > 0 && (
              <p className="chico">Temas que más aparecen: {panel.etiquetas.map((e, i) => <b key={e.etiqueta}>{i ? ', ' : ''}{e.etiqueta.toLowerCase()}</b>)}.</p>
            )}
          </div>

          <div className="tarjeta verde">
            <div className="fila entre" style={{ flexWrap: 'wrap' }}>
              <span className="etiqueta">Tema del grupo</span>
              <select aria-label="Cambiar tema del grupo" value={grupo.tema_actual_id ?? ''} onChange={(e) => accion.ejecutar(async () => { await api.cambiarTema(id, e.target.value); datos.recargar(); })}
                style={{ borderRadius: 12, padding: '8px 10px', border: 0, fontWeight: 800, color: 'var(--verde-oscuro)' }}>
                {temas.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
            {tema && (
              <>
                <span className="etiqueta">Dinámica sugerida · 15 min</span>
                <h2 style={{ fontSize: 24 }}>{tema.dinamica_titulo}</h2>
                <p style={{ color: '#e6f2ee' }}>{tema.dinamica_texto}</p>
              </>
            )}
          </div>

          <div className="rejilla-2">
            <div className="tarjeta">
              <span className="etiqueta" style={{ color: 'var(--texto-2)' }}>Racha grupal</span>
              <span style={{ fontSize: 34, fontWeight: 900, color: 'var(--verde)' }}>{dias(panel.racha_grupo)}</span>
              <span className="tenue chico">Sigue si 75% del grupo hace check-in cada día.</span>
            </div>
            <div className="tarjeta">
              <span className="etiqueta" style={{ color: 'var(--texto-2)' }}>Avance del tema</span>
              <span style={{ fontSize: 34, fontWeight: 900 }}>{panel.avance ?? 0}%</span>
              <div className="barra"><div style={{ width: `${panel.avance ?? 0}%` }} /></div>
            </div>
          </div>

          <div className="tarjeta">
            <h2>Agregar alumnos por correo</h2>
            <div className="campo">
              <label htmlFor="correos">Correos (uno por línea o separados por coma)</label>
              <textarea id="correos" value={correos} onChange={(e) => setCorreos(e.target.value)} placeholder={'alumno1@escuela.mx\nalumno2@escuela.mx'} />
              <span className="ayuda">Si ya tienen cuenta entran al grupo de inmediato; si no, al registrarse con ese correo.</span>
            </div>
            <button className="boton secundario" disabled={!correos.trim() || accion.ocupado} onClick={() => accion.ejecutar(async () => {
              const r = await api.invitar(id, correos.split(/[\s,;]+/));
              setResultado(r); setCorreos(''); datos.recargar();
            })}>Agregar</button>
            {resultado && <Aviso tipo="ok">{resultado.agregados} agregados ahora · {resultado.invitados} entrarán al registrarse</Aviso>}
            {pendientes.length > 0 && <p className="tenue chico">Pendientes de registrarse: {pendientes.map((p) => p.email).join(', ')}</p>}
          </div>
        </div>

        <div className="tarjeta">
          <div className="fila entre"><h2>Rachas individuales</h2><span className="tenue chico">{activas} de {panel.rachas.length} activas</span></div>
          {panel.rachas.length === 0 && <p className="tenue">Aún no hay alumnos. Comparte el código <b>{grupo.codigo}</b>.</p>}
          {panel.rachas.map((r) => (
            <div key={r.alumno_id} className="lista-fila">
              <Iniciales nombre={r.nombre} />
              <span className="crece" style={{ fontWeight: 700 }}>{r.nombre}</span>
              {r.hizo_hoy && <span className="pildora" title="Completó su día hoy"><Icono.Check width={12} height={12} /> hoy</span>}
              <span style={{ fontWeight: 900, color: r.racha ? 'var(--naranja-texto)' : 'var(--texto-3)', minWidth: 64, textAlign: 'right' }}>{r.racha ? dias(r.racha) : 'Reinicia'}</span>
              <button className="boton-icono" aria-label={`Quitar a ${r.nombre} del grupo`} onClick={() => { if (confirm(`¿Quitar a ${r.nombre} del grupo?`)) accion.ejecutar(async () => { await api.quitarAlumno(id, r.alumno_id); datos.recargar(); }); }}>
                <Icono.X width={16} height={16} />
              </button>
            </div>
          ))}
          <p className="tenue chico">La racha mide constancia, no el ánimo: registrar un día difícil también cuenta.</p>
        </div>
      </div>
      <Aviso>{accion.error}</Aviso>
    </div>
  );
}
