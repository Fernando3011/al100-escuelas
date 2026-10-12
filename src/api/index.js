// Elige el backend: Supabase si hay llaves configuradas; si no, modo demo.
import { crearBackendSupabase } from './supabase.js';
import { crearBackendDemo } from './demo.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const llave = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const api = url && llave ? crearBackendSupabase(url, llave) : crearBackendDemo();
export const esDemo = api.modo === 'demo';
