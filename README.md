# La Chica de Ayer — Almerimar

**Maqueta de diseño** de una web para un pub y bar de copas frente al puerto de Almerimar (El Ejido, Almería).

Sitio estático de una sola página: sin build, sin dependencias que instalar. Se abre `index.html` y funciona.

> ### ⚠️ No es una web operativa
>
> Es una pieza de diseño. **No hay canales de contacto reales** y el contenido es de muestra:
>
> | | |
> |---|---|
> | Teléfono y WhatsApp | **eliminados** — no hay `tel:` ni `wa.me` en ninguna parte |
> | Redes sociales | **eliminadas** — footer y `sameAs` del JSON-LD |
> | Logo e iconos | marca genérica de relleno (`images/mark.webp`), no la del local |
> | Carta y precios | 42 productos **inventados** |
> | Agenda semanal | nombres de muestra |
> | Fotografía | Unsplash, de relleno |
> | Dirección y horario | **se mantienen**, son los únicos datos reales |
>
> La página lleva `noindex, nofollow` y `robots.txt` con `Disallow: /`, para que no se indexe como si fuera el negocio real: tiene una dirección auténtica junto a precios inventados, y eso podría confundir a quien busque el local.
>
> **Para pasarla a producción:** poner los datos reales, cambiar la etiqueta `robots` de `index.html` a `index, follow, max-image-preview:large, max-snippet:-1`, `robots.txt` a `Allow: /` con la línea `Sitemap:`, y actualizar el dominio en `canonical`, Open Graph, JSON-LD y `sitemap.xml`.

---

## Stack

