// Los personajes de al100 Escuelas: una familia de elefantes.
// Cada rol tiene su avatar; el del alumno cambia de expresión según su ánimo.

const FONDOS = {
  alumno: '#FFE8D6',
  padre: '#E3F2EC',
  madre: '#F7E4EA',
  tutor: '#E6ECF7',
  psicologo: '#E3F2EC',
  admin: '#FFF1CC',
};

export const NOMBRE_ROL = {
  alumno: 'Alumno/a',
  padre: 'Papá',
  madre: 'Mamá',
  tutor: 'Mentor/tutor',
  psicologo: 'Psicólogo/a',
  admin: 'Administración escolar',
};

// animo: 1-5 del check-in → expresión del elefante pequeño
export function expresionDeAnimo(animo) {
  if (!animo) return 'normal';
  if (animo <= 2) return 'feliz';
  if (animo === 3) return 'tranquilo';
  return 'triste';
}

function Orejas({ piel, interior, dx = 0, dy = 0 }) {
  return (
    <>
      <ellipse cx={50 + dx} cy={94 + dy} rx="36" ry="42" fill={piel} />
      <ellipse cx={54 + dx} cy={96 + dy} rx="22" ry="28" fill={interior} />
      <ellipse cx={150 - dx} cy={94 + dy} rx="36" ry="42" fill={piel} />
      <ellipse cx={146 - dx} cy={96 + dy} rx="22" ry="28" fill={interior} />
    </>
  );
}

function Ojos({ tipo = 'abiertos', r = 7 }) {
  if (tipo === 'felices')
    return <path d="M75 88 q8 -10 16 0 M109 88 q8 -10 16 0" stroke="#1E2A28" strokeWidth="5" fill="none" strokeLinecap="round" />;
  if (tipo === 'cerrados')
    return <path d="M76 88 q7 5 14 0 M110 88 q7 5 14 0" stroke="#1E2A28" strokeWidth="5" fill="none" strokeLinecap="round" />;
  return (
    <>
      <circle cx="83" cy="88" r={r} fill="#1E2A28" />
      <circle cx="85.5" cy="85.5" r={r * 0.32} fill="#fff" />
      <circle cx="117" cy="88" r={r} fill="#1E2A28" />
      <circle cx="119.5" cy="85.5" r={r * 0.32} fill="#fff" />
    </>
  );
}

const Mejillas = () => (
  <>
    <ellipse cx="72" cy="104" rx="7" ry="4" fill="#F2A6A0" />
    <ellipse cx="128" cy="104" rx="7" ry="4" fill="#F2A6A0" />
  </>
);

function Trompa({ piel, linea, d = 'M100 112 C100 136 96 150 112 160' }) {
  return (
    <>
      <path d={d} stroke={piel} strokeWidth="20" fill="none" strokeLinecap="round" />
      <path d="M93 128 h12 M94 140 h11" stroke={linea} strokeWidth="2.5" strokeLinecap="round" />
    </>
  );
}

function Alumno({ expresion }) {
  const piel = '#B8C7D1';
  const triste = expresion === 'triste';
  const racha = expresion === 'racha';
  return (
    <>
      <path d="M44 200 C44 162 70 148 100 148 C130 148 156 162 156 200 Z" fill="#E8772E" />
      <path d="M92 152 L92 176 M108 152 L108 176" stroke="#FFE8D6" strokeWidth="3" strokeLinecap="round" />
      <Orejas piel={piel} interior="#E9C9C6" dx={2} dy={triste ? 8 : 0} />
      <circle cx="100" cy="92" r="44" fill={piel} />
      <path d="M96 50 C94 40 102 36 104 44 C106 36 114 40 108 50" fill="#8FA3B0" />
      {racha ? (
        <>
          <path d="M100 110 C102 88 116 70 132 64" stroke={piel} strokeWidth="20" fill="none" strokeLinecap="round" />
          <path d="M146 26 c4 12 14 16 14 30 a14 14 0 0 1 -28 0 c0 -8 6 -11 6 -19 c4 3 6 7 6 11 c3 -6 3 -14 2 -22 z" fill="#E8772E" stroke="#B4561A" strokeWidth="2" />
        </>
      ) : (
        <Trompa
          piel={piel}
          linea="#8FA3B0"
          d={expresion === 'feliz' ? 'M100 112 C100 128 106 136 120 130' : triste ? 'M100 114 C100 140 98 154 92 162' : undefined}
        />
      )}
      {triste && <path d="M74 80 l14 -7 M126 80 l-14 -7" stroke="#1E2A28" strokeWidth="4" strokeLinecap="round" />}
      <Ojos tipo={expresion === 'feliz' || racha ? 'felices' : expresion === 'tranquilo' ? 'cerrados' : 'abiertos'} r={8} />
      {triste && <path d="M80 100 q-4 8 0 12 q4 -4 0 -12 Z" fill="#7FB3D9" />}
      <Mejillas />
    </>
  );
}

