# La Chica de Ayer — Almerimar

Propuesta de web para **La Chica de Ayer**, pub y bar de copas frente al puerto de Almerimar (El Ejido, Almería).

Sitio estático de una sola página: sin build, sin dependencias que instalar. Se abre `index.html` y funciona.

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
├── images/
│   └── logo.webp
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

- **CSP** restrictiva con la lista blanca justa (CDN de scripts, Google Fonts, Unsplash, mapa de Google).
- `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `HSTS`.
- Caché inmutable para `/images/*` y revalidación horaria para CSS/JS.

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

- Metadatos completos, Open Graph y Twitter Card.
- Datos estructurados JSON-LD: `BarOrPub` + `WebSite` + `FAQPage`.
- Etiquetas geográficas, `canonical`, `robots.txt` y `sitemap.xml`.

---

## Pendiente de datos reales

Antes de publicar en el dominio definitivo hay que sustituir los marcadores:

- [ ] **Teléfono y WhatsApp** — ahora `+34 000 000 000` en `index.html` (enlaces `wa.me`, `tel:` y el JSON-LD).
- [ ] **Redes sociales** — enlaces a Instagram y Facebook (footer y `sameAs` del JSON-LD).
- [ ] **Fotografías** — las imágenes son de Unsplash a modo de referencia visual; conviene reemplazarlas por fotos del local en formato WebP servidas desde `/images`.
- [ ] **Coordenadas y dirección** — verificar el punto exacto del mapa.
- [ ] **Carta y precios** — ⚠️ **los 42 productos y todos los precios son inventados**, escritos como muestra editorial con precios plausibles de la zona. Hay que sustituirlos por la carta real **en dos sitios**: el HTML de la sección `#carta` y el bloque `Menu` del JSON-LD (si los precios del schema no coinciden con los reales, Google lo penaliza).
- [ ] **Alérgenos** — la web dice que la información está disponible en barra; es obligatorio tenerla (Reglamento UE 1169/2011).
- [ ] **Agenda** — los nombres de las noches de la semana son de muestra.
- [ ] **Dominio** — si cambia, actualizar `canonical`, Open Graph, `sitemap.xml` y `robots.txt`.
- [ ] **Aviso legal, privacidad y cookies** — obligatorios en España (LSSI/RGPD) una vez se añada cualquier analítica.
