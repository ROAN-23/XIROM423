(function () {
  if (window.XIROMCatalogLoader) return;

  let overlay = null;
  let finished = false;
  let failSafeTimer = null;

  const FADE_DURATION = 800;
  const MAX_WAIT = 4000;
  const LOGO_URL = 'https://roan-23.github.io/XIROM423/logo.png';

  function injectStyles() {
    if (document.getElementById('xirom-loader-dynamic-styles')) return;

    const style = document.createElement('style');
    style.id = 'xirom-loader-dynamic-styles';
    style.textContent = `
      :root{
        --xrm-bg-1:#0b0f16;
        --xrm-bg-2:#050608;
        --xrm-line:rgba(255,255,255,.03);
        --xrm-white:#f6f4ef;
      }

      html, body {
        min-height: 100%;
      }

      body{
        background:
          linear-gradient(var(--xrm-line) 1px, transparent 1px),
          linear-gradient(90deg, var(--xrm-line) 1px, transparent 1px),
          radial-gradient(1100px 680px at 50% 0%, rgba(63,108,184,.16), transparent 60%),
          radial-gradient(900px 560px at 14% 82%, rgba(63,144,121,.11), transparent 58%),
          radial-gradient(900px 560px at 86% 78%, rgba(121,78,184,.11), transparent 58%),
          linear-gradient(180deg, var(--xrm-bg-1) 0%, var(--xrm-bg-2) 100%) !important;
        background-size: 56px 56px, 56px 56px, auto, auto, auto, auto !important;
        background-attachment: fixed !important;
      }

      #flipbook,
      .df-ui,
      .df-container,
      .df-app,
      .df-book-wrapper,
      .df-wrapper{
        background: transparent !important;
      }

      .xirom-loader-overlay{
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: grid;
        place-items: center;
        padding: 24px;
        background:
          radial-gradient(1000px 650px at 50% 10%, rgba(69,110,181,.15), transparent 60%),
          radial-gradient(850px 500px at 16% 82%, rgba(64,141,122,.10), transparent 58%),
          radial-gradient(850px 500px at 84% 78%, rgba(122,77,181,.10), transparent 58%),
          linear-gradient(180deg, rgba(8,11,16,.98) 0%, rgba(5,6,8,.985) 100%);
        opacity: 1;
        visibility: visible;
        transition: opacity .8s ease, visibility .8s ease, transform .8s ease;
      }

      .xirom-loader-overlay.is-hiding{
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: scale(1.01);
      }

      .xirom-loader-card{
        width: min(100%, 480px);
        text-align: center;
        color: var(--xrm-white);
      }

      .xirom-loader-top{
        font-size: 12px;
        letter-spacing: .38em;
        text-transform: uppercase;
        opacity: .72;
        margin-bottom: 24px;
      }

      .xirom-loader-symbol{
        position: relative;
        width: clamp(150px, 36vw, 260px);
        height: clamp(150px, 36vw, 260px);
        margin: 0 auto 28px;
        display: grid;
        place-items: center;
        animation: xiromFloat 5s ease-in-out infinite;
      }

      .xirom-loader-symbol::before,
      .xirom-loader-symbol::after{
        content:"";
        position:absolute;
        inset: 12%;
        border: 1px solid rgba(255,255,255,.08);
        transform: rotate(45deg);
      }

      .xirom-loader-symbol::after{
        inset: -4%;
        border-color: rgba(103,132,195,.16);
      }

      .xirom-loader-symbol img{
        width: 100%;
        height: auto;
        object-fit: contain;
        filter: drop-shadow(0 0 24px rgba(255,255,255,.09));
      }

      .xirom-loader-title{
        margin: 0 0 12px;
        font-size: clamp(48px, 11vw, 76px);
        font-weight: 800;
        letter-spacing: .26em;
        text-indent: .26em;
      }

      .xirom-loader-subtitle{
        margin: 0 0 24px;
        font-size: clamp(18px, 4.2vw, 24px);
        color: rgba(246,244,239,.95);
      }

      .xirom-loader-bar{
        width: min(280px, 78vw);
        height: 1px;
        margin: 0 auto;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.6) 50%, transparent 100%);
        position: relative;
        overflow: hidden;
      }

      .xirom-loader-bar::after{
        content:"";
        position:absolute;
        top:0;
        left:-35%;
        width:35%;
        height:100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,.95), transparent);
        animation: xiromSweep 1.8s ease-in-out infinite;
      }

      @keyframes xiromSweep{
        0%{ left:-35%; }
        100%{ left:100%; }
      }

      @keyframes xiromFloat{
        0%,100%{ transform: translateY(0); }
        50%{ transform: translateY(-8px); }
      }

      @media (prefers-reduced-motion: reduce){
        .xirom-loader-overlay,
        .xirom-loader-symbol,
        .xirom-loader-bar::after{
          animation: none !important;
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'xirom-loader-overlay';
    overlay.innerHTML = `
      <div class="xirom-loader-card">
        <div class="xirom-loader-top">XIROM / CATÁLOGO</div>
        <div class="xirom-loader-symbol">
          <img src="${LOGO_URL}" alt="XIROM">
        </div>
        <h1 class="xirom-loader-title">XIROM</h1>
        <p class="xirom-loader-subtitle">La forma de lo invisible.</p>
        <div class="xirom-loader-bar" aria-hidden="true"></div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function finish() {
    if (finished || !overlay) return;

    finished = true;
    clearTimeout(failSafeTimer);

    overlay.classList.add('is-hiding');

    setTimeout(() => {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      overlay = null;
    }, FADE_DURATION + 40);
  }

  function init() {
    injectStyles();
    createOverlay();

    failSafeTimer = setTimeout(finish, MAX_WAIT);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.XIROMCatalogLoader = {
    finish
  };
})();