function Papa() {
  const piel = '#93A6B3';
  return (
    <>
      <path d="M36 200 C36 158 66 142 100 142 C134 142 164 158 164 200 Z" fill="#1D6F62" />
      <path d="M86 144 L100 160 L114 144" fill="none" stroke="#CFE6DF" strokeWidth="4" strokeLinejoin="round" />
      <Orejas piel={piel} interior="#D9B8B5" dx={-2} dy={-2} />
      <circle cx="100" cy="86" r="48" fill={piel} />
      <Trompa piel={piel} linea="#6F8494" d="M100 108 C100 136 96 152 114 162" />
      <path d="M70 72 l20 -4 M130 72 l-20 -4" stroke="#4A3A2E" strokeWidth="5" strokeLinecap="round" />
      <g transform="translate(0,-4)"><Ojos r={6.5} /></g>
      <path d="M100 112 C92 104 78 104 70 114 C78 112 84 118 92 118 C96 118 99 116 100 114 C101 116 104 118 108 118 C116 118 122 112 130 114 C122 104 108 104 100 112 Z" fill="#4A3A2E" />
    </>
  );
}

function Mama() {
  const piel = '#A7B6C2';
  return (
    <>
      <path d="M38 200 C38 158 66 144 100 144 C134 144 162 158 162 200 Z" fill="#C2577A" />
      <path d="M80 150 C88 162 112 162 120 150" fill="none" stroke="#F7E4EA" strokeWidth="4" strokeLinecap="round" />
      <Orejas piel={piel} interior="#E9C1C6" dx={-1} dy={-2} />
      <circle cx="152" cy="138" r="5" fill="#E3B23C" />
      <circle cx="100" cy="88" r="46" fill={piel} />
      <Trompa piel={piel} linea="#7E909E" d="M100 110 C100 136 96 150 112 160" />
      <g transform="translate(0,-2)"><Ojos r={7} /></g>
      <path d="M76 80 l-6 -5 M78 77 l-3 -7 M124 80 l6 -5 M122 77 l3 -7" stroke="#1E2A28" strokeWidth="2.5" strokeLinecap="round" />
      <g transform="translate(0,-2)"><Mejillas /></g>
      {[[138, 54], [150, 50], [146, 62], [134, 44], [146, 40]].map(([x, y]) => <circle key={x + '-' + y} cx={x} cy={y} r="8" fill="#E8772E" />)}
      <circle cx="142" cy="51" r="6" fill="#FFE8D6" />
    </>
  );
}

function Tutor() {
  const piel = '#9AAAB8';
  return (
    <>
      <path d="M38 200 C38 158 66 144 100 144 C134 144 162 158 162 200 Z" fill="#3E5C8A" />
      <Orejas piel={piel} interior="#DDB9B6" dx={-1} dy={-2} />
      <circle cx="100" cy="88" r="46" fill={piel} />
      <Trompa piel={piel} linea="#76889A" d="M100 110 C100 132 98 142 106 150" />
      <g transform="translate(0,-2)"><Ojos r={6.5} /></g>
      <circle cx="83" cy="86" r="15" fill="none" stroke="#1E2A28" strokeWidth="4" />
      <circle cx="117" cy="86" r="15" fill="none" stroke="#1E2A28" strokeWidth="4" />
      <path d="M98 86 h4 M68 84 l-12 -4 M132 84 l12 -4" stroke="#1E2A28" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 164 L100 172 L140 164 L140 200 L100 208 L60 200 Z" fill="#E8772E" />
      <path d="M100 172 L100 208" stroke="#B4561A" strokeWidth="3" />
      <path d="M66 170 L96 176 M104 176 L134 170" stroke="#FFE8D6" strokeWidth="2.5" strokeLinecap="round" />
    </>
  );
}

