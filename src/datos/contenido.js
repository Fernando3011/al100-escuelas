// Contenido base de al100 Escuelas.
// Adapta los 8 temas de al100 (pensados para familias) al punto de vista de
// alumnos de secundaria, preparatoria y universidad.
//
// IMPORTANTE: todo este contenido es una PROPUESTA en estado "pendiente".
// El equipo de treselefantes lo revisa, edita o reemplaza desde el panel de
// contenido de la app. Este archivo solo se usa para:
//   1) generar supabase/instalar.sql (npm run sql)
//   2) el modo demo (cuando la app no tiene Supabase configurado)
//
// Formato de cada paso de una lección:
//   { tipo: 'idea', titulo, texto }
//   { tipo: 'pregunta', texto, opciones: [...], correcta: <índice>, explicacion }
//   { tipo: 'reflexion', texto }

export const TEMAS = [
  {
    slug: 'sueno-y-comida',
    nombre: 'Dormir y comer bien',
    nombre_familia: 'Sueño y Comida',
    descripcion: 'Tu cuerpo también siente: cómo el sueño y la comida cambian tu ánimo.',
    descripcion_familia: 'No duerme, pesadillas, batallas en la mesa, mala alimentación.',
    color: '#3E8E54',
    dinamica_titulo: 'Mi batería del día',
    dinamica_texto:
      'Cada quien dibuja una batería y la llena según cómo durmió y comió hoy. En parejas comparten (si quieren) una cosa que les carga la batería y una que se las baja. Cierre: el grupo arma una lista de “cargadores” que no cuestan dinero.',
    lecciones: [
      {
        titulo: 'Dormir también es estudiar',
        pasos: [
          { tipo: 'idea', titulo: 'Tu cerebro trabaja de noche', texto: 'Mientras duermes, tu cerebro ordena lo que aprendiste en el día y regula tus emociones. Por eso, cuando duermes poco, todo se siente más pesado y es más fácil enojarse.' },
          { tipo: 'pregunta', texto: '¿Cuántas horas necesita dormir, más o menos, una persona de tu edad?', opciones: ['5 a 6 horas', '8 a 10 horas', '12 a 14 horas'], correcta: 1, explicacion: 'En la adolescencia se recomiendan entre 8 y 10 horas. En la universidad, al menos 7.' },
          { tipo: 'idea', titulo: 'La luz de la pantalla engaña', texto: 'La luz del celular le dice a tu cuerpo que todavía es de día y te cuesta más dormirte. Dejarlo 30 minutos antes de acostarte ayuda mucho.' },
          { tipo: 'pregunta', texto: 'Andrea se duerme a la 1 a.m. viendo videos y en la mañana está irritable. ¿Qué le ayudaría más?', opciones: ['Tomar más café', 'Dejar el celular lejos de la cama un rato antes de dormir', 'Dormirse viendo videos más tranquilos'], correcta: 1, explicacion: 'Alejar la pantalla le da a su cuerpo la señal de que ya es hora de descansar.' },
          { tipo: 'reflexion', texto: '¿Qué podrías cambiar esta semana en tu noche para descansar mejor?' },
        ],
      },
      {
        titulo: 'Comer con hambre o comer con emoción',
        pasos: [
          { tipo: 'idea', titulo: 'Dos tipos de hambre', texto: 'El hambre física llega poco a poco y se calma con cualquier comida. El hambre emocional llega de golpe, pide algo específico (dulce, salado) y aparece cuando estamos aburridos, estresados o tristes.' },
          { tipo: 'pregunta', texto: 'Después de una discusión, Diego siente ganas urgentes de comer papitas aunque comió hace una hora. ¿Qué tipo de hambre parece?', opciones: ['Hambre física', 'Hambre emocional'], correcta: 1, explicacion: 'Llegó de golpe, pide algo específico y apareció después de una emoción fuerte.' },
          { tipo: 'idea', titulo: 'No es malo, es una señal', texto: 'Todos comemos por emoción a veces. Lo útil es notarlo y preguntarte: ¿qué necesito de verdad ahora? A veces es descansar, hablar con alguien o moverte.' },
          { tipo: 'reflexion', texto: '¿En qué momentos notas que comes por emoción y no por hambre?' },
        ],
      },
      {
        titulo: 'Energía que no cuesta',
        pasos: [
          { tipo: 'idea', titulo: 'Comer bien no tiene que ser caro', texto: 'Frijol, amaranto, huevo, tortilla, fruta de temporada y agua simple te dan energía estable para todo el día sin gastar de más.' },
          { tipo: 'pregunta', texto: '¿Cuál de estos desayunos te da energía más estable para la mañana?', opciones: ['Un refresco y unas galletas', 'Huevo con frijoles y tortilla', 'Nada, para aguantar hasta el recreo'], correcta: 1, explicacion: 'Proteína y fibra liberan energía poco a poco. El azúcar sola sube rápido y luego te deja sin pila.' },
          { tipo: 'pregunta', texto: 'Si saltas comidas seguido, ¿qué puede pasar con tu ánimo?', opciones: ['Nada, el ánimo no tiene que ver', 'Es más fácil sentirte irritable, cansado o sin concentración'], correcta: 1, explicacion: 'Tu cerebro necesita energía constante. Sin ella, las emociones se desbordan más fácil.' },
          { tipo: 'reflexion', texto: 'Escribe un “cargador” de energía sencillo que podrías llevar a la escuela.' },
        ],
      },
    ],
    consejos: [
      { titulo: 'Acompaña el descanso, no lo vigiles', evita: '“¡Ya apaga ese celular o te lo quito!”', prueba: '“Vamos a dejar los celulares cargando en la sala a las 10. Yo también dejo el mío.”', pregunta: '¿Qué te ayuda a dormirte cuando te cuesta trabajo?' },
      { titulo: 'La mesa es para convivir', evita: '“No te levantas hasta que te acabes todo.”', prueba: '“Sirve lo que creas que vas a comer. Si te quedas con hambre, hay más.”', pregunta: '¿Cuál es tu comida favorita que podríamos preparar juntos este fin de semana?' },
    ],
  },
  {
    slug: 'rutinas-y-orden',
    nombre: 'Organizar mi día',
    nombre_familia: 'Rutinas y Orden',
    descripcion: 'Tareas, pendientes y procrastinación: cómo organizarte sin estresarte.',
    descripcion_familia: 'Vestirse, tarea, recoger el cuarto o salir de casa sin peleas.',
    color: '#2F6FB2',
    dinamica_titulo: 'El frasco de las piedras grandes',
    dinamica_texto:
      'Muestra (o dibuja) un frasco: si primero metes arena (redes, pendientes chiquitos) ya no caben las piedras grandes (lo importante). Cada alumno escribe sus 3 “piedras grandes” de la semana y un horario realista para cada una. Cierre: compartir un truco que les funciona para no dejar todo al final.',
    lecciones: [
      {
        titulo: '¿Por qué dejo todo para el final?',
        pasos: [
          { tipo: 'idea', titulo: 'Procrastinar no es flojera', texto: 'Muchas veces dejamos algo para después porque nos genera una emoción incómoda: miedo a hacerlo mal, aburrimiento o no saber por dónde empezar.' },
          { tipo: 'pregunta', texto: 'Mateo pospone su ensayo porque teme que no le quede bien. ¿Qué emoción está detrás?', opciones: ['Flojera', 'Miedo a equivocarse', 'Felicidad'], correcta: 1, explicacion: 'Cuando algo nos importa mucho, el miedo a que salga mal puede paralizarnos.' },
          { tipo: 'idea', titulo: 'La regla de los 5 minutos', texto: 'Comprométete a trabajar solo 5 minutos. Empezar es lo más difícil; casi siempre, una vez que arrancas, sigues.' },
          { tipo: 'reflexion', texto: '¿Qué pendiente has estado posponiendo y qué emoción te provoca?' },
        ],
      },
      {
        titulo: 'Pasos pequeños',
        pasos: [
          { tipo: 'idea', titulo: 'Divide la montaña', texto: '“Hacer el proyecto” asusta. “Buscar 3 fuentes”, “hacer el índice” y “escribir la introducción” se sienten posibles.' },
          { tipo: 'pregunta', texto: '¿Cuál de estos es un paso pequeño y concreto?', opciones: ['Estudiar para el examen', 'Hacer 10 ejercicios del tema 3', 'Ponerme al corriente'], correcta: 1, explicacion: 'Un paso concreto dice exactamente qué hacer y se puede terminar en una sesión.' },
          { tipo: 'pregunta', texto: 'Tienes 3 tareas y poco tiempo. ¿Qué conviene hacer primero?', opciones: ['La más urgente o importante', 'La más fácil siempre', 'La que menos te gusta, sin pensar'], correcta: 0, explicacion: 'Prioriza por urgencia e importancia. Si estás bloqueado, empezar por algo fácil también puede darte impulso.' },
          { tipo: 'reflexion', texto: 'Divide uno de tus pendientes en 3 pasos pequeños.' },
        ],
      },
      {
        titulo: 'Descansar también se planea',
        pasos: [
          { tipo: 'idea', titulo: 'No eres una máquina', texto: 'Trabajar 25 minutos y descansar 5 rinde más que estar 3 horas distraído. Tu cerebro necesita pausas para concentrarse.' },
          { tipo: 'pregunta', texto: '¿Qué tipo de descanso recarga más en una pausa corta de estudio?', opciones: ['Abrir redes sociales “solo un ratito”', 'Levantarte, estirarte o tomar agua'], correcta: 1, explicacion: 'Las redes suelen alargarse y no dejan descansar a tu mente. Moverte sí la recarga.' },
          { tipo: 'reflexion', texto: '¿Qué haces para descansar de verdad cuando estás saturado?' },
        ],
      },
    ],
    consejos: [
      { titulo: 'Rutinas en equipo', evita: '“¡Siempre es lo mismo contigo, nunca haces nada!”', prueba: '“Hagamos una lista de lo que hay que hacer en la mañana y la pegamos en el refri.”', pregunta: '¿Qué parte del día se te hace más pesada y cómo te podemos ayudar?' },
      { titulo: 'Acompañar sin hacerles la tarea', evita: '“Dámelo, yo lo hago más rápido.”', prueba: '“¿Por dónde quieres empezar? Estoy aquí si te atoras.”', pregunta: '¿Qué materia te gusta más y por qué?' },
    ],
  },
  {
    slug: 'comunicacion-y-peleas',
    nombre: 'Hablar y resolver conflictos',
    nombre_familia: 'Comunicación y Peleas',
    descripcion: 'Discutir sin lastimar y reparar después de una pelea.',
    descripcion_familia: 'Gritos, falta de respeto, silencios, cómo reparar después.',
    color: '#4458C2',
    dinamica_titulo: 'Del “tú siempre” al “yo siento”',
    dinamica_texto:
      'Escribe en el pizarrón frases de pelea comunes (“Tú nunca me escuchas”). En equipos las transforman a mensajes “yo”: “Yo me siento ignorado cuando… y me gustaría…”. Cierre: actuar una mini escena con la versión nueva y comentar cómo cambia la respuesta del otro.',
    lecciones: [
      {
        titulo: 'Mensajes “yo”',
        pasos: [
          { tipo: 'idea', titulo: 'Hablar de ti, no atacar', texto: 'Cuando decimos “tú siempre” o “tú nunca”, el otro se defiende. Hablar de lo que tú sientes abre la conversación: “Yo me siento… cuando… y me gustaría…”.' },
          { tipo: 'pregunta', texto: '¿Cuál es un mensaje “yo”?', opciones: ['“Eres un egoísta, nunca me prestas nada.”', '“Me molesta cuando tomas mis cosas sin preguntar. Me gustaría que me avisaras.”', '“Haz lo que quieras.”'], correcta: 1, explicacion: 'Dice qué sientes, qué pasó y qué te gustaría, sin insultar.' },
          { tipo: 'pregunta', texto: 'Tu mamá te dice que llegas tarde y tú quieres explicar. ¿Qué ayuda más?', opciones: ['Subir la voz para que te escuche', 'Respirar, bajar el tono y explicar qué pasó'], correcta: 1, explicacion: 'Cuando bajas el tono, el otro también suele bajarlo.' },
          { tipo: 'reflexion', texto: 'Piensa en una discusión reciente. ¿Cómo la dirías con un mensaje “yo”?' },
        ],
      },
      {
        titulo: 'Escuchar de verdad',
        pasos: [
          { tipo: 'idea', titulo: 'Escuchar no es esperar tu turno', texto: 'Escuchar es intentar entender qué siente el otro, aunque no estés de acuerdo. Una señal: repetir con tus palabras lo que te dijo.' },
          { tipo: 'pregunta', texto: 'Tu amiga te cuenta que está triste. ¿Qué respuesta muestra escucha?', opciones: ['“Uy, a mí me pasó algo peor.”', '“Suena a que te dolió mucho. ¿Quieres contarme más?”', '“Ya, no es para tanto.”'], correcta: 1, explicacion: 'Reconoces lo que siente y le das espacio, sin compararte ni minimizar.' },
          { tipo: 'reflexion', texto: '¿Quién te escucha bien a ti? ¿Qué hace esa persona?' },
        ],
      },
      {
        titulo: 'Reparar después de pelear',
        pasos: [
          { tipo: 'idea', titulo: 'Todos nos equivocamos', texto: 'Pelear es normal. Lo que fortalece una relación es reparar: reconocer tu parte, pedir perdón sin “peros” y acordar algo para la próxima.' },
          { tipo: 'pregunta', texto: '¿Cuál es una disculpa que repara?', opciones: ['“Perdón, pero tú empezaste.”', '“Perdón por gritarte. Estaba enojado, pero no estuvo bien.”', '“Ya, ¿contento?”'], correcta: 1, explicacion: 'Reconoce lo que hiciste sin culpar al otro.' },
          { tipo: 'pregunta', texto: '¿Cuándo conviene hablar de una pelea?', opciones: ['En el momento más intenso', 'Cuando ambos estén más tranquilos'], correcta: 1, explicacion: 'Con las emociones altas es difícil escuchar. Tomarse un tiempo no es huir si luego regresas a hablar.' },
          { tipo: 'reflexion', texto: '¿Hay alguna relación que quisieras reparar? ¿Cuál sería un primer paso?' },
        ],
      },
    ],
    consejos: [
      { titulo: 'Bajar la voz para que te escuchen', evita: '“¡A mí no me hablas así!” (gritando)', prueba: '“Me doy cuenta de que estamos muy enojados. Hablemos en 10 minutos, cuando estemos más tranquilos.”', pregunta: '¿Hay algo que te gustaría que cambiara en cómo hablamos en casa?' },
      { titulo: 'Reparar también es educar', evita: '“Yo soy tu papá/mamá, no tengo por qué disculparme.”', prueba: '“Perdón por gritarte ayer. Estaba cansado/a, pero tú no tenías la culpa.”', pregunta: '¿Te acuerdas de alguna vez que arreglamos una pelea? ¿Qué nos ayudó?' },
    ],
  },
  {
    slug: 'emociones-y-limites',
    nombre: 'Manejar mis emociones fuertes',
    nombre_familia: 'Berrinches y Límites',
    descripcion: 'Enojo, frustración y cómo decir “no” sin explotar.',
    descripcion_familia: 'Explosiones emocionales, desobediencia y cómo decir “no” sin violencia.',
    color: '#B4413A',
    dinamica_titulo: 'El semáforo de las emociones',
    dinamica_texto:
      'Dibuja un semáforo: verde (tranquilo), amarillo (empieza a subir), rojo (exploto). Cada alumno escribe qué siente en el cuerpo en cada color y una acción para frenar en amarillo. Practiquen juntos la respiración 4-4-6 (inhala 4, sostén 4, exhala 6) tres veces.',
    lecciones: [
      {
        titulo: 'Tu cuerpo avisa antes',
        pasos: [
          { tipo: 'idea', titulo: 'Las emociones se sienten', texto: 'Antes de explotar, el cuerpo avisa: calor en la cara, puños apretados, corazón rápido, estómago revuelto. Aprender a notarlo te da tiempo para elegir qué hacer.' },
          { tipo: 'pregunta', texto: 'Diego va a exponer en 5 minutos. Tiene el estómago revuelto y las manos frías. ¿Qué siente?', opciones: ['Aburrimiento', 'Nervios', 'Alegría'], correcta: 1, explicacion: 'El cuerpo reacciona a los nervios antes de que los pensemos.' },
          { tipo: 'pregunta', texto: '¿Qué señal suele indicar enojo?', opciones: ['Músculos relajados', 'Mandíbula apretada y calor en la cara', 'Ganas de dormir'], correcta: 1, explicacion: 'El enojo prepara al cuerpo para defenderse: tensa músculos y acelera el corazón.' },
          { tipo: 'reflexion', texto: '¿Dónde sientes tú el enojo o los nervios en el cuerpo?' },
        ],
      },
      {
        titulo: 'Respirar con calma',
        pasos: [
          { tipo: 'idea', titulo: 'Respiración 4-4-6', texto: 'Inhala contando 4, sostén 4 y exhala lento contando 6. Exhalar más largo que inhalar le dice a tu cuerpo que está a salvo. Hazlo 3 veces.' },
          { tipo: 'pregunta', texto: '¿Por qué ayuda exhalar más largo?', opciones: ['Porque así no respiras', 'Porque calma el ritmo del corazón y relaja al cuerpo', 'No ayuda en nada'], correcta: 1, explicacion: 'Una exhalación larga activa la parte del sistema nervioso que nos calma.' },
          { tipo: 'idea', titulo: 'Pausa antes de responder', texto: 'Cuando estás en “rojo”, alejarte un momento, tomar agua o contar hasta 10 evita decir algo de lo que después te arrepientas.' },
          { tipo: 'reflexion', texto: 'Prueba ahora la respiración 4-4-6. ¿Cómo te sientes después?' },
        ],
      },
      {
        titulo: 'Decir “no” sin pelear',
        pasos: [
          { tipo: 'idea', titulo: 'Poner límites es cuidarte', texto: 'Decir “no” a algo que no quieres hacer no te hace mala persona. Puedes ser firme y amable al mismo tiempo.' },
          { tipo: 'pregunta', texto: 'Tus amigos insisten en que te saltes una clase. ¿Cuál es un “no” firme y amable?', opciones: ['“Bueno… está bien.”', '“No, gracias. Nos vemos al rato.”', '“¡Déjenme en paz, qué pesados!”'], correcta: 1, explicacion: 'Es claro, no da explicaciones de más y no ataca.' },
          { tipo: 'reflexion', texto: '¿A qué te ha costado trabajo decir que no?' },
        ],
      },
    ],
    consejos: [
      { titulo: 'Nombra la emoción antes de corregir', evita: '“¡Ya deja de llorar!”', prueba: '“Veo que estás muy frustrado. Aquí estoy. Cuando te calmes, buscamos una solución juntos.”', pregunta: '¿Qué te ayuda cuando estás muy enojado/a?' },
      { titulo: 'Límites firmes, tono amable', evita: '“¡Porque yo lo digo y punto!”', prueba: '“Entiendo que quieras ir. La respuesta es no porque es muy tarde, y podemos ver otra opción el sábado.”', pregunta: '¿Qué regla de la casa te parece injusta y por qué?' },
    ],
  },
  {
    slug: 'pantallas-y-redes',
    nombre: 'Pantallas y redes',
    nombre_familia: 'Pantallas y Tecnología',
    descripcion: 'Redes, videojuegos, comparación y cuidarte en internet.',
    descripcion_familia: 'Videojuegos, redes sociales, pornografía y seguridad en internet.',
    color: '#227E93',
    dinamica_titulo: 'Detrás del filtro',
    dinamica_texto:
      'Muestra dos versiones de una misma foto: una “perfecta” y la original. Pregunta: ¿qué no vemos en redes? En equipos hacen una lista de cosas que nadie publica (días malos, granos, fracasos). Cierre: cada quien escribe una cuenta o contenido que le hace sentir bien y uno que le hace sentir mal.',
    lecciones: [
      {
        titulo: 'Comparar mi vida con un filtro',
        pasos: [
          { tipo: 'idea', titulo: 'Las redes muestran los mejores momentos', texto: 'En redes casi nadie publica sus días malos. Comparar tu vida completa con los mejores momentos de otros siempre te hará sentir que te falta algo.' },
          { tipo: 'pregunta', texto: 'Después de ver redes una hora, Valeria se siente fea y aburrida. ¿Qué le ayudaría?', opciones: ['Seguir viendo hasta sentirse mejor', 'Notar cómo se siente y dejar de seguir cuentas que la hacen sentir mal', 'Publicar algo para recibir likes'], correcta: 1, explicacion: 'Tú puedes elegir qué ves. Tu feed también se cuida.' },
          { tipo: 'reflexion', texto: '¿Qué cuentas te hacen sentir bien y cuáles te hacen sentir mal?' },
        ],
      },
      {
        titulo: 'Cuidarme en internet',
        pasos: [
          { tipo: 'idea', titulo: 'Lo que subes se queda', texto: 'Una foto o mensaje puede guardarse y compartirse aunque lo borres. Antes de enviar algo, pregúntate: ¿me importaría que lo vieran mis papás o mi escuela?' },
          { tipo: 'pregunta', texto: 'Alguien que conociste en un juego en línea te pide fotos y que no le digas a nadie. ¿Qué haces?', opciones: ['Se las mando, parece buena persona', 'No envío nada, lo bloqueo y se lo cuento a un adulto de confianza', 'Le pido que me mande las suyas primero'], correcta: 1, explicacion: 'Pedir secreto es una señal de alerta. Contarlo no es acusar: es cuidarte.' },
          { tipo: 'pregunta', texto: 'Ves que en un grupo se burlan de un compañero con memes. ¿Qué puedes hacer?', opciones: ['Reenviarlo, es solo broma', 'No compartirlo, apoyar al compañero y avisar a un adulto', 'Ignorarlo, no es tu problema'], correcta: 1, explicacion: 'El ciberacoso crece cuando otros lo comparten o se quedan callados.' },
          { tipo: 'reflexion', texto: '¿A qué adulto le contarías si algo en internet te hace sentir incómodo?' },
        ],
      },
      {
        titulo: 'Yo controlo la pantalla',
        pasos: [
          { tipo: 'idea', titulo: 'Diseñadas para que no las sueltes', texto: 'Las apps están hechas para mantenerte el mayor tiempo posible: scroll infinito, notificaciones, rachas. No es falta de voluntad; es diseño.' },
          { tipo: 'pregunta', texto: '¿Cuál de estas ideas te ayuda a usar menos el celular sin pelear contigo?', opciones: ['Apagar notificaciones que no son importantes', 'Tener el celular siempre en la mano', 'Usarlo hasta que se acabe la batería'], correcta: 0, explicacion: 'Menos notificaciones = menos interrupciones y menos tentación.' },
          { tipo: 'reflexion', texto: '¿Cómo te sientes después de mucho tiempo en el celular?' },
        ],
      },
    ],
    consejos: [
      { titulo: 'Acuerdos, no solo prohibiciones', evita: '“Se acabó, te quito el celular un mes.”', prueba: '“Hagamos juntos un acuerdo de pantallas para toda la familia, incluidos nosotros.”', pregunta: '¿Qué es lo que más te gusta de tu juego o red favorita? ¿Me enseñas?' },
      { titulo: 'Que sepa que puede contarte', evita: '“Si te pasa algo en internet es tu culpa por estar ahí.”', prueba: '“Si algo en internet te incomoda o te asusta, puedes contarme y no te voy a regañar.”', pregunta: '¿Alguna vez viste algo en internet que te hizo sentir incómodo/a?' },
    ],
  },
  {
    slug: 'cambios-y-perdidas',
    nombre: 'Cambios y pérdidas',
    nombre_familia: 'Cambios, Divorcio y Duelo',
    descripcion: 'Mudanzas, separaciones y despedidas: cómo atravesar lo que cambia.',
    descripcion_familia: 'Separaciones, mudanzas, muertes o llegada de hermanos.',
    color: '#5B4FBF',
    dinamica_titulo: 'La línea de mi vida',
    dinamica_texto:
      'Cada alumno dibuja una línea con 3 o 4 cambios importantes de su vida (cambio de escuela, mudanza, nuevo hermano). Sobre cada uno escribe qué sintió y qué o quién le ayudó. Nadie está obligado a compartir. Cierre: listar en grupo cosas que ayudan cuando algo cambia.',
    lecciones: [
      {
        titulo: 'Todo cambio mueve algo',
        pasos: [
          { tipo: 'idea', titulo: 'Incluso los cambios buenos cuestan', texto: 'Cambiarte de escuela, mudarte o que llegue un hermanito puede ser emocionante y difícil al mismo tiempo. Sentir las dos cosas es normal.' },
          { tipo: 'pregunta', texto: 'Luis se cambió de ciudad y extraña a sus amigos, aunque le gusta su casa nueva. ¿Qué le pasa?', opciones: ['Está mal sentir dos cosas a la vez', 'Es normal sentir emoción y tristeza al mismo tiempo'], correcta: 1, explicacion: 'Las emociones pueden convivir. Una no cancela a la otra.' },
          { tipo: 'reflexion', texto: '¿Qué cambio importante has vivido y qué te ayudó?' },
        ],
      },
      {
        titulo: 'Cuando mis papás se separan',
        pasos: [
          { tipo: 'idea', titulo: 'No es tu culpa', texto: 'Cuando los papás se separan es una decisión de adultos sobre su relación. Nunca es culpa de los hijos, aunque a veces lo sintamos así.' },
          { tipo: 'pregunta', texto: '¿Qué puede ayudarte si tus papás se están separando?', opciones: ['Guardarte todo para no preocupar a nadie', 'Hablar de cómo te sientes con alguien de confianza', 'Elegir a uno de los dos'], correcta: 1, explicacion: 'Expresar lo que sientes te ayuda a no cargarlo solo. No tienes que elegir bando.' },
          { tipo: 'reflexion', texto: '¿Con quién podrías hablar si algo en tu familia está cambiando?' },
        ],
      },
      {
        titulo: 'Despedirse duele',
        pasos: [
          { tipo: 'idea', titulo: 'El duelo no tiene reglas', texto: 'Cuando alguien muere o perdemos algo importante, podemos sentir tristeza, enojo, culpa o incluso nada por un tiempo. No hay una forma correcta de vivirlo.' },
          { tipo: 'pregunta', texto: 'Un compañero perdió a su abuela. ¿Qué podrías decirle?', opciones: ['“Ya supéralo, fue hace una semana.”', '“Lo siento mucho. Si quieres hablar o solo estar acompañado, aquí estoy.”', 'Nada, mejor evitarlo.'], correcta: 1, explicacion: 'Acompañar sin presionar es de lo que más ayuda.' },
          { tipo: 'reflexion', texto: '¿Cómo te gusta que te acompañen cuando estás triste?' },
        ],
      },
    ],
    consejos: [
      { titulo: 'Decir la verdad con cuidado', evita: '“No pasa nada, todo sigue igual.”', prueba: '“Van a cambiar algunas cosas y es normal que te sientas raro/a. Puedes preguntarme lo que quieras.”', pregunta: '¿Qué es lo que más te preocupa de este cambio?' },
      { titulo: 'Los hijos no son mensajeros', evita: '“Dile a tu papá/mamá que…”', prueba: 'Habla directamente con el otro adulto y deja a tu hijo/a fuera de los temas de pareja.', pregunta: '¿Cómo te sientes cuando estás en cada casa?' },
    ],
  },
  {
    slug: 'relaciones-sanas',
    nombre: 'Relaciones sanas',
    nombre_familia: 'Acuerdos de Pareja',
    descripcion: 'Amistad, noviazgo y respeto: cómo reconocer lo que sí y lo que no.',
    descripcion_familia: 'Diferencias al criar, desgaste y cansancio extremo.',
    color: '#8247B8',
    dinamica_titulo: 'Verde o rojo',
    dinamica_texto:
      'Lee en voz alta situaciones de amistad y noviazgo (“revisa tu celular”, “respeta cuando dices que no”, “te pide que no veas a tus amigos”). Los alumnos levantan una tarjeta verde (sano) o roja (señal de alerta) y explican por qué. Cierre: construir juntos una definición de “relación sana”.',
    lecciones: [
      {
        titulo: '¿Qué hace sana una relación?',
        pasos: [
          { tipo: 'idea', titulo: 'Respeto, confianza y libertad', texto: 'En una relación sana —de amistad o de pareja— te sientes libre de ser tú, puedes decir lo que piensas y tus decisiones se respetan.' },
          { tipo: 'pregunta', texto: '¿Cuál es una señal de una relación sana?', opciones: ['Te pide tus contraseñas para “demostrar confianza”', 'Respeta cuando dices que no', 'Se enoja si sales con tus amigos'], correcta: 1, explicacion: 'Respetar tus límites es básico. Lo demás son formas de control.' },
          { tipo: 'reflexion', texto: '¿Con quién te sientes libre de ser tú?' },
        ],
      },
      {
        titulo: 'Señales de alerta',
        pasos: [
          { tipo: 'idea', titulo: 'Los celos no son amor', texto: 'Revisar tu celular, decirte cómo vestirte, alejarte de tus amigos o hacerte sentir culpable no son pruebas de amor: son señales de control.' },
          { tipo: 'pregunta', texto: 'Ana dice que su novio la quiere mucho porque le pide su ubicación todo el tiempo. ¿Qué piensas?', opciones: ['Es una prueba de amor', 'Puede ser una señal de control'], correcta: 1, explicacion: 'El amor no necesita vigilarte. La confianza no se demuestra cediendo tu privacidad.' },
          { tipo: 'pregunta', texto: 'Si una amiga te cuenta que su pareja la controla, ¿qué ayuda más?', opciones: ['Juzgarla por seguir con esa persona', 'Escucharla, creerle y animarla a hablar con un adulto de confianza'], correcta: 1, explicacion: 'Sentirse escuchada sin juicio facilita pedir ayuda.' },
          { tipo: 'reflexion', texto: '¿Qué señales de alerta te gustaría que tus amigos conocieran?' },
        ],
      },
      {
        titulo: 'Mi “sí” y mi “no”',
        pasos: [
          { tipo: 'idea', titulo: 'El consentimiento es claro y se puede cambiar', texto: 'Un “sí” tiene que ser libre, sin presión. Y aunque hayas dicho que sí, puedes cambiar de opinión en cualquier momento.' },
          { tipo: 'pregunta', texto: 'Si alguien no dice nada o se queda callado, ¿eso es un sí?', opciones: ['Sí, quien calla otorga', 'No. El silencio no es consentimiento'], correcta: 1, explicacion: 'Solo un sí claro y libre es un sí.' },
          { tipo: 'reflexion', texto: '¿Cómo puedes preguntar y respetar el “no” de otra persona?' },
        ],
      },
    ],
    consejos: [
      { titulo: 'Frente unido, aunque piensen distinto', evita: 'Desautorizar al otro adulto frente a los hijos.', prueba: '“Lo platico con tu papá/mamá y te respondemos juntos.”', pregunta: '¿Sientes que en casa te decimos cosas distintas? ¿Cuáles?' },
      { titulo: 'Hablar de relaciones sin miedo', evita: '“Estás muy chico/a para andar de novio/a.”', prueba: '“Me interesa saber cómo te tratan tus amigos y tu pareja. ¿Cómo te sientes con ellos?”', pregunta: '¿Qué crees que hace que una relación sea sana?' },
    ],
  },
  {
    slug: 'cuidarme-y-pedir-ayuda',
    nombre: 'Cuidarme y pedir ayuda',
    nombre_familia: 'Situaciones de Riesgo',
    descripcion: 'Cuando algo pesa demasiado: reconocerlo y pedir ayuda a tiempo.',
    descripcion_familia: 'Autolesiones, sustancias, ansiedad grave o conductas que asustan.',
    color: '#A66A10',
    dinamica_titulo: 'Mi red de apoyo',
    dinamica_texto:
      'Cada alumno dibuja una mano: en cada dedo escribe una persona o lugar al que puede acudir si algo le pesa demasiado (familiar, amigo, tutor, psicología escolar, Línea de la Vida). Recuerda al grupo dónde está el área de psicología y cómo pedir una cita. Tema sensible: avisa antes, permite no participar y quédate disponible al final.',
    lecciones: [
      {
        titulo: 'Pedir ayuda es de valientes',
        pasos: [
          { tipo: 'idea', titulo: 'No tienes que poder con todo', texto: 'A veces la tristeza, la ansiedad o el estrés pesan demasiado para cargarlos solo. Pedir ayuda no es debilidad: es lo que hacen las personas que se cuidan.' },
          { tipo: 'pregunta', texto: '¿Cuál de estas es una señal de que conviene pedir ayuda?', opciones: ['Sentirte triste o sin ganas de nada casi todos los días por semanas', 'Estar nervioso antes de un examen'], correcta: 0, explicacion: 'Los nervios antes de un examen son normales. Cuando el malestar dura semanas y no se va, es momento de hablar con alguien.' },
          { tipo: 'reflexion', texto: '¿Quiénes son 3 personas a las que podrías acudir?' },
        ],
      },
      {
        titulo: 'Cuando un amigo no está bien',
        pasos: [
          { tipo: 'idea', titulo: 'Un secreto que no se guarda', texto: 'Si un amigo te cuenta que se quiere hacer daño o que está en peligro, ese es un secreto que no debes guardar. Contárselo a un adulto de confianza puede salvarlo.' },
          { tipo: 'pregunta', texto: 'Tu amigo te dice que se siente muy mal y te pide que no le digas a nadie. ¿Qué haces?', opciones: ['Guardo el secreto para que no se enoje', 'Lo escucho, le digo que me importa y busco a un adulto de confianza', 'Le digo que no exagere'], correcta: 1, explicacion: 'Puede enojarse al principio, pero su seguridad es más importante. No tienes que resolverlo tú solo.' },
          { tipo: 'reflexion', texto: '¿A qué adulto de tu escuela podrías acudir en una situación así?' },
        ],
      },
      {
        titulo: 'Presión y sustancias',
        pasos: [
          { tipo: 'idea', titulo: 'No todos lo hacen', texto: 'Aunque parezca que “todos” toman o vapean, la mayoría de los adolescentes no lo hace. La presión de grupo nos hace creer que estamos solos si decimos que no.' },
          { tipo: 'pregunta', texto: 'En una fiesta te ofrecen algo que no quieres probar. ¿Qué puedes decir?', opciones: ['“No, gracias, estoy bien así.”', 'Aceptar para no quedar mal'], correcta: 0, explicacion: 'Un “no” simple y seguro es suficiente. Tus verdaderos amigos lo respetan.' },
          { tipo: 'reflexion', texto: '¿Qué te ayudaría a decir que no en una situación de presión?' },
        ],
      },
    ],
    consejos: [
      { titulo: 'Escuchar sin alarmarse', evita: '“¿Cómo se te ocurre? ¡Me vas a matar del susto!”', prueba: '“Gracias por contármelo. Te creo y vamos a buscar ayuda juntos.”', pregunta: '¿Hay algo que te esté pesando y que no me hayas podido contar?' },
      { titulo: 'Conoce las señales', evita: 'Pensar que “es una etapa” cuando el cambio dura semanas.', prueba: 'Si notas aislamiento, cambios fuertes de sueño o ánimo, o señales de daño, busca apoyo profesional y habla con la escuela.', pregunta: '¿Cómo te has sentido estas últimas semanas, de verdad?' },
    ],
  },
];

// Catálogos que usa la app
export const ANIMOS = [
  { valor: 1, nombre: 'Muy bien', color: '#1D6F62' },
  { valor: 2, nombre: 'Bien', color: '#6DBB9B' },
  { valor: 3, nombre: 'Regular', color: '#E3B23C' },
  { valor: 4, nombre: 'Bajo', color: '#E8772E' },
  { valor: 5, nombre: 'Mal', color: '#A63D33' },
];

export const ETIQUETAS = ['Escuela', 'Familia', 'Amistades', 'Yo', 'Salud', 'Redes'];

export const FRASES = [
  'El comportamiento es comunicación. ¿Qué intenta decirte tu hijo/a hoy?',
  'No se trata de ser padres perfectos, sino de reparar cuando nos equivocamos.',
  'Un límite firme se puede decir con voz tranquila.',
  'Escuchar sin corregir también es educar.',
  'Las emociones no se portan mal: se sienten. Lo que se acompaña es la conducta.',
  'Tu calma es el primer lugar seguro de tu hijo/a.',
  'Preguntar “¿cómo estás?” y esperar la respuesta cambia conversaciones.',
];
