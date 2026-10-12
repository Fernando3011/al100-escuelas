// Íconos de línea (estilo consistente, heredan el color del texto).
const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const Icono = {
  Casa: (p) => <svg {...base} {...p}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>,
  Diario: (p) => <svg {...base} {...p}><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" /><path d="M8 9h8M8 13h6" /></svg>,
  Brote: (p) => <svg {...base} {...p}><path d="M12 22V12" /><path d="M12 12c0-4 3-7 8-7 0 5-3 7-8 7z" /><path d="M12 15c0-3-2-5-7-5 0 4 2 5 7 5z" /></svg>,
  Persona: (p) => <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></svg>,
  Grupo: (p) => <svg {...base} {...p}><circle cx="8" cy="9" r="3" /><circle cx="16" cy="9" r="3" /><path d="M2 20c.5-3 3-5 6-5s5.5 2 6 5" /><path d="M14 15.5c.6-.3 1.3-.5 2-.5 3 0 5.5 2 6 5" /></svg>,
  Campana: (p) => <svg {...base} {...p}><path d="M6 9a6 6 0 0 1 12 0c0 6 3 7 3 7H3s3-1 3-7" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>,
  Escuela: (p) => <svg {...base} {...p}><path d="M3 10l9-5 9 5-9 5z" /><path d="M7 12v4c2 2 8 2 10 0v-4" /></svg>,
  Lapiz: (p) => <svg {...base} {...p}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M14 6l4 4" /></svg>,
  Fuego: (p) => <svg {...base} {...p}><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-3 2-4 2-7 1.5 1 2 2.5 2 4 1-2 1-5 1-8z" /></svg>,
  Check: (p) => <svg {...base} strokeWidth={3} {...p}><path d="M5 12l5 5 9-10" /></svg>,
  Candado: (p) => <svg {...base} {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>,
  Play: (p) => <svg {...base} fill="currentColor" stroke="none" {...p}><path d="M8 5v14l11-7z" /></svg>,
  X: (p) => <svg {...base} strokeWidth={2.5} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>,
  Flecha: (p) => <svg {...base} {...p}><path d="M15 6l-6 6 6 6" /></svg>,
  Corazon: (p) => <svg {...base} {...p}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></svg>,
  Proyector: (p) => <svg {...base} {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>,
  Salir: (p) => <svg {...base} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>,
  Mas: (p) => <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>,
  Basura: (p) => <svg {...base} {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>,
  Mensaje: (p) => <svg {...base} {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>,
};