function Psicologo() {
  const piel = '#A3B3BF';
  return (
    <>
      <path d="M36 200 C36 158 66 142 100 142 C134 142 164 158 164 200 Z" fill="#FFFFFF" stroke="#C9D3CF" strokeWidth="3" />
      <path d="M86 144 L100 176 L114 144 Z" fill="#6DBB9B" />
      <path d="M84 144 L100 182 L92 200 M116 144 L100 182 L108 200" fill="none" stroke="#C9D3CF" strokeWidth="3" strokeLinejoin="round" />
      <rect x="124" y="170" width="18" height="16" rx="2" fill="none" stroke="#C9D3CF" strokeWidth="3" />
      <path d="M130 164 v12" stroke="#1D6F62" strokeWidth="3" strokeLinecap="round" />
      <Orejas piel={piel} interior="#E2BDBA" dx={-2} dy={-2} />
      <circle cx="100" cy="88" r="46" fill={piel} />
      <Trompa piel={piel} linea="#7B8D9B" d="M100 110 C100 132 98 144 90 152" />
      <path d="M76 84 q7 -7 14 0 M110 84 q7 -7 14 0" stroke="#1E2A28" strokeWidth="4" fill="none" strokeLinecap="round" />
      <g transform="translate(0,-4)"><Mejillas /></g>
      <rect x="48" y="160" width="30" height="38" rx="3" fill="#1D6F62" />
      <path d="M54 170 h18 M54 178 h18 M54 186 h12" stroke="#CFE6DF" strokeWidth="2.5" strokeLinecap="round" />
    </>
  );
}

function Admin() {
  const piel = '#9FAFBC';
  return (
    <>
      <path d="M38 200 C38 158 66 144 100 144 C134 144 162 158 162 200 Z" fill="#2F4A5E" />
      <path d="M78 148 L100 186 L122 148" fill="none" stroke="#E3B23C" strokeWidth="4" />
      <rect x="88" y="180" width="24" height="20" rx="3" fill="#FFFFFF" stroke="#E3B23C" strokeWidth="2" />
      <path d="M93 188 h14 M93 194 h10" stroke="#2F4A5E" strokeWidth="2" strokeLinecap="round" />
      <Orejas piel={piel} interior="#DDBAB7" dx={-1} dy={-2} />
      <circle cx="100" cy="88" r="46" fill={piel} />
      <Trompa piel={piel} linea="#7A8B98" d="M100 110 C100 130 104 140 116 146" />
      <g transform="translate(0,-2)"><Ojos r={6.5} /></g>
      <g transform="translate(0,-2)"><Mejillas /></g>
    </>
  );
}

export function Avatar({ rol = 'alumno', expresion = 'normal', tamano = 64, fondo = true, titulo }) {
  const Cuerpo = { alumno: Alumno, padre: Papa, madre: Mama, tutor: Tutor, psicologo: Psicologo, admin: Admin }[rol] ?? Alumno;
  const id = `clip-${rol}-${expresion}`;
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 200 200" role="img" aria-label={titulo ?? `Avatar: ${NOMBRE_ROL[rol] ?? rol}`} style={{ flexShrink: 0, display: 'block' }}>
      <defs>
        <clipPath id={id}><circle cx="100" cy="100" r="100" /></clipPath>
      </defs>
      <g clipPath={fondo ? `url(#${id})` : undefined}>
        {fondo && <circle cx="100" cy="100" r="100" fill={FONDOS[rol]} />}
        <Cuerpo expresion={expresion} />
      </g>
    </svg>
  );
}
