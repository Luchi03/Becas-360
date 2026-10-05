// ===================================================
// CHATBOT BUHO 360 - BECAS 360 (POSGRADO)
// ===================================================

document.addEventListener("DOMContentLoaded", function () {

  // ---------- FORMULARIO DE POSTULACION ----------
  // Evita que la pagina se recargue al enviar y muestra un mensaje de confirmacion.
  // En esta version los datos no se envian a ningun servidor ni se guardan.
  const formulario = document.getElementById("contactForm");
  const mensajeExito = document.getElementById("mensajeExito");

  if (formulario && mensajeExito) {
    formulario.addEventListener("submit", function (e) {
      e.preventDefault();
      const nombre = document.getElementById("nombre").value.trim().split(" ")[0];
      mensajeExito.textContent = `¡Gracias, ${nombre}! Recibimos tu solicitud. Un asesor de BECAS 360 se comunicará contigo por correo o WhatsApp.`;
      mensajeExito.hidden = false;
      formulario.reset();
      mensajeExito.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  const burbuja = document.getElementById("chatbotBurbuja");
  const contenedorChat = document.getElementById("contenedorChat");
  const cerrarChat = document.getElementById("cerrarChat");
  const cuerpoChat = document.getElementById("cuerpoChat");
  const inputMensaje = document.getElementById("inputMensaje");
  const botonEnviar = document.getElementById("botonEnviar");

  // ---------- ESTADO DE LA CONVERSACION ----------
  const estado = {
    nombre: "",
    esperandoNombre: true,
    pasoActual: 0,
    respuestas: {},
    seleccionMultiple: []
  };

  // ---------- PASOS DEL CUESTIONARIO GUIADO ----------
  const pasos = [
    {
      clave: "tipo",
      pregunta: nombre => `¡Mucho gusto, ${nombre}! 👋 ¿Qué tipo de posgrado estás buscando?`,
      opciones: ["📘 Especialización", "🎓 Maestría", "🔬 Doctorado", "🤔 Aún no lo sé"]
    },
    {
      clave: "nivel",
      pregunta: () => "¿Cuál es tu situación académica actual?",
      opciones: ["Últimos ciclos de la universidad", "Bachiller", "Titulado/Licenciado", "Ya tengo una maestría"]
    },
    {
      clave: "area",
      pregunta: () => "¿En qué área te gustaría estudiar?",
      opciones: ["Administración y negocios", "Ingeniería y tecnología", "Ciencias de la salud", "Ciencias sociales", "Educación", "Arte y diseño", "Ciencias", "Otra"]
    },
    {
      clave: "pais",
      pregunta: () => "¿En qué país te gustaría estudiar?",
      opciones: ["🇵🇪 Perú", "🇺🇸 Estados Unidos", "🇬🇧 Reino Unido", "🇪🇸 España", "🇩🇪 Alemania", "🇨🇦 Canadá", "🇨🇱 Chile", "🌎 Otro país"]
    },
    {
      clave: "modalidad",
      pregunta: () => "¿Qué modalidad prefieres?",
      opciones: ["Presencial", "Virtual", "Híbrida", "No tengo preferencia"]
    },
    {
      clave: "financiamiento",
      pregunta: () => "¿Qué porcentaje de financiamiento necesitas?",
      opciones: ["100% financiada", "Más del 50%", "Financiamiento parcial", "No importa"]
    },
    {
      clave: "gastos",
      pregunta: () => "¿Qué gastos necesitas que cubra la beca? Puedes elegir varios y luego tocar \"Continuar\".",
      opciones: ["🎓 Matrícula", "📚 Mensualidad", "✈️ Pasajes", "🏠 Alojamiento", "🍽️ Alimentación", "🩺 Seguro médico", "💰 Manutención", "Todo lo anterior"],
      multiple: true
    },
    {
      clave: "promedio",
      pregunta: () => "¿Cuál fue tu promedio en la universidad?",
      opciones: ["Menos de 11", "Entre 11 y 13", "Entre 14 y 16", "Entre 17 y 20"]
    },
    {
      clave: "pasaporte",
      pregunta: () => "¿Tienes pasaporte vigente?",
      opciones: ["Sí", "No", "Estoy en proceso"]
    },
    {
      clave: "idioma",
      pregunta: () => "¿Qué nivel de inglés u otro idioma tienes?",
      opciones: ["Básico", "Intermedio", "Avanzado", "No tengo certificación"]
    },
    {
      clave: "viajar",
      pregunta: () => "¿Tienes disponibilidad para viajar?",
      opciones: ["Sí", "No", "Depende de la oportunidad"]
    },
    {
      clave: "inicio",
      pregunta: () => "¿Cuándo te gustaría comenzar tu posgrado?",
      opciones: ["Lo antes posible", "2027", "2028", "No estoy seguro/a"]
    },
    {
      clave: "duracion",
      pregunta: () => "Última pregunta: ¿qué duración buscas?",
      opciones: ["Menos de 1 año", "1 a 2 años", "3 a 5 años", "No estoy seguro/a"]
    }
  ];

  // ---------- ACCESOS RAPIDOS ----------
  const respuestasRapidas = {
    "📋 Ver requisitos": "📋 Cada beca de posgrado tiene sus propios requisitos, pero casi todas piden: título o grado de bachiller, certificado de notas, carta de motivación o ensayo, cartas de recomendación y, muchas veces, un certificado de idioma. Puedes ver el paso a paso en la sección \"¿Cómo funciona?\".",
    "📅 Ver convocatorias próximas": "📅 Publicamos nuevas convocatorias cada mes en la sección de Becas. Si quieres, puedo ayudarte a encontrar una que cierre pronto: escribe \"buscar\" y comenzamos 🔍",
    "❓ ¿Cómo postulo?": "❓ Postular es sencillo: 1) elige tu programa, 2) prepara tus documentos, 3) completa el formulario de la sección \"Postula\" y 4) nosotros te hacemos seguimiento.",
    "💬 Hablar con un asesor": "💬 ¡Claro! Completa el formulario de la sección \"Postula\" o escríbenos por WhatsApp (lo encuentras al final de la página, en \"Contáctanos\"). Un asesor de BECAS 360 se comunicará contigo."
  };

  // ---------- UTILIDADES PARA DIBUJAR MENSAJES ----------
  function desplazarAbajo() {
    cuerpoChat.scrollTop = cuerpoChat.scrollHeight;
  }

  function agregarMensaje(texto, tipo) {
    const burbujaMensaje = document.createElement("div");
    burbujaMensaje.classList.add("mensaje", tipo);
    burbujaMensaje.textContent = texto;
    cuerpoChat.appendChild(burbujaMensaje);
    desplazarAbajo();
  }

  function agregarBotonesAccesoRapido() {
    const contenedorAccesos = document.createElement("div");
    contenedorAccesos.classList.add("accesos-rapidos");

    const accesos = ["🔍 Buscar una beca", "📋 Ver requisitos", "📅 Ver convocatorias próximas", "❓ ¿Cómo postulo?", "💬 Hablar con un asesor"];

    accesos.forEach(texto => {
      const boton = document.createElement("button");
      boton.classList.add("acceso");
      boton.textContent = texto;
      boton.addEventListener("click", () => manejarAccesoRapido(texto));
      contenedorAccesos.appendChild(boton);
    });

    cuerpoChat.appendChild(contenedorAccesos);
    desplazarAbajo();
  }

  // Reinicia el cuestionario desde la primera pregunta
  function empezarBusqueda() {
    estado.pasoActual = 0;
    estado.respuestas = {};
    estado.seleccionMultiple = [];
    setTimeout(() => mostrarPaso(0), 400);
  }

  function manejarAccesoRapido(texto) {
    agregarMensaje(texto, "usuario");

    if (texto === "🔍 Buscar una beca") {
      empezarBusqueda();
      return;
    }

    const respuesta = respuestasRapidas[texto];
    if (respuesta) {
      setTimeout(() => agregarMensaje(respuesta, "bot"), 400);
    }
  }

  // ---------- DIBUJAR OPCIONES (botones) DE UN PASO ----------
  function mostrarOpciones(paso) {
    const contenedorOpciones = document.createElement("div");
    contenedorOpciones.classList.add("opciones");

    paso.opciones.forEach(opcion => {
      const boton = document.createElement("button");
      boton.classList.add("opcion");
      boton.textContent = opcion;
      boton.addEventListener("click", () => manejarClicOpcion(paso, opcion, boton, contenedorOpciones));
      contenedorOpciones.appendChild(boton);
    });

    if (paso.multiple) {
      const botonContinuar = document.createElement("button");
      botonContinuar.classList.add("opcion", "opcion-continuar");
      botonContinuar.textContent = "➡️ Continuar";
      botonContinuar.addEventListener("click", () => confirmarSeleccionMultiple(paso, contenedorOpciones));
      contenedorOpciones.appendChild(botonContinuar);
    }

    cuerpoChat.appendChild(contenedorOpciones);
    desplazarAbajo();
  }

  function manejarClicOpcion(paso, opcion, boton, contenedorOpciones) {
    if (paso.multiple) {
      boton.classList.toggle("seleccionada");
      const indice = estado.seleccionMultiple.indexOf(opcion);
      if (indice === -1) {
        estado.seleccionMultiple.push(opcion);
      } else {
        estado.seleccionMultiple.splice(indice, 1);
      }
      return;
    }

    // Deshabilita todas las opciones del paso una vez elegida
    Array.from(contenedorOpciones.querySelectorAll(".opcion")).forEach(b => (b.disabled = true));
    agregarMensaje(opcion, "usuario");
    estado.respuestas[paso.clave] = opcion;
    avanzarPaso();
  }

  function confirmarSeleccionMultiple(paso, contenedorOpciones) {
    if (estado.seleccionMultiple.length === 0) {
      agregarMensaje("Elige al menos una opción antes de continuar 🙂", "bot");
      return;
    }
    Array.from(contenedorOpciones.querySelectorAll(".opcion")).forEach(b => (b.disabled = true));
    const textoSeleccion = estado.seleccionMultiple.join(", ");
    agregarMensaje(textoSeleccion, "usuario");
    estado.respuestas[paso.clave] = [...estado.seleccionMultiple];
    estado.seleccionMultiple = [];
    avanzarPaso();
  }

  function avanzarPaso() {
    estado.pasoActual++;
    setTimeout(() => {
      if (estado.pasoActual < pasos.length) {
        mostrarPaso(estado.pasoActual);
      } else {
        mostrarResultados();
      }
    }, 500);
  }

  function mostrarPaso(indice) {
    const paso = pasos[indice];
    const texto = typeof paso.pregunta === "function" ? paso.pregunta(estado.nombre) : paso.pregunta;
    agregarMensaje(texto, "bot");
    mostrarOpciones(paso);
  }

  // ---------- RESULTADOS FINALES ----------
  function mostrarResultados() {
    agregarMensaje("🎯 ¡Listo! Encontramos algunas oportunidades para ti:", "bot");

    const contenedorResultados = document.createElement("div");
    contenedorResultados.classList.add("mensaje", "bot");
    contenedorResultados.style.display = "flex";
    contenedorResultados.style.flexDirection = "column";
    contenedorResultados.style.gap = "8px";
    contenedorResultados.style.maxWidth = "95%";
    contenedorResultados.style.background = "transparent";
    contenedorResultados.style.border = "none";
    contenedorResultados.style.padding = "0";

    // Becas de ejemplo (para la demo). Usan las respuestas del usuario.
    const tipoElegido = estado.respuestas.tipo || "🎓 Maestría";
    const becasEjemplo = [
      { nombre: "Beca Talento Perú", pais: estado.respuestas.pais || "🇵🇪 Perú", tipo: tipoElegido, financiamiento: estado.respuestas.financiamiento || "100% financiada", cierre: "15/03/2027" },
      { nombre: "Beca Horizonte Global", pais: "🌎 Varios países", tipo: tipoElegido, financiamiento: "Más del 50%", cierre: "30/04/2027" },
      { nombre: "Beca Impulso Académico", pais: "🇵🇪 Perú", tipo: tipoElegido, financiamiento: "Financiamiento parcial", cierre: "10/06/2027" }
    ];

    becasEjemplo.forEach(beca => {
      const tarjeta = document.createElement("div");
      tarjeta.classList.add("tarjeta-beca");
      tarjeta.innerHTML = `
        <h4>${beca.nombre}</h4>
        <p>${beca.pais} · ${beca.tipo}</p>
        <p>💰 Financiamiento: ${beca.financiamiento}</p>
        <p>📅 Cierre: ${beca.cierre}</p>
        <div class="acciones-beca">
          <a href="#requisitos" class="ver-requisitos">Ver requisitos</a>
          <a href="#contactanos" class="postular">Postular</a>
        </div>
      `;
      contenedorResultados.appendChild(tarjeta);
    });

    cuerpoChat.appendChild(contenedorResultados);
    desplazarAbajo();

    setTimeout(() => {
      agregarMensaje(`¿Quieres que te ayude con algo más, ${estado.nombre}?`, "bot");
      agregarBotonesAccesoRapido();
    }, 500);
  }

  // ---------- MANEJO DE TEXTO ESCRITO ----------
  function manejarEnvioMensaje() {
    const texto = inputMensaje.value.trim();
    if (texto === "") return;

    agregarMensaje(texto, "usuario");
    inputMensaje.value = "";
    botonEnviar.disabled = true;

    if (estado.esperandoNombre) {
      estado.nombre = texto.split(" ")[0];
      estado.esperandoNombre = false;
      setTimeout(() => mostrarPaso(0), 500);
    } else if (texto.toLowerCase().includes("buscar")) {
      // Si escriben "buscar", empieza una nueva busqueda
      empezarBusqueda();
    } else {
      // Mientras el cuestionario está activo, se guían con botones
      setTimeout(() => agregarMensaje("Puedes responder tocando una de las opciones de arriba 👆", "bot"), 400);
    }
  }

  inputMensaje.addEventListener("input", () => {
    botonEnviar.disabled = inputMensaje.value.trim() === "";
  });

  inputMensaje.addEventListener("keydown", e => {
    if (e.key === "Enter" && !botonEnviar.disabled) {
      manejarEnvioMensaje();
    }
  });

  botonEnviar.addEventListener("click", manejarEnvioMensaje);

  // ---------- ARRASTRAR LA BURBUJA ----------
  let arrastrando = false; // true mientras el dedo o el mouse esta presionado
  let seMovio = false;     // true si de verdad se arrastro (no fue solo un clic)
  let inicioX = 0, inicioY = 0;   // donde empezo el arrastre
  let ajusteX = 0, ajusteY = 0;   // distancia entre el puntero y la esquina de la burbuja

  // evita que la burbuja se salga de la pantalla
  function limitar(valor, minimo, maximo) {
    return Math.min(Math.max(valor, minimo), maximo);
  }

  function moverBurbuja(x, y) {
    const margen = 8;
    x = limitar(x, margen, window.innerWidth - burbuja.offsetWidth - margen);
    y = limitar(y, margen, window.innerHeight - burbuja.offsetHeight - margen);
    burbuja.style.left = x + "px";
    burbuja.style.top = y + "px";
    burbuja.style.right = "auto";
    burbuja.style.bottom = "auto";
  }

  // pone la ventana del chat al lado de la burbuja, donde haya espacio
  function colocarChat() {
    if (!contenedorChat.classList.contains("abierto")) return;
    const margen = 8;
    const separacion = 12;
    const b = burbuja.getBoundingClientRect();
    const ancho = contenedorChat.offsetWidth;
    const alto = contenedorChat.offsetHeight;

    // horizontal: alineado al borde derecho de la burbuja
    let x = b.right - ancho;
    x = limitar(x, margen, window.innerWidth - ancho - margen);

    // vertical: arriba de la burbuja si cabe, si no, abajo
    let y = b.top - alto - separacion;
    if (y < margen) {
      y = b.bottom + separacion;
    }
    y = limitar(y, margen, window.innerHeight - alto - margen);

    contenedorChat.style.left = x + "px";
    contenedorChat.style.top = y + "px";
    contenedorChat.style.right = "auto";
    contenedorChat.style.bottom = "auto";
  }

  burbuja.addEventListener("pointerdown", e => {
    arrastrando = true;
    seMovio = false;
    inicioX = e.clientX;
    inicioY = e.clientY;
    const b = burbuja.getBoundingClientRect();
    ajusteX = e.clientX - b.left;
    ajusteY = e.clientY - b.top;
    burbuja.setPointerCapture(e.pointerId); // sigue al puntero aunque salga de la burbuja
  });

  burbuja.addEventListener("pointermove", e => {
    if (!arrastrando) return;
    // solo cuenta como arrastre si se movio mas de 5 pixeles
    if (Math.abs(e.clientX - inicioX) > 5 || Math.abs(e.clientY - inicioY) > 5) {
      seMovio = true;
      burbuja.classList.add("arrastrando");
    }
    if (!seMovio) return;
    moverBurbuja(e.clientX - ajusteX, e.clientY - ajusteY);
    colocarChat();
  });

  function soltar() {
    arrastrando = false;
    burbuja.classList.remove("arrastrando");
  }
  burbuja.addEventListener("pointerup", soltar);
  burbuja.addEventListener("pointercancel", soltar);

  // si cambia el tamaño de la ventana, la burbuja y el chat no se salen
  window.addEventListener("resize", () => {
    if (burbuja.style.left) {
      moverBurbuja(parseFloat(burbuja.style.left), parseFloat(burbuja.style.top));
    }
    colocarChat();
  });

  // ---------- ABRIR / CERRAR EL CHAT ----------
  let chatIniciado = false;

  function abrirChat() {
    contenedorChat.classList.add("abierto");
    colocarChat();
    if (!chatIniciado) {
      chatIniciado = true;
      agregarMensaje("🦉 ¡Hola! Soy Búho 360. Estoy aquí para ayudarte a encontrar una beca de posgrado que se adapte a ti.\n¿Cuál es tu nombre?", "bot");
    }
    inputMensaje.focus();
  }

  function cerrarChatWidget() {
    contenedorChat.classList.remove("abierto");
  }

  burbuja.addEventListener("click", () => {
    // si la burbuja se acaba de arrastrar, no abrimos ni cerramos el chat
    if (seMovio) {
      seMovio = false;
      return;
    }
    if (contenedorChat.classList.contains("abierto")) {
      cerrarChatWidget();
    } else {
      abrirChat();
    }
  });

  cerrarChat.addEventListener("click", cerrarChatWidget);

});