/*
 * XIROM | Catalogo — Animacion de carga SEGURA v3.0
 * Se integra con el CSS existente. No toca el PDF ni el visor dFlip.
 * - Respeta el logotipo y el eslogan oficiales.
 * - Nunca ofrece un enlace de descarga ni de apertura directa al PDF.
 * - Si el visor avisa onReady, desaparece al estar listo.
 * - Si el visor NO avisa, desaparece de todos modos en 4 segundos.
 *   De esta forma no puede ocultar indefinidamente el catalogo.
 */
(function () {
  'use strict';

  var ID = 'xirom-catalog-loader';
  var TIEMPO_MAXIMO_MS = 4000;  // Limite de SEGURIDAD de la pantalla, no del PDF.
  var TIEMPO_MINIMO_MS = 650;   // Aparicion breve sin retrasar mucho el catalogo.
  var DURACION_SALIDA_MS = 680;
  var startedAt = Date.now();
  var loader = null;
  var finished = false;
  var safeExitTimer = null;
  var pendingExitTimer = null;

  function closeLoader() {
    if (finished) return;
    finished = true;
    window.clearTimeout(safeExitTimer);
    window.clearTimeout(pendingExitTimer);

    var viewer = document.getElementById('flipbook-container');
    if (viewer) viewer.removeAttribute('aria-busy');
    if (!loader) return;

    // La clase ya esta definida en xirom-loader.css: fundido + sin bloquear clics.
    loader.classList.add('xirom-loader--done');
    loader.setAttribute('aria-hidden', 'true');
    var toRemove = loader;
    window.setTimeout(function () {
      if (toRemove.parentNode) toRemove.parentNode.removeChild(toRemove);
      if (loader === toRemove) loader = null;
    }, DURACION_SALIDA_MS);
  }

  function finish() {
    if (finished) return;
    var remaining = TIEMPO_MINIMO_MS - (Date.now() - startedAt);
    if (remaining > 0) {
      window.clearTimeout(pendingExitTimer);
      pendingExitTimer = window.setTimeout(closeLoader, remaining);
    } else {
      closeLoader();
    }
  }

  function mount() {
    if (finished || loader || !document.body) return;
    startedAt = Date.now();
    loader = document.createElement('section');
    loader.id = ID;
    loader.className = 'xirom-loader';
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-live', 'polite');
    loader.setAttribute('aria-label', 'Preparando el catalogo XIROM');

    // Mantiene las clases del archivo xirom-loader.css que ya esta publicado.
    // No hay enlaces al PDF, botones para descargar ni «Reintentar carga».
    loader.innerHTML = [
      '<div class="xirom-loader__layout">',
      '  <p class="xirom-loader__eyebrow">XIROM / CATÁLOGO</p>',
      '  <div class="xirom-loader__symbol" aria-hidden="true">',
      '    <div class="xirom-loader__outline"></div>',
      '    <div class="xirom-loader__orbit"></div>',
      '    <div class="xirom-loader__orbit xirom-loader__orbit--inner"></div>',
      '    <img class="xirom-loader__logo" src="logo.png" alt="">',
      '  </div>',
      '  <h2 class="xirom-loader__brand">XIROM</h2>',
      '  <p class="xirom-loader__motto">La forma de lo invisible.</p>',
      '  <div class="xirom-loader__bar" aria-hidden="true"></div>',
      '  <p class="xirom-loader__status">PREPARANDO EL CATÁLOGO</p>',
      '</div>'
    ].join('');
    document.body.appendChild(loader);
    var viewer = document.getElementById('flipbook-container');
    if (viewer) viewer.setAttribute('aria-busy', 'true');

    // Pase lo que pase, retiramos la capa como maximo a los 4 segundos.
    // Si el PDF sigue descargandose, se vera el visor de dFlip cargando,
    // pero ya no tendremos la pantalla personalizada bloqueandolo.
    safeExitTimer = window.setTimeout(closeLoader, TIEMPO_MAXIMO_MS);
  }

  // API compatible con la integracion original y con el index.html v2.
  window.XIROMCatalogLoader = {
    finish: finish,
    fail: function () { finish(); }
  };

  // Versiones de DearFlip que exponen defaults permiten recibir onReady
  // incluso si index.html no lo define. Si no existe, el temporizador protege.
  try {
    if (window.DFLIP && window.DFLIP.defaults) {
      var oldOnReady = window.DFLIP.defaults.onReady;
      window.DFLIP.defaults.onReady = function () {
        try {
          if (typeof oldOnReady === 'function') {
            oldOnReady.apply(this, arguments);
          }
        } finally {
          finish();
        }
      };
    }
  } catch (err) {
    // El visor no depende de este hook: dejamos que siga trabajando.
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  }
})();
