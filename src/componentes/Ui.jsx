import { useCallback, useEffect, useState } from 'react';
import { Icono } from './Iconos.jsx';
import { ANIMOS } from '../datos/contenido.js';

export function Cargando({ texto = 'Cargando…' }) {
  return <div className="cargando" role="status">{texto}</div>;
}

export function Aviso({ tipo = 'error', children }) {
  if (!children) return null;
  return <div className={`aviso ${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>{children}</div>;
}

// Carga datos con estado de carga/error y una función para recargar.
export function useDatos(cargar, deps = []) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recargar = useCallback(async () => {
    try {
      const datos = await cargar();
      setEstado({ datos, cargando: false, error: null });
    } catch (e) {
      setEstado((s) => ({ ...s, cargando: false, error: e.message }));
    }
  }, deps);
  useEffect(() => { recargar(); }, [recargar]);
  return { ...estado, recargar };
}

// Ejecuta una acción mostrando "ocupado" y el error si falla.
export function useAccion() {
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState(null);
  const ejecutar = async (fn) => {
    setOcupado(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(e.message);
      return undefined;
    } finally {
      setOcupado(false);
    }
  };
  return { ocupado, error, ejecutar, setError };
}

export function Racha({ tipo = 'propia', dias, rotulo }) {
  const n = dias ?? 0;
  return (
    <div className={`racha ${tipo}`}>
      {tipo === 'propia' ? <Icono.Fuego width={26} height={26} /> : <Icono.Grupo width={26} height={26} />}
      <div className="pila-chica" style={{ gap: 0 }}>
        <span className="rot">{rotulo}</span>
        <span className="num">{n} {n === 1 ? 'día' : 'días'}</span>
      </div>
    </div>
  );
}

export function animoInfo(valor) {
  return ANIMOS.find((a) => a.valor === valor);
}

export function Iniciales({ nombre }) {
  const ini = (nombre || '?').split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  return <span className="inicial" aria-hidden="true">{ini}</span>;
}

export function Encabezado({ titulo, subtitulo, children }) {
  return (
    <div className="fila entre" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div className="pila-chica">
        {subtitulo && <span className="tenue chico">{subtitulo}</span>}
        <h1>{titulo}</h1>
      </div>
      {children}
    </div>
  );
}

export const dias = (n) => `${n ?? 0} ${Number(n) === 1 ? 'día' : 'días'}`;
