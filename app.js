/* ============================================================
   LA CHICA DE AYER — interacción
   Todo el motor de animación es opcional: si GSAP o Lenis no
   cargan (CDN caído, red lenta, bloqueador), la web sigue
   siendo 100% navegable y el contenido permanece visible.
   ============================================================ */
(() => {
  'use strict';

  /* ===== util ===== */
  const mqNoHover    = window.matchMedia('(hover:none)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const hasGSAP      = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const animate      = hasGSAP && !reduceMotion;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const loader = $('#loader');
  const nav    = $('.nav');
  const links  = $('.nav-links');
  const burger = $('#burger');
  const toTop  = $('#toTop');

  /* ===== año dinámico en el footer ===== */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ===== loader (con red de seguridad) ===== */
  const hideLoader = () => {
    if (!loader || loader.classList.contains('done')) return;
    loader.classList.add('done');
  };
  // si algo va mal, el loader nunca bloquea la web más de 2 s
  const loaderFailsafe = setTimeout(hideLoader, 2000);

  // La página pinta a los ~400ms; tener el loader casi 2,5s delante era
  // regalar dos segundos de espera. Ahora saluda y se quita de en medio.
  const runLoader = () => {
    if (!loader) { playHero(); return; }
    if (!animate) { hideLoader(); playHero(); return; }
    const bar  = $('.bar span', loader);
    const mark = $('.mark', loader);
    gsap.timeline()
      .to(mark, { opacity: 1, duration: .28, ease: 'power2.out' })
      .to(bar,  { width: '100%', duration: .45, ease: 'power2.inOut' }, 0)
      .to(loader, {
        opacity: 0, duration: .35, ease: 'power2.inOut',
        onComplete: () => { clearTimeout(loaderFailsafe); hideLoader(); }
      })
      .add(playHero, '-=.25');
  };

  /* ===== Lenis smooth scroll (opcional) ===== */
  let lenis = null;
  if (animate && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ===== anclas suaves ===== */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(el, { offset: 0 });
      else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      // el foco acompaña al scroll: navegación por teclado coherente
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
      history.replaceState(null, '', id);
    });
  });

  /* ===== hero intro ===== */
  function playHero() {
    if (!animate) return;
    gsap.timeline()
      .from('[data-hero] .reveal>*', { yPercent: 115, duration: 1.2, stagger: .12, ease: 'power4.out' })
      .from('.hero [data-fade]',     { y: 30, opacity: 0, duration: .9, stagger: .12, ease: 'power3.out' }, '-=.7');
  }

  /* ===== nav: shrink + menú móvil accesible ===== */
  const setShrink = scrolled => {
    if (nav)   nav.classList.toggle('shrink', scrolled);
    if (links) links.classList.toggle('shrink', scrolled);
    if (toTop) toTop.classList.toggle('show', scrolled);
  };

  let lastFocused = null;

  function closeMenu() {
    if (!links || !links.classList.contains('open')) return;
    burger.classList.remove('x');
    links.classList.remove('open');
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú');
    if (lenis) lenis.start();
    if (lastFocused) { lastFocused.focus(); lastFocused = null; }
  }

  function openMenu() {
    lastFocused = document.activeElement;
    burger.classList.add('x');
    links.classList.add('open');
    document.body.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Cerrar menú');
    if (lenis) lenis.stop();
    const first = links.querySelector('a');
    if (first) first.focus();
  }

  if (burger && links) {
    burger.addEventListener('click', () => {
      links.classList.contains('open') ? closeMenu() : openMenu();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
      // atrapa el foco dentro del menú abierto
      if (e.key === 'Tab' && links.classList.contains('open')) {
        const items = [burger, ...$$('a', links)];
        const i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });

    // al pasar a escritorio, el overlay no debe quedarse abierto
    window.matchMedia('(min-width:981px)').addEventListener('change', closeMenu);
  }

  /* ===== scroll-spy: sección activa en el menú ===== */
  const spy = () => {
    const sections = $$('main section[id]');
    if (!sections.length || !('IntersectionObserver' in window)) return;
    const navFor = id => $(`.nav-links a[href="#${id}"]:not(.nav-cta)`);
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const a = navFor(en.target.id);
        if (!a) return;
        if (en.isIntersecting) {
          $$('.nav-links a.active').forEach(x => x.classList.remove('active'));
          a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => io.observe(s));
  };
  spy();

  /* ===== carta: pestañas por categoría =====
     Mejora progresiva pura. Si este bloque no llega a ejecutarse, el HTML
     muestra las seis categorías seguidas y la carta se lee entera igual. */
  const menu = $('#menu');
  const tablist = menu && $('.menu-tabs', menu);
  if (menu && tablist) {
    const tabs = $$('[role="tab"]', tablist);
    const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));

    if (tabs.length && panels.every(Boolean)) {
      menu.classList.add('js-tabs');

      const select = (i, moveFocus) => {
        tabs.forEach((tab, n) => {
          const on = n === i;
          tab.setAttribute('aria-selected', String(on));
          tab.tabIndex = on ? 0 : -1;
          panels[n].hidden = !on;
        });
        if (moveFocus) tabs[i].focus();
        // cambia la altura del documento: recalcula los disparadores
        if (hasGSAP) ScrollTrigger.refresh();
      };

      select(0, false);
      tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i, false)));

      // navegación con flechas, Inicio y Fin (patrón ARIA de tabs)
      tablist.addEventListener('keydown', e => {
        const i = tabs.indexOf(document.activeElement);
        if (i < 0) return;
        const target = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (target === undefined) return;
        e.preventDefault();
        select((target + tabs.length) % tabs.length, true);
      });
    }
  }

  /* ===== animaciones de scroll ===== */
  if (animate) {
    ScrollTrigger.create({
      start: 'top -80',
      onUpdate:  s => setShrink(s.scroll() > 80),
      onRefresh: s => setShrink(s.scroll() > 80)
    });

    // `start` es del ScrollTrigger, no una propiedad a animar: se extrae aparte.
    // once:true mata el disparador al terminar; si no, los ~45 que hay siguen
    // recalculándose en cada scroll durante toda la sesión.
    const fadeIn = (sel, { start = 'top 88%', ...vars }) => gsap.utils.toArray(sel).forEach(el => {
      if (el.closest('.hero')) return;
      gsap.from(el, Object.assign({ ease: 'power3.out' }, vars, {
        scrollTrigger: { trigger: el, start, once: true }
      }));
    });

    fadeIn('[data-fade]',   { y: 34, opacity: 0, duration: 1 });
    fadeIn('[data-lines]',  { y: 40, opacity: 0, duration: 1.1, start: 'top 86%' });
    fadeIn('[data-music]',  { yPercent: 30, opacity: 0, duration: 1.3, ease: 'power4.out', start: 'top 85%' });
    fadeIn('[data-reveal]', { y: 70, opacity: 0, scale: .97, duration: 1.1, start: 'top 90%' });
    fadeIn('[data-event]',  { x: -40, opacity: 0, duration: .9, start: 'top 92%' });

    /* ===== parallax cinematográfico ===== */
    const par = (sel, amt) => {
      const el = $(sel);
      if (!el) return;
      gsap.to(el, {
        yPercent: amt, ease: 'none',
        scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true }
      });
    };
    par('#heroImg',   18);
    par('#musicImg', -15);
    par('#lifeImg',  -16);
    par('#finaleImg',-14);

    gsap.to('#heroImg', { scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.marquee-track', { xPercent: -50, repeat: -1, duration: 24, ease: 'none' });

    // el acordeón cambia la altura del documento: recalcula posiciones
    $$('.faq-list details').forEach(d =>
      d.addEventListener('toggle', () => ScrollTrigger.refresh())
    );
  } else {
    // sin motor de animación: estado final visible y nav funcional por scroll nativo
    const onScroll = () => setShrink(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ===== equalizer: alturas iniciales aleatorias ===== */
  $$('.equalizer i').forEach(i => { i.style.height = (10 + Math.random() * 30) + 'px'; });

  /* ===== cursor a medida + hover magnético ===== */
  if (hasGSAP && !mqNoHover && !reduceMotion) {
    const cur = $('.cursor'), dot = $('.cursor-dot');
    if (cur && dot) {
      document.documentElement.classList.add('custom-cursor');
      let mx = 0, my = 0, cx = 0, cy = 0;
      window.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        gsap.set(dot, { x: mx, y: my });
      }, { passive: true });
      gsap.ticker.add(() => { cx += (mx - cx) * .16; cy += (my - cy) * .16; gsap.set(cur, { x: cx, y: cy }); });

      $$('[data-cursor]').forEach(el => {
        el.addEventListener('mouseenter', () => cur.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => cur.classList.remove('is-hover'));
      });

      // el botón "volver arriba" queda fuera: su transform lo controla el estado .show
      $$('.btn,.nav-cta').forEach(btn => {
        btn.addEventListener('mousemove', e => {
          const r = btn.getBoundingClientRect();
          gsap.to(btn, {
            x: (e.clientX - r.left - r.width / 2) * .3,
            y: (e.clientY - r.top - r.height / 2) * .3,
            duration: .5, ease: 'power3.out'
          });
        });
        btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
      });
    }
  }

  /* ===== arranque ===== */
  if (document.readyState === 'complete') runLoader();
  else window.addEventListener('load', runLoader);

  // recalcula tras cargar imágenes para evitar saltos de scroll
  window.addEventListener('load', () => { if (hasGSAP) ScrollTrigger.refresh(); });
})();
