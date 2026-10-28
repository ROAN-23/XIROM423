/*
 * XIROM | PORTAL v0.2 — COMPORTAMIENTO
 * -----------------------------------------------------------
 * config.js = lo que puedes cambiar sin programar.
 * app.js = como transforma esos datos en botones, movimiento
 * y acciones. Lee los comentarios de cada bloque para aprender.
 */
(function () {
  'use strict';

  const datos = window.XIROM_PORTAL || {};
  const enlaces = datos.enlaces || {};
  const $ = (selector) => document.querySelector(selector);

  // 1. SEGURIDAD: solo permitimos enlaces web y, cuando corresponde, mailto.
  function enlaceWeb(valor) {
    if (typeof valor !== 'string' || !valor.trim()) return '';
    try {
      const url = new URL(valor.trim());
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (e) { return ''; }
  }
  function enlaceCorreo(valor) {
    if (typeof valor !== 'string') return '';
    const email = valor.trim().replace(/^mailto:/i, '');
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : '';
  }
  function configurarEnlace(selector, destino) {
    const nodo = $(selector);
    if (!nodo) return;
    const href = enlaceWeb(destino);
    if (href) nodo.href = href;
    else nodo.hidden = true;
  }

  // 2. ENLACES PRINCIPALES: la direccion sale de config.js.
  configurarEnlace('#enlace-catalogo', enlaces.catalogo);
  const numero = String(enlaces.whatsapp || '').replace(/\D/g, '');
  const whatsapp = numero ? `https://wa.me/${numero}?text=${encodeURIComponent(enlaces.whatsappMensaje || '')}` : '';
  configurarEnlace('#enlace-cotizacion', whatsapp);

  // 3. REDES: no creamos botones falsos. Si un enlace esta vacio, se oculta.
  const redes = $('#redes');
  const plataformas = [
    { clave: 'instagram', nombre: 'Instagram', descripcion: 'NUESTROS TRABAJOS', icono: 'icon-instagram' },
    { clave: 'facebook', nombre: 'Facebook', descripcion: 'COMUNIDAD XIROM', icono: 'icon-facebook' },
    { clave: 'tiktok', nombre: 'TikTok', descripcion: 'EN MOVIMIENTO', icono: 'icon-tiktok' },
    { clave: 'correo', nombre: 'Correo', descripcion: 'ESCRÍBENOS', icono: 'icon-mail' }
  ];
  function iconoSVG(nombre, clase) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add(clase);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${nombre}`);
    svg.append(use);
    return svg;
  }
  if (redes) {
    redes.replaceChildren();
    plataformas.forEach((plataforma) => {
      const href = plataforma.clave === 'correo' ? enlaceCorreo(enlaces.correo) : enlaceWeb(enlaces[plataforma.clave]);
      if (!href) return;

      const tarjeta = document.createElement('a');
      tarjeta.className = `social-card social-card--${plataforma.clave}`;
      tarjeta.href = href;
      tarjeta.setAttribute('aria-label', `Abrir ${plataforma.nombre}`);
      if (plataforma.clave !== 'correo') {
        tarjeta.target = '_blank';
        tarjeta.rel = 'noopener noreferrer';
      }
      const contenedorIcono = document.createElement('span');
      contenedorIcono.className = 'social-card__icon';
      contenedorIcono.append(iconoSVG(plataforma.icono, 'social-svg'));
      const contenedorTexto = document.createElement('span');
      contenedorTexto.className = 'social-card__label';
      const titulo = document.createElement('strong');
      titulo.textContent = plataforma.nombre;
      const descripcion = document.createElement('small');
      descripcion.textContent = plataforma.descripcion;
      contenedorTexto.append(titulo, descripcion);
      const flecha = document.createElement('span');
      flecha.className = 'social-card__arrow';
      flecha.append(iconoSVG('icon-arrow', 'social-arrow-svg'));
      tarjeta.append(contenedorIcono, contenedorTexto, flecha);
      redes.appendChild(tarjeta);
    });
    if (!redes.children.length) $('.connections').hidden = true;
  }

  // 4. LOGO: se usa exactamente la imagen configurada, sin dibujar una sustitucion.
  document.querySelectorAll('[data-xirom-logo]').forEach((img) => {
    const fallback = img.parentElement.querySelector('.logo-fallback');
    function usarRespaldo() {
      img.hidden = true;
      if (fallback) fallback.hidden = false;
    }
    function imagenLista() {
      if (img.naturalWidth > 0) {
        img.hidden = false;
        if (fallback) fallback.hidden = true;
      } else usarRespaldo();
    }
    img.addEventListener('load', imagenLista);
    img.addEventListener('error', usarRespaldo);
    if (datos.logo) {
      img.src = datos.logo;
      if (img.complete) imagenLista();
    } else usarRespaldo();
  });

  // 5. EFECTO DE LUZ: la posicion del raton ilumina un poco cada tarjeta.
  //    En celulares usamos las transiciones tactiles de CSS, sin rastreo.
  if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.interactive-card').forEach((tarjeta) => {
      tarjeta.addEventListener('pointermove', (evento) => {
        const r = tarjeta.getBoundingClientRect();
        tarjeta.style.setProperty('--mx', `${evento.clientX - r.left}px`);
        tarjeta.style.setProperty('--my', `${evento.clientY - r.top}px`);
      }, { passive: true });
    });
  }

  // 6. APARICION ESCALONADA: la pagina sigue usable si esta funcion no existe.
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    const observar = [...document.querySelectorAll('.action-card, .connections, .footer')];
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.setAttribute('data-revelar', 'visible');
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -22px 0px' });
    observar.forEach((nodo, indice) => {
      nodo.style.transitionDelay = `${Math.min(indice, 2) * 95}ms`;
      nodo.setAttribute('data-revelar', 'oculto');
      observador.observe(nodo);
    });
  }

  // 7. INTRO: se ejecuta una vez por sesion y puede omitirse.
  const intro = $('#intro');
  const btnOmitir = $('#omitir-intro');
  const animar = document.documentElement.dataset.intro === 'mostrar';
  let terminando = false;
  let reloj;
  function terminarIntro() {
    if (!animar || terminando) return;
    terminando = true;
    window.clearTimeout(reloj);
    intro.classList.add('intro--saliendo');
    try { sessionStorage.setItem('xirom-portal-intro-v2', 'vista'); } catch (e) {}
    // Dejamos terminar el fundido ANTES de esconder la capa.
    window.setTimeout(() => {
      intro.hidden = true;
      document.documentElement.removeAttribute('data-intro');
    }, 590);
  }
  if (intro) {
    if (animar) {
      btnOmitir.addEventListener('click', terminarIntro);
      document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') terminarIntro();
      });
      window.requestAnimationFrame(() => intro.classList.add('intro--activo'));
      reloj = window.setTimeout(terminarIntro, 2350);
    } else intro.hidden = true;
  }

  // 8. COMPARTIR: se activa cuando el portal este publicado y comprobado.
  const botonCompartir = $('#compartir');
  const mensajeEstado = $('#estado-compartir');
  const url = enlaceWeb(datos.urlPublica);
  if (datos.compartirHabilitado === true && url && botonCompartir) {
    botonCompartir.hidden = false;
    botonCompartir.addEventListener('click', async () => {
      try {
        if (navigator.share) {
          await navigator.share({ title: 'XIROM | Portal', text: 'La forma de lo invisible', url });
          mensajeEstado.textContent = '';
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
          mensajeEstado.textContent = '¡Enlace copiado! Ya puedes compartirlo.';
        } else mensajeEstado.textContent = `Comparte esta dirección: ${url}`;
      } catch (e) {
        if (e.name !== 'AbortError') mensajeEstado.textContent = `Comparte esta dirección: ${url}`;
      }
    });
  }
})();
