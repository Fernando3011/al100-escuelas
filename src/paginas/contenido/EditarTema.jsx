import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/index.js';
import { Icono } from '../../componentes/Iconos.jsx';
import { Aviso, Cargando, useAccion, useDatos } from '../../componentes/Ui.jsx';

function Campo({ etiqueta, valor, alCambiar, largo, id }) {
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      {largo ? <textarea id={id} value={valor ?? ''} onChange={(e) => alCambiar(e.target.value)} /> : <input id={id} value={valor ?? ''} onChange={(e) => alCambiar(e.target.value)} />}
    </div>
  );
}

function Estado({ valor, alCambiar }) {
  return (
    <label className="casilla" style={{ alignItems: 'center' }}>
      <input type="checkbox" checked={valor === 'aprobado'} onChange={(e) => alCambiar(e.target.checked ? 'aprobado' : 'pendiente')} />
      <span className={`pildora ${valor === 'aprobado' ? '' : 'naranja'}`}>{valor === 'aprobado' ? 'Aprobado' : 'Pendiente de aprobar'}</span>
    </label>
  );
}

function BotonGuardar({ accion, alGuardar, cambios }) {
  const { ocupado, error, ejecutar } = useAccion();
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(false), [cambios]);
  return (
    <>
      <Aviso>{error}</Aviso>
      <div className="fila">
        <button className="boton chico" disabled={ocupado} onClick={() => ejecutar(async () => { await accion(); setOk(true); alGuardar?.(); })}>{ocupado ? 'Guardando…' : 'Guardar'}</button>
        {ok && <span className="pildora"><Icono.Check width={12} height={12} /> Guardado</span>}
      </div>
    </>
  );
}

const NUEVO_PASO = {
  idea: { tipo: 'idea', titulo: '', texto: '' },
  pregunta: { tipo: 'pregunta', texto: '', opciones: ['', ''], correcta: 0, explicacion: '' },
  reflexion: { tipo: 'reflexion', texto: '' },
};

function EditorPaso({ paso, i, alCambiar, alQuitar, alSubir }) {
  const set = (k, v) => alCambiar({ ...paso, [k]: v });
  const id = `p${i}-${paso.tipo}`;
  return (
    <div className="tarjeta borde" style={{ gap: 10 }}>
      <div className="fila entre">
        <span className="pildora gris">Paso {i + 1} · {paso.tipo === 'idea' ? 'Idea' : paso.tipo === 'pregunta' ? 'Pregunta' : 'Reflexión'}</span>
        <div className="fila" style={{ gap: 0 }}>
          {i > 0 && <button className="boton-icono" aria-label="Subir paso" onClick={alSubir}>↑</button>}
          <button className="boton-icono" aria-label="Quitar paso" onClick={alQuitar}><Icono.Basura width={18} height={18} /></button>
        </div>
      </div>
      {paso.tipo === 'idea' && <Campo id={id + 't'} etiqueta="Título" valor={paso.titulo} alCambiar={(v) => set('titulo', v)} />}
      <Campo id={id + 'x'} etiqueta={paso.tipo === 'pregunta' ? 'Pregunta' : paso.tipo === 'reflexion' ? 'Pregunta para reflexionar' : 'Texto'} valor={paso.texto} alCambiar={(v) => set('texto', v)} largo={paso.tipo === 'idea'} />
      {paso.tipo === 'pregunta' && (
        <>
          <span className="rotulo" style={{ fontWeight: 800, fontSize: 14 }}>Opciones (marca la correcta)</span>
          {paso.opciones.map((o, j) => (
            <div key={j} className="fila">
              <input type="radio" name={id + 'c'} aria-label={`Opción ${j + 1} es la correcta`} checked={paso.correcta === j} onChange={() => set('correcta', j)} style={{ width: 22, height: 22, accentColor: 'var(--verde)' }} />
              <input className="crece" aria-label={`Opción ${j + 1}`} value={o} onChange={(e) => set('opciones', paso.opciones.map((x, k) => (k === j ? e.target.value : x)))}
                style={{ minHeight: 44, padding: '8px 12px', borderRadius: 12, border: '2px solid var(--borde)' }} />
              {paso.opciones.length > 2 && (
                <button className="boton-icono" aria-label="Quitar opción" onClick={() => alCambiar({ ...paso, opciones: paso.opciones.filter((_, k) => k !== j), correcta: paso.correcta >= j && paso.correcta > 0 ? paso.correcta - 1 : paso.correcta })}>
                  <Icono.X width={16} height={16} />
                </button>
              )}
            </div>
          ))}
          {paso.opciones.length < 4 && <button className="boton-texto" style={{ alignSelf: 'flex-start' }} onClick={() => set('opciones', [...paso.opciones, ''])}><Icono.Mas width={16} height={16} /> Opción</button>}
          <Campo id={id + 'e'} etiqueta="Explicación (se muestra al responder)" valor={paso.explicacion} alCambiar={(v) => set('explicacion', v)} />
        </>
      )}
    </div>
  );
}

function EditorLeccion({ inicial, alGuardar }) {
  const [l, setL] = useState(inicial);
  const [abierta, setAbierta] = useState(!inicial.id);
  const pasos = l.pasos ?? [];
  const setPasos = (p) => setL({ ...l, pasos: p });
  return (
    <div className="tarjeta">
      <div className="fila entre">
        <button className="boton-texto" style={{ textDecoration: 'none', color: 'var(--texto)', fontSize: 17 }} onClick={() => setAbierta(!abierta)} aria-expanded={abierta}>
          {abierta ? '▾' : '▸'} {l.orden}. {l.titulo || 'Lección nueva'}
        </button>
        <span className={`pildora ${l.estado === 'aprobado' ? '' : 'naranja'}`}>{l.estado === 'aprobado' ? 'Aprobada' : 'Pendiente'}</span>
      </div>
      {abierta && (
        <>
          <Campo id={`lt-${l.id}`} etiqueta="Título de la lección" valor={l.titulo} alCambiar={(v) => setL({ ...l, titulo: v })} />
          {pasos.map((p, i) => (
            <EditorPaso key={i} paso={p} i={i}
              alCambiar={(np) => setPasos(pasos.map((x, k) => (k === i ? np : x)))}
              alQuitar={() => setPasos(pasos.filter((_, k) => k !== i))}
              alSubir={() => { const c = [...pasos]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; setPasos(c); }} />
          ))}
          <div className="fila-envuelve">
            <span className="tenue chico" style={{ alignSelf: 'center' }}>Agregar paso:</span>
            {Object.keys(NUEVO_PASO).map((t) => (
              <button key={t} className="chip" onClick={() => setPasos([...pasos, structuredClone(NUEVO_PASO[t])])}>+ {t === 'idea' ? 'Idea' : t === 'pregunta' ? 'Pregunta' : 'Reflexión'}</button>
            ))}
          </div>
          <Estado valor={l.estado} alCambiar={(v) => setL({ ...l, estado: v })} />
          <BotonGuardar cambios={l} accion={async () => { const r = await api.guardarLeccion(l); if (r) setL(r); }} alGuardar={alGuardar} />
          {l.id && (
            <button className="boton-texto" style={{ color: 'var(--rojo)', alignSelf: 'flex-start' }} onClick={async () => { if (confirm('¿Borrar esta lección? También se borra el registro de quienes la completaron.')) { await api.borrarLeccion(l.id); alGuardar(); } }}>
              Borrar lección
            </button>
          )}
        </>
      )}
    </div>
  );
}

function EditorConsejo({ inicial, alGuardar }) {
  const [c, setC] = useState(inicial);
  const set = (k, v) => setC({ ...c, [k]: v });
  return (
    <div className="tarjeta">
      <Campo id={`ct-${c.id}`} etiqueta="Título" valor={c.titulo} alCambiar={(v) => set('titulo', v)} />
      <Campo id={`ce-${c.id}`} etiqueta="Frase a evitar" valor={c.evita} alCambiar={(v) => set('evita', v)} />
      <Campo id={`cp-${c.id}`} etiqueta="Prueba con (alternativa respetuosa)" valor={c.prueba} alCambiar={(v) => set('prueba', v)} largo />
      <Campo id={`cq-${c.id}`} etiqueta="Pregunta para platicar en casa" valor={c.pregunta} alCambiar={(v) => set('pregunta', v)} />
      <Estado valor={c.estado} alCambiar={(v) => set('estado', v)} />
      <BotonGuardar cambios={c} accion={async () => { const r = await api.guardarConsejo(c); if (r) setC(r); }} alGuardar={alGuardar} />
      {c.id && <button className="boton-texto" style={{ color: 'var(--rojo)', alignSelf: 'flex-start' }} onClick={async () => { if (confirm('¿Borrar este consejo?')) { await api.borrarConsejo(c.id); alGuardar(); } }}>Borrar consejo</button>}
    </div>
  );
}

