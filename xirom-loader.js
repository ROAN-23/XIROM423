/*
  XIROM | Catalogo — Pantalla de espera
  NO calcula porcentajes ni descarga el PDF por segunda vez.
  Espera el callback onReady del visor dFlip.
  No expone un enlace directo al archivo PDF.
*/
(function () {
  'use strict';

  var ID = 'xirom-catalog-loader';
  var TEMPO_AVISO_MS = 12000; // Solo muestra una alternativa, NO es tiempo de cierre.
  var loader = null;
  var done = false;
  var alertTimer = null;

  function mount() {
    if (loader) return loader;
    if (!document.body) return null;

    loader = document.createElement('section');
    loader.id = ID;
    loader.className = 'xirom-loader';
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-live', 'polite');
    loader.setAttribute('aria-label', 'Preparando el catálogo XIROM');

    // Usamos el mismo logo.png que ya utiliza la pagina, sin redibujarlo.
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
      '  <button class="xirom-loader__retry" type="button">Reintentar carga</button>',
      '</div>'
    ].join('');
    document.body.appendChild(loader);

    var retry = loader.querySelector('.xirom-loader__retry');
    retry.addEventListener('click', function () { window.location.reload(); });

    var flipbook = document.getElementById('flipbook-container');
    if (flipbook) flipbook.setAttribute('aria-busy', 'true');

    alertTimer = window.setTimeout(function () {
      if (done || !loader) return;
      loader.classList.add('xirom-loader--slow');
      setStatus('La carga está tardando más de lo habitual');
    }, TEMPO_AVISO_MS);
    return loader;
  }

  function setStatus(message) {
    if (!loader) return;
    var status = loader.querySelector('.xirom-loader__status');
    if (status) status.textContent = message;
  }

  function finish() {
    if (done) return;
    done = true;
    window.clearTimeout(alertTimer);
    var flipbook = document.getElementById('flipbook-container');
    if (flipbook) flipbook.setAttribute('aria-busy', 'false');
    if (!loader) return;

    // Dos frames para permitir que el navegador pinte el libro ya preparado.
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        if (!loader) return;
        loader.classList.add('xirom-loader--done');
        window.setTimeout(function () {
          if (loader) { loader.remove(); loader = null; }
        }, 760);
      });
    });
  }

  function fail() {
    window.clearTimeout(alertTimer);
    if (!loader) mount();
    if (!loader) return;
    loader.classList.add('xirom-loader--slow');
    setStatus('No se pudo iniciar el visor. Pulsa Reintentar carga.');
  }

  window.XIROMCatalogLoader = {
    finish: finish,
    fail: fail
  };

  // Se carga DESPUES del div #flipbook-container y ANTES del script que inicia dFlip.
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount, { once: true });
})();
