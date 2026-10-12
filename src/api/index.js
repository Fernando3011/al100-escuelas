// Elige el backend: Supabase si hay llaves configuradas; si no, modo demo.
import { crearBackendSupabase } from './supabase.js';
import { crearBackendDemo } from './demo.js';

// Acepta la URL aunque se copie con "/rest/v1/" al final o con espacios.
const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const llave = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export const api = url && llave ? crearBackendSupabase(url, llave) : crearBackendDemo();
export const esDemo = api.modo === 'demo';