export default function EditarTema() {
  const { id } = useParams();
  const datos = useDatos(async () => {
    const [tema, lecciones, consejos] = await Promise.all([api.tema(id), api.lecciones(id), api.consejos(id)]);
    return { tema, lecciones, consejos };
  }, [id]);
  const [t, setT] = useState(null);
  useEffect(() => { if (datos.datos) setT(datos.datos.tema); }, [datos.datos]);

  if (datos.cargando || !t) return <div className="contenido"><Cargando /></div>;
  if (datos.error) return <div className="contenido"><Aviso>{datos.error}</Aviso></div>;
  const { lecciones, consejos } = datos.datos;
  const set = (k, v) => setT({ ...t, [k]: v });

  return (
    <div className="contenido">
      <Link to="/contenido" className="boton-texto" style={{ alignSelf: 'flex-start' }}><Icono.Flecha width={18} height={18} /> Contenido</Link>
      <h1 style={{ color: t.color }}>{t.nombre}</h1>

      <section className="tarjeta">
        <h2>Datos del tema</h2>
        <div className="rejilla-2">
          <Campo id="tn" etiqueta="Nombre para alumnos" valor={t.nombre} alCambiar={(v) => set('nombre', v)} />
          <Campo id="tf" etiqueta="Nombre para familias" valor={t.nombre_familia} alCambiar={(v) => set('nombre_familia', v)} />
        </div>
        <Campo id="td" etiqueta="Descripción para alumnos" valor={t.descripcion} alCambiar={(v) => set('descripcion', v)} />
        <Campo id="tdf" etiqueta="Descripción para familias" valor={t.descripcion_familia} alCambiar={(v) => set('descripcion_familia', v)} />
        <Campo id="tdt" etiqueta="Dinámica para la tutoría · título" valor={t.dinamica_titulo} alCambiar={(v) => set('dinamica_titulo', v)} />
        <Campo id="tdx" etiqueta="Dinámica para la tutoría · instrucciones" valor={t.dinamica_texto} alCambiar={(v) => set('dinamica_texto', v)} largo />
        <div className="campo">
          <label htmlFor="tc">Color</label>
          <input id="tc" type="color" value={t.color} onChange={(e) => set('color', e.target.value)} style={{ width: 80, padding: 4 }} />
        </div>
        <Estado valor={t.estado} alCambiar={(v) => set('estado', v)} />
        <BotonGuardar cambios={t} accion={() => api.guardarTema(t)} />
      </section>

      <section className="pila">
        <h2>Lecciones para alumnos</h2>
        {lecciones.map((l) => <EditorLeccion key={l.id} inicial={l} alGuardar={datos.recargar} />)}
        <button className="boton secundario" style={{ alignSelf: 'flex-start' }} onClick={async () => { await api.guardarLeccion({ tema_id: id, orden: lecciones.length + 1, titulo: 'Lección nueva', pasos: [structuredClone(NUEVO_PASO.idea)], estado: 'pendiente' }); datos.recargar(); }}>
          <Icono.Mas /> Nueva lección
        </button>
      </section>

      <section className="pila">
        <h2>Consejos para familias</h2>
        {consejos.map((c) => <EditorConsejo key={c.id} inicial={c} alGuardar={datos.recargar} />)}
        <button className="boton secundario" style={{ alignSelf: 'flex-start' }} onClick={async () => { await api.guardarConsejo({ tema_id: id, orden: consejos.length + 1, titulo: 'Consejo nuevo', evita: '', prueba: '', pregunta: '', estado: 'pendiente' }); datos.recargar(); }}>
          <Icono.Mas /> Nuevo consejo
        </button>
      </section>
    </div>
  );
}