| Pieza | Uso |
|---|---|
| HTML5 + CSS3 | Estructura y sistema de diseño (variables CSS, grid, `clamp()`) |
| JavaScript (vanilla, IIFE) | Interacción, menú, scroll-spy |
| [GSAP + ScrollTrigger](https://gsap.com/) | Animaciones de entrada y parallax (vía CDN) |
| [Lenis](https://github.com/darkroomengineering/lenis) | Scroll suave (vía CDN) |

Las librerías se cargan con `defer` desde CDN y son **opcionales**: si el CDN falla o el usuario las bloquea, la web sigue siendo completamente navegable y todo el contenido permanece visible.

---

## Estructura

```
.
├── index.html         # Página principal
├── 404.html           # Página de error con la misma identidad
├── styles.css         # Sistema de diseño completo
├── app.js             # Interacción y animaciones
├── images/            # WebP propios: 9 fotos (2-3 anchos) + marca e iconos
├── robots.txt
├── sitemap.xml
├── site.webmanifest   # Instalable como PWA básica
└── vercel.json        # Cabeceras de seguridad y caché
```

---

## Desarrollo local

No hace falta build. Cualquier servidor estático vale:

```bash
npx serve .
# o
python -m http.server 8000
```

Abrir `http://localhost:3000` (o el puerto que indique).

> Abrir el fichero con `file://` también funciona, pero el `site.webmanifest` y las rutas absolutas de `404.html` se comportan mejor servidos por HTTP.

---

## Despliegue

Conectado a **Vercel** desde este repositorio de GitHub: cada `push` a `main` publica en producción automáticamente.

Despliegue manual:

```bash
npx vercel --prod
```

`vercel.json` aplica:

- **CSP** restrictiva con la lista blanca justa (CDN de scripts, Google Fonts, mapa de Google). Las imágenes son propias, así que `img-src` es solo `'self' data:`.
- `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `HSTS`.
- Caché inmutable para `/images/*` (los nombres de fichero no cambian de contenido).

### Caché de CSS y JS: no subir el `max-age`

`styles.css` y `app.js` se sirven con `max-age=0, must-revalidate`. **Es deliberado y no hay que "optimizarlo".**

Como no hay build, los ficheros no llevan hash en el nombre. Si se les pone un `max-age` largo, el navegador se queda con el CSS viejo mientras Vercel le entrega el HTML nuevo (el HTML sí va con `max-age=0`), y la página se ve rota hasta que caduque. Pasó exactamente eso con un `max-age=3600`: durante una hora, cualquiera que hubiese entrado antes veía el HTML nuevo con el CSS anterior.

Con `max-age=0, must-revalidate` el navegador pregunta siempre y el edge responde `304` si no ha cambiado: son unos pocos bytes por carga y la corrección está garantizada.

Los enlaces llevan además `?v=2`. Ese número solo hace falta subirlo si alguna vez se vuelve a cachear de forma agresiva; con las cabeceras actuales no es necesario tocarlo.

---

## Imágenes

Todas las fotos se sirven **desde el propio dominio** en WebP, con dos o tres anchos por imagen (`srcset`). No se carga nada desde terceros.

El grade —oscurecido, desaturado y virado a cálido para que todo el sitio tenga la misma piel— viene **horneado en el fichero**, no aplicado con `filter:` en CSS. Es deliberado: un `filter` sobre una imagen grande que además hace parallax se recalcula en cada fotograma y era lo que hundía los FPS.

Medido en Chrome antes y después de ese cambio (scroll completo de la página):

| | antes | después |
|---|---|---|
| FPS medio | 31 | **60** |
| fotogramas > 32 ms | 50 de 77 | **0 de 147** |
| peso total | 2 660 KB | **1 234 KB** |
| solo imágenes | 1 843 KB | **418 KB** |
| loader delante | 2 363 ms | **1 165 ms** |

Si hay que regenerar las imágenes o cambiar el grade, el pipeline usa [sharp](https://sharp.pixelplumbing.com/): redimensiona, aplica `modulate` + capa cálida + capa de oscurecido y exporta WebP.

> Las fotos actuales son de [Unsplash](https://unsplash.com/license) y están **de relleno**: sirven para enseñar la dirección de arte, no para publicar. Hay que sustituirlas por fotografía real del local.

---

## Accesibilidad y rendimiento

- Enlace *saltar al contenido*, `main` y jerarquía de encabezados correcta.
- Menú móvil con `aria-expanded`, cierre con `Escape`, foco atrapado y devuelto al botón.
- Foco visible (`:focus-visible`) en todos los elementos interactivos.
- `prefers-reduced-motion`: se desactivan animaciones, parallax y scroll suave.
- Imágenes con `width`/`height`, `loading="lazy"` y `decoding="async"`; la del hero con `preload`, `srcset` y `fetchpriority="high"`.
- Estilos de impresión.

---

## SEO

Todo el trabajo está hecho y listo, pero **desactivado a propósito** mientras esto sea una maqueta (ver el aviso del principio):

- Metadatos completos, Open Graph y Twitter Card.
- Datos estructurados JSON-LD: `BarOrPub` + `Menu` + `WebSite` + `FAQPage`.
- Etiquetas geográficas, `canonical`, `robots.txt` y `sitemap.xml`.

---

## Si algún día se pone en producción

- [ ] **Teléfono y WhatsApp** — no existen en el código; hay que volver a crearlos: bloque `Reservas` en `#contacto`, botón del cierre, `telephone` del JSON-LD y las dos respuestas del FAQ que antes remitían a WhatsApp.
- [ ] **Redes sociales** — igual: enlaces del footer y `sameAs` del JSON-LD.
- [ ] **Logo** — sustituir `images/mark.webp`, `mark-180.webp` y `favicon.png` por la marca real. Usar **nombres de fichero nuevos**: `/images/*` se sirve con caché inmutable de un año, así que sobrescribir un fichero deja a la gente viendo el anterior.
- [ ] **Carta y precios** — los 42 productos son inventados. Cambiarlos **en dos sitios**: el HTML de `#carta` y el bloque `Menu` del JSON-LD.
- [ ] **Alérgenos** — la web dice que la información está en barra; es obligatorio tenerla (Reglamento UE 1169/2011).
- [ ] **Fotografías** — las nueve imágenes de `/images` son de Unsplash. Mismo pipeline: WebP, dos anchos, grade horneado.
- [ ] **Agenda** — los nombres de las noches son de muestra.
- [ ] **Indexación** — quitar `noindex` de `index.html` y abrir `robots.txt`.
- [ ] **Dominio** — actualizar `canonical`, Open Graph, JSON-LD y `sitemap.xml`.
- [ ] **Aviso legal, privacidad y cookies** — obligatorios en España (LSSI/RGPD) en cuanto se añada analítica.
- [ ] **Aviso de maqueta** — quitar la línea del pie.
