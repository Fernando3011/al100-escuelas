import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/index.js';

const Contexto = createContext(null);

export function ProveedorSesion({ children }) {
  const [sesion, setSesion] = useState(undefined); // undefined = revisando
  const [perfil, setPerfil] = useState(null);

  const cargarPerfil = useCallback(async () => {
    try {
      setPerfil(await api.miPerfil());
    } catch {
      setPerfil(null);
    }
  }, []);

  useEffect(() => {
    let vivo = true;
    api.obtenerSesion().then(async (s) => {
      if (!vivo) return;
      if (s) await cargarPerfil();
      setSesion(s);
    });
    const quitar = api.alCambiarSesion(async (s) => {
      if (s) await cargarPerfil();
      else setPerfil(null);
      setSesion(s);
    });
    return () => { vivo = false; quitar(); };
  }, [cargarPerfil]);

  return (
    <Contexto.Provider value={{ sesion, perfil, recargarPerfil: cargarPerfil }}>
      {children}
    </Contexto.Provider>
  );
}

export const useSesion = () => useContext(Contexto);

export const esFamilia = (rol) => rol === 'padre' || rol === 'madre';
export const esPersonal = (rol) => ['tutor', 'psicologo', 'admin'].includes(rol);
export const esDireccion = (rol) => rol === 'psicologo' || rol === 'admin';
