import { Link } from 'react-router-dom';

// BORRADOR: este aviso es una plantilla. Antes de usar la app con alumnos reales,
// la escuela y treselefantes deben revisarlo con asesoría legal (LFPDPPP).
export default function Privacidad() {
  return (
    <div className="contenido" style={{ paddingBottom: 48 }}>
      <Link to="/" className="boton-texto">← Volver</Link>
      <h1>Aviso de privacidad</h1>
      <div className="aviso info">Borrador para revisión. La escuela y treselefantes deben validarlo antes de usar la app con alumnos.</div>
      <div className="tarjeta pila">
        <h2>Qué datos usamos</h2>
        <p>Nombre, correo y rol (alumno, familia o personal escolar); el grupo al que perteneces; tus check-ins de ánimo, lecciones completadas y, si la usas, tu bitácora.</p>
        <h2>Para qué</h2>
        <p>Para acompañar el bienestar emocional de los alumnos en las tutorías, calcular rachas, sugerir contenido y, según el protocolo de cada escuela, avisar al personal cuando un alumno puede necesitar apoyo.</p>
        <h2>Quién ve qué</h2>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li><b>Tu bitácora solo la lees tú.</b> Nadie más: ni tu tutor, ni psicología, ni tu familia.</li>
          <li>Tu tutor/a ve el ánimo de su grupo <b>en conjunto y de forma anónima</b> (solo si hay 3 o más alumnos), las rachas y el avance. No ve tu ánimo individual.</li>
          <li>Tu familia ve qué tema se trabaja en clase y tu racha. No ve tu ánimo ni tu bitácora.</li>
          <li>Si marcas “Bajo” o “Mal” varios días seguidos, o pides hablar con alguien, el personal que tu escuela haya definido recibe un aviso para acercarse contigo.</li>
        </ul>
        <h2>Menores de edad</h2>
        <p>Los alumnos menores de edad usan la app con conocimiento y consentimiento de su madre, padre o tutor, y bajo el acuerdo de su escuela.</p>
        <h2>Tus derechos</h2>
        <p>Puedes pedir acceder, corregir o borrar tus datos escribiendo a [CORREO DE CONTACTO DE LA ESCUELA / TRESELEFANTES].</p>
        <h2>No es un servicio de emergencia</h2>
        <p>al100 Escuelas no sustituye la atención profesional. Si estás en peligro, llama al 911 o a la Línea de la Vida: 800 911 2000.</p>
      </div>
    </div>
  );
}
