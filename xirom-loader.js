/*
 XIROM | Catalogo — Escena de carga y fondo v4.0
 ------------------------------------------------
 Este archivo trabaja con xirom-loader.css existente.
 No modifica PDF ni dFlip. No presenta enlaces directos al PDF.

 Dos mejoras visibles:
 1) Revelacion del catalogo por capas, en vez de corte/fundido brusco.
 2) Atmósfera grafica POR ENCIMA del fondo de dFlip,
    y SOLO en los laterales, sin tapar las paginas ni los controles.
*/
(function () {
  'use strict';
  if (window.XIROMCatalogLoader && window.XIROMCatalogLoader.version === '4.0') return;

  var LOADER_ID = 'xirom-catalog-loader';
  var ATMOS_ID = 'xirom-catalog-atmosphere';
  var STYLE_ID = 'xirom-catalog-v4-style';
  var MIN_SHOW = 300;
  var MAX_SHOW = 4000; // Seguridad: nunca deja bloqueado el catalogo.
  var EXIT_TIME = 1100;
  var loader = null;
  var started = 0;
  var closed = false;
  var waitTimer = 0;
  var closeTimer = 0;

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* ---------------------------------------------------------
         FONDO VISUAL REAL: sobre el canvas opaco del visor dFlip.
         z-index 9980 < logo y accesos (10000) < loader (30000).
         No intercepta toques, zoom, hojas ni enlaces.
         --------------------------------------------------------- */
      #${ATMOS_ID} {
        position: fixed; inset: 0; z-index: 9980;
        overflow: hidden; isolation: isolate;
        pointer-events: none; user-select: none;
        background: transparent;
        opacity: 0;
        transition: opacity 1100ms ease;
        contain: layout paint;
      }
      #${ATMOS_ID}.xirom-atmosphere--visible { opacity: 1; }
      #${ATMOS_ID}::before {
        content: "";
        position: absolute; inset: 0;
        background:
          radial-gradient(ellipse 54% 76% at 2% 45%, rgba(55,109,164,.39) 0%, rgba(55,109,164,.12) 45%, transparent 78%),
          radial-gradient(ellipse 49% 80% at 100% 58%, rgba(108,83,143,.37) 0%, rgba(108,83,143,.11) 48%, transparent 82%),
          radial-gradient(ellipse 40% 53% at 13% 93%, rgba(71,122,104,.29), transparent 77%),
          radial-gradient(ellipse 37% 53% at 93% 4%, rgba(55,109,164,.22), transparent 74%),
          repeating-linear-gradient(125deg, transparent 0 56px, rgba(236,233,226,.055) 57px, transparent 59px);
        -webkit-mask-image: linear-gradient(to right, #000 0%, #000 17%, transparent 34%, transparent 66%, #000 83%, #000 100%);
        mask-image: linear-gradient(to right, #000 0%, #000 17%, transparent 34%, transparent 66%, #000 83%, #000 100%);
      }
      #${ATMOS_ID}::after {
        content: "";
        position: absolute;
        inset: 16px;
        border-top: 1px solid rgba(236,233,226,.15);
        border-bottom: 1px solid rgba(236,233,226,.12);
        background:
          linear-gradient(90deg, transparent, rgba(55,109,164,.25) 10%, transparent 34%, transparent 66%, rgba(108,83,143,.25) 90%, transparent) top / 100% 1px no-repeat;
        -webkit-mask-image: linear-gradient(to right,#000 0%,#000 24%,transparent 32%,transparent 68%,#000 76%,#000 100%);
        mask-image: linear-gradient(to right,#000 0%,#000 24%,transparent 32%,transparent 68%,#000 76%,#000 100%);
      }
      #${ATMOS_ID} .xirom-atmosphere__side {
        position: absolute;
        top: 14%; bottom: 14%;
        width: min(27vw, 450px);
        opacity: .85;
      }
      #${ATMOS_ID} .xirom-atmosphere__side--left { left: -7%; }
      #${ATMOS_ID} .xirom-atmosphere__side--right { right: -7%; transform: rotate(180deg); }
      #${ATMOS_ID} .xirom-atmosphere__side::before {
        content: "";
        position: absolute;
        inset: 4% 0;
        border: 1px solid rgba(236,233,226,.17);
        border-radius: 50%;
        transform: rotate(-20deg);
        box-shadow: 0 0 0 42px rgba(55,109,164,.018), 0 0 0 105px rgba(236,233,226,.013);
      }
      #${ATMOS_ID} .xirom-atmosphere__side::after {
        content: "";
        position: absolute;
        inset: 23% 21%;
        border: 1px solid rgba(71,122,104,.27);
        transform: rotate(45deg);
      }
      #${ATMOS_ID} .xirom-atmosphere__caption {
        position: absolute;
        top: 50%; left: 19px;
        transform: translateY(-50%);
        writing-mode: vertical-rl;
        color: rgba(236,233,226,.39);
        font: 600 10px/1.4 'Segoe UI', sans-serif;
        letter-spacing: .38em;
      }
      #${ATMOS_ID} .xirom-atmosphere__caption--right { left: auto; right: 19px; transform: translateY(-50%) rotate(180deg); }

      /* ---------------------------------------------------------
         SALIDA ESCALONADA (sin destello negro ni corte abrupto):
         1. El contenido del logo se atenúa y se eleva.
         2. Dos planos laterales se deslizan y revelan el libro.
         3. El DOM se elimina SOLO después de acabar el movimiento.
         --------------------------------------------------------- */
      #${LOADER_ID} {
        background: transparent !important;
        overflow: hidden !important;
        opacity: 1 !important;
        visibility: visible !important;
        transition: none !important;
        will-change: auto;
      }
      #${LOADER_ID}::before,
      #${LOADER_ID}::after {
        content: "";
        position: absolute;
        top: 0; bottom: 0;
        width: calc(50% + 1px);
        height: 100%;
        inset-block: 0;
        z-index: 0 !important;
        transform: translateX(0);
        opacity: 1;
        pointer-events: none;
        animation: none !important;
        transition: transform 980ms cubic-bezier(.25,.75,.18,1), opacity 680ms ease 180ms;
        will-change: transform;
        border: 0;
      }
      #${LOADER_ID}::before {
        left: 0; right: auto; inset-inline-start: 0; inset-inline-end: auto;
        background:
          radial-gradient(ellipse at 70% 38%, rgba(55,109,164,.17), transparent 65%),
          repeating-linear-gradient(115deg, transparent 0 74px, rgba(236,233,226,.018) 75px, transparent 76px),
          linear-gradient(145deg,#151A23,#0D1018 75%);
      }
      #${LOADER_ID}::after {
        left: auto; right: 0; inset-inline-end: 0; inset-inline-start: auto;
        background:
          radial-gradient(ellipse at 30% 62%, rgba(108,83,143,.17), transparent 67%),
          repeating-linear-gradient(65deg, transparent 0 74px, rgba(236,233,226,.018) 75px, transparent 76px),
          linear-gradient(215deg,#16161F,#0D1018 75%);
      }
      #${LOADER_ID} .xirom-loader__layout {
        position: relative;
        z-index: 2;
      }
      #${LOADER_ID}.xirom-loader--exiting {
        pointer-events: none !important;
      }
      #${LOADER_ID}.xirom-loader--exiting .xirom-loader__layout {
        animation: none !important;
        opacity: 0 !important;
        filter: blur(5px);
        transform: translateY(-17px) scale(.97) !important;
        transition: opacity 480ms ease, transform 650ms cubic-bezier(.22,.7,.2,1), filter 540ms ease !important;
        pointer-events: none;
      }
      #${LOADER_ID}.xirom-loader--exiting::before {
        transform: translate3d(-102%,0,0);
        opacity: 0;
      }
      #${LOADER_ID}.xirom-loader--exiting::after {
        transform: translate3d(102%,0,0);
        opacity: 0;
      }

      @media (max-width: 800px) {
        #${ATMOS_ID}::before {
          /* En móvil el libro ocupa casi todo el ancho: iluminamos
             arriba y abajo, sin colocar color sobre sus páginas. */
          background:
            radial-gradient(ellipse 120% 48% at 50% 0%, rgba(55,109,164,.43), transparent 78%),
            radial-gradient(ellipse 125% 50% at 50% 100%, rgba(108,83,143,.34), transparent 79%),
            radial-gradient(ellipse 78% 33% at 0% 100%, rgba(71,122,104,.24), transparent 80%);
          -webkit-mask-image: linear-gradient(to bottom,#000 0%,#000 12%,transparent 27%,transparent 73%,#000 89%,#000 100%);
          mask-image: linear-gradient(to bottom,#000 0%,#000 12%,transparent 27%,transparent 73%,#000 89%,#000 100%);
        }
        #${ATMOS_ID} .xirom-atmosphere__side,
        #${ATMOS_ID} .xirom-atmosphere__caption { display: none; }
        #${ATMOS_ID}::after { inset: 8px; opacity: .55; }
      }
      @media (prefers-reduced-motion: reduce) {
        #${LOADER_ID}::before,
        #${LOADER_ID}::after,
        #${LOADER_ID} .xirom-loader__layout,
        #${ATMOS_ID} { transition-duration: 0.01ms !important; animation: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function addAtmosphere() {
    if (document.getElementById(ATMOS_ID)) return;
    var atm = document.createElement('div');
    atm.id = ATMOS_ID;
    atm.setAttribute('aria-hidden', 'true');
    atm.innerHTML =
      '<div class="xirom-atmosphere__side xirom-atmosphere__side--left"></div>' +
      '<div class="xirom-atmosphere__side xirom-atmosphere__side--right"></div>' +
      '<span class="xirom-atmosphere__caption">XIROM / CATÁLOGO</span>' +
      '<span class="xirom-atmosphere__caption xirom-atmosphere__caption--right">LA FORMA DE LO INVISIBLE</span>';
    document.body.appendChild(atm);
    window.requestAnimationFrame(function () { atm.classList.add('xirom-atmosphere--visible'); });
  }

  function removeLoader() {
    if (closed) return;
    closed = true;
    window.clearTimeout(waitTimer);
    window.clearTimeout(closeTimer);
    var book = document.getElementById('flipbook-container');
    if (book) book.removeAttribute('aria-busy');
    if (!loader) return;
    loader.classList.add('xirom-loader--exiting');
    loader.setAttribute('aria-hidden', 'true');
    var current = loader;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(function () {
      if (current.parentNode) current.parentNode.removeChild(current);
      if (loader === current) loader = null;
    }, reduced ? 35 : EXIT_TIME);
  }

  function finish() {
    if (closed) return;
    var remaining = MIN_SHOW - (Date.now() - started);
    if (remaining > 0) {
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(removeLoader, remaining);
    } else {
      removeLoader();
    }
  }

  function mount() {
    if (closed || loader || !document.body) return;
    installStyles();
    addAtmosphere();
    started = Date.now();
    loader = document.createElement('section');
    loader.id = LOADER_ID;
    loader.className = 'xirom-loader';
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-label', 'Preparando el catálogo XIROM');
    loader.innerHTML = [
      '<div class="xirom-loader__layout">',
      ' <p class="xirom-loader__eyebrow">XIROM / CATÁLOGO</p>',
      ' <div class="xirom-loader__symbol" aria-hidden="true">',
      '  <div class="xirom-loader__outline"></div>',
      '  <div class="xirom-loader__orbit"></div>',
      '  <div class="xirom-loader__orbit xirom-loader__orbit--inner"></div>',
      '  <img class="xirom-loader__logo" src="logo.png" alt="">',
      ' </div>',
      ' <h2 class="xirom-loader__brand">XIROM</h2>',
      ' <p class="xirom-loader__motto">La forma de lo invisible.</p>',
      ' <div class="xirom-loader__bar" aria-hidden="true"></div>',
      ' <p class="xirom-loader__status">PREPARANDO EL CATÁLOGO</p>',
      '</div>'
    ].join('');
    document.body.appendChild(loader);
    var book = document.getElementById('flipbook-container');
    if (book) book.setAttribute('aria-busy', 'true');
    waitTimer = window.setTimeout(removeLoader, MAX_SHOW);
  }

  window.XIROMCatalogLoader = {
    version: '4.0',
    finish: finish,
    fail: function () { finish(); }
  };

  // Compatibilidad con las versiones de dFlip que ofrecen DFLIP.defaults.
  try {
    if (window.DFLIP && window.DFLIP.defaults) {
      var previousReady = window.DFLIP.defaults.onReady;
      window.DFLIP.defaults.onReady = function () {
        try {
          if (typeof previousReady === 'function') previousReady.apply(this, arguments);
        } finally { finish(); }
      };
    }
  } catch (e) { /* El visor debe seguir funcionando aunque no exista este hook. */ }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount, { once: true });
})();
