# XIROM | Portal — v0.2 / más vida sin perder identidad

## Lo nuevo

- Fondo con profundidad azul mineral y violeta ceniza, sin abandonar Obsidiana + Concreto nocturno.
- Acceso a catálogo en una placa clara grande, con detalle técnico y flecha viva.
- Acceso a cotizaciones en una placa jade/azul/violeta con icono y efecto de luz.
- Tarjetas para Instagram, Facebook, TikTok y correo con símbolos SVG, color y reacción al tacto.
- Destellos de luz muy lentos y entrada escalonada. Sin efectos agresivos o pesados.
- La animación original «Desde las sombras» sigue intacta en concepto, pero mejorada.
- Se respeta «reducir movimiento» del dispositivo y se puede omitir la intro.
- El correo correcto **xirom432@gmail.com** se contrastó con el enlace que ya aparece en tu catálogo.

## Importante: ya agregaste Facebook a tu copia de v0.1

**NO sustituyas tu config.js original por el que viene en este paquete**, o perderás la URL de Facebook que escribiste.

Si ya tienes una carpeta `portal` que funciona, utiliza el paquete **XIROM_Portal_v02_ACTUALIZACION_SEGURA.zip** (el otro ZIP sirve para empezar de cero). En la actualización segura vienen solo los 3 archivos de diseño/comportamiento:

```
portal/
  index.html
  estilos.css
  app.js
```

### Paso a paso para actualizar SIN borrar Facebook (Windows)

1. Crea una copia de seguridad de toda tu carpeta `portal`: botón derecho > Copiar > Pegar. Ponle `portal_respaldo_v01`.
2. Descarga el ZIP de **Actualización segura** y extrae su contenido.
3. Dentro de la carpeta extraída, entra a `portal` y selecciona `index.html`, `estilos.css` y `app.js`.
4. Copia esos **tres archivos** en la carpeta `portal` de tu proyecto original y acepta reemplazar **solo esos tres**.
5. **NO toques `config.js`**: tus enlaces existentes, incluido Facebook, siguen ahí.
6. Con Bloc de notas o Visual Studio Code, abre tu `config.js` y busca la línea `correo`.
7. Escribe la dirección con arroba (como en el catálogo):

```javascript
correo: 'xirom432@gmail.com'
```

8. Guarda con Ctrl+S.
9. Abre `portal/index.html` en tu navegador y actualiza con Ctrl+Shift+R para evitar ver el diseño guardado en caché.
10. Revisa el botón de Facebook, correo, catálogo y WhatsApp. Haz una prueba con cada uno.

> Si `config.js` no muestra Facebook, abre tu respaldo v0.1 y recupera la línea `facebook: 'https://...'` con la URL que ya habías agregado. No uses una URL inventada o de ejemplo.

## Entender qué hace cada archivo (tu primera clase)

| Archivo | Qué controla | Cuándo tocarlo |
| --- | --- | --- |
| `index.html` | Esqueleto de la página: logo, títulos, botones y orden | Cuando cambies elementos, frases o secciones |
| `estilos.css` | Colores, tamaños, espacios, formas, interacciones y animaciones | Cuando quieras ajustar la apariencia |
| `config.js` | URL del catálogo, WhatsApp, Instagram, Facebook, correo y logo | Cuando quieras cambiar un dato o un destino |
| `app.js` | Construye las tarjetas de redes, controla la intro y la función Compartir | Cuando quieras añadir un comportamiento nuevo |

### Ejercicio 1 — Modificar una tarjeta sin cambiar la marca

1. Abre `estilos.css`.
2. Usa Ctrl+F para buscar `.action-card {`.
3. Dentro verás `border-radius: 13px`. Esa propiedad controla cuánto se redondean las esquinas.
4. Cámbiala a `border-radius: 5px` y guarda.
5. Actualiza la página: los botones se sentirán más industriales y angulares.
6. Devuelve el valor a `13px` si prefieres la propuesta original.

**¿Qué aprendiste?** Cambiar CSS modifica la apariencia, pero **no** el enlace ni el texto del botón.

### Ejercicio 2 — Comprender las transiciones

Busca en `estilos.css`:

```css
.action-card:hover, .action-card:focus-visible { transform: translateY(-4px); }
.action-card:active { transform: translateY(0) scale(.986); }
```

- `:hover`: responde cuando pasas el cursor encima (computadora).
- `:focus-visible`: responde al navegar con el teclado (accesibilidad).
- `:active`: responde cuando presionas o tocas el botón (celular).
- `transform`: mueve o escala el elemento sin cambiar la estructura de la página.

### Ejercicio 3 — Aprender a configurar redes

Abre `config.js`. Busca:

```javascript
enlaces: {
  instagram: 'https://www.instagram.com/xirom423',
  facebook: 'AQUI_TU_ENLACE',
  tiktok: '',
  correo: 'xirom432@gmail.com'
}
```

El fragmento es **ilustrativo**, no debes reemplazar todo tu bloque: ya contiene más propiedades. Solo edita los valores de las claves que necesites.

- Una URL completa entre comillas muestra el botón.
- Una cadena vacía `''` lo oculta.
- Cada propiedad, salvo la última, termina con coma `,`.
- Para correo solo escribe la dirección, sin `mailto:`; la aplicación lo agrega.

## Probar la entrada «Desde las sombras» todas las veces

La intro se reproduce una vez por sesión para no cansar a los clientes.

- Abre normalmente `portal/index.html` para usar el portal.
- Para repetir la intro, añade `?intro=1` al final de la URL y presiona Enter.
- Puedes pulsar «Omitir animación» o la tecla Esc.
- En equipos configurados para reducir movimiento, la intro se omite automáticamente.

Mientras pruebes localmente, el logo oficial se busca en el catálogo online. Si no hay acceso a Internet, aparecerá temporalmente el texto «XIROM» como respaldo, **sin inventar un símbolo alternativo**.

## Publicación sin afectar tu catálogo

El catálogo ya vive en el repositorio `ROAN-23/XIROM423`. El portal debe estar dentro de una subcarpeta:

```
XIROM423/                   <- repositorio
  index.html                <- CATÁLOGO: NO REEMPLAZAR
  logo.png                  <- LOGO EXISTENTE
  catlogo_xirom.pdf         <- PDF EXISTENTE
  portal/                   <- NUESTRO PORTAL NUEVO
    index.html
    estilos.css
    config.js
    app.js
```

1. Revisa la versión local y confirma cada enlace.
2. Sube los archivos de `portal/` al repositorio, preservando la carpeta. Si ya existe, reemplaza solamente los tres archivos actualizados y `config.js` solo cuando quieras actualizar enlaces.
3. **No reemplaces `index.html` en la raíz del repositorio**, ya que es el catálogo.
4. Cuando GitHub Pages publique los cambios, prueba desde el celular: `https://roan-23.github.io/XIROM423/portal/`.
5. Comprueba correo, redes, WhatsApp y catálogo. Si todo funciona, pon `compartirHabilitado: true` en `config.js`.
6. **Solo entonces** genera el QR definitivo apuntando a `/portal/`.

## Verificación antes de imprimir el QR

- [ ] La dirección del correo lleva `@` y abre tu aplicación de correo.
- [ ] Facebook conserva la URL real que añadiste.
- [ ] Las dos tarjetas grandes abren los destinos correctos.
- [ ] En celular las tarjetas se pueden tocar sin dificultad.
- [ ] La intro se puede omitir y el logo no se deforma.
- [ ] El QR apunta a la página **publicada**, no a un archivo local.

---

**XIROM | Portal** — Una sola dirección. Una identidad propia.
