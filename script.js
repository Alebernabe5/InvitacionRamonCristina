/* ==========================================================================
   BODA RAMON & CRISTINA · 03.07.2027
   script.js — countdown, navegación, animaciones y RSVP
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. CUENTA REGRESIVA · hasta el 3 de julio de 2027
     ------------------------------------------------------------------ */
  var FECHA_BODA = new Date('2027-07-03T12:30:00');

  var el = {
    days:  document.getElementById('cdDays'),
    hours: document.getElementById('cdHours'),
    mins:  document.getElementById('cdMins'),
    secs:  document.getElementById('cdSecs')
  };

  var countdownEl = document.getElementById('countdown');
  var remainingEl = document.querySelector('.hero__remaining');

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function tick() {
    if (!el.days) return;

    var diff = FECHA_BODA.getTime() - Date.now();

    if (diff <= 0) {
      el.days.textContent  = '00';
      el.hours.textContent = '00';
      el.mins.textContent  = '00';
      el.secs.textContent  = '00';
      if (remainingEl) remainingEl.textContent = '¡Hoy es el gran día!';
      if (countdownEl) countdownEl.setAttribute('aria-label', 'Ya ha llegado el día de la boda');
      clearInterval(timer);
      return;
    }

    var s = Math.floor(diff / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;

    el.days.textContent  = pad(d);
    el.hours.textContent = pad(h);
    el.mins.textContent  = pad(m);
    el.secs.textContent  = pad(sec);

    if (countdownEl) {
      countdownEl.setAttribute('aria-label',
        d + ' días, ' + h + ' horas, ' + m + ' minutos y ' + sec + ' segundos para la boda');
    }
  }

  var timer = setInterval(tick, 1000);
  tick();

  /* ------------------------------------------------------------------
     2. NAVEGACIÓN · menú móvil + fondo sólido al hacer scroll
     ------------------------------------------------------------------ */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function closeMenu() {
    if (!navLinks) return;
    navLinks.classList.remove('is-open');
    navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('nav--solid', window.scrollY > 60);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     3. RESALTADO DE LA SECCIÓN ACTIVA
     ------------------------------------------------------------------ */
  var secciones = document.querySelectorAll('section[id]');
  var enlacesNav = document.querySelectorAll('.nav__links a');

  if ('IntersectionObserver' in window && enlacesNav.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        enlacesNav.forEach(function (a) {
          a.classList.toggle('active',
            a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    secciones.forEach(function (s) { navObserver.observe(s); });
  }

  /* ------------------------------------------------------------------
     4. ANIMACIONES DE ENTRADA
     ------------------------------------------------------------------ */
  var revealTargets = document.querySelectorAll(
    '.section__eyebrow, .section__title, .lead, .card, .gallery__item, .facts__item, .timeline__list, .note, .form, .swatches, .dresscode__avoid, .dresscode__tip, .divider, .subhead'
  );

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(function (t, i) {
  t.classList.add('reveal');
  // Las tarjetas de "El gran día" no llevan retardo aquí:
  // se escalonan desde el CSS para que entren juntas y ordenadas
  if (!t.closest('.cards')) {
    t.style.transitionDelay = (i % 4) * 70 + 'ms';
  }
  revealObserver.observe(t);
});
  }

  /* ------------------------------------------------------------------
     5. FORMULARIO RSVP
     ------------------------------------------------------------------ */
  var form = document.getElementById('rsvpForm');
  var status = document.getElementById('formStatus');
  var submitBtn = document.getElementById('submitBtn');
  var acompanantesField = document.getElementById('acompanantesField');
  var alergiasField = document.getElementById('alergiasField');

  function setError(name, msg) {
    var small = form.querySelector('[data-error-for="' + name + '"]');
    if (small) small.textContent = msg || '';
    var field = form.querySelector('[name="' + name + '"]');
    if (field && field.closest('.field')) {
      field.closest('.field').classList.toggle('has-error', !!msg);
    }
    if (name === 'asistencia') {
      var fs = form.querySelector('fieldset.field');
      if (fs) fs.classList.toggle('has-error', !!msg);
    }
  }

  // Mostrar/ocultar campos según la respuesta
  function updateConditionalFields() {
    var asistencia = form.querySelector('input[name="asistencia"]:checked');
    var noViene = asistencia && asistencia.value === 'no';

    [acompanantesField, alergiasField].forEach(function (f) {
      if (!f) return;
      f.hidden = noViene;
      f.querySelectorAll('input, select, textarea').forEach(function (i) {
        i.disabled = noViene;
      });
    });

    if (submitBtn) {
      submitBtn.textContent = noViene ? 'Enviar respuesta' : 'Enviar confirmación';
    }
  }

  if (form) {
    form.querySelectorAll('input[name="asistencia"]').forEach(function (r) {
      r.addEventListener('change', function () {
        setError('asistencia', '');
        updateConditionalFields();
      });
    });

    var nombreInput = form.querySelector('#nombre');
    if (nombreInput) {
      nombreInput.addEventListener('input', function () { setError('nombre', ''); });
    }

    updateConditionalFields();

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nombre = form.querySelector('#nombre').value.trim();
      var asistencia = form.querySelector('input[name="asistencia"]:checked');
      var valido = true;

      if (nombre.length < 2) {
        setError('nombre', 'Por favor, escríbenos tu nombre.');
        valido = false;
      } else {
        setError('nombre', '');
      }

      if (!asistencia) {
        setError('asistencia', 'Cuéntanos si podrás acompañarnos.');
        valido = false;
      } else {
        setError('asistencia', '');
      }

      if (!valido) {
        status.textContent = 'Revisa los campos marcados.';
        status.className = 'form__status is-error';
        var firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
        if (firstError) firstError.focus();
        return;
      }

      status.textContent = 'Enviando…';
      status.className = 'form__status';
      if (submitBtn) submitBtn.disabled = true;

      var datos = {
        nombre: nombre,
        asistencia: asistencia.value,
        acompanantes: asistencia.value === 'no'
          ? 0
          : parseInt(form.querySelector('#acompanantes').value, 10) || 0,
        alergias: asistencia.value === 'no'
          ? ''
          : form.querySelector('#alergias').value.trim(),
        comentarios: form.querySelector('#comentarios').value.trim(),
        enviado: new Date().toISOString()
      };

      // Se guarda localmente para que no se pierda la respuesta.
      try {
        var previas = JSON.parse(localStorage.getItem('rsvp_ramon_cristina') || '[]');
        previas.push(datos);
        localStorage.setItem('rsvp_ramon_cristina', JSON.stringify(previas));
      } catch (err) {
        /* localStorage no disponible: seguimos igualmente */
      }

      // ---- AQUÍ CONECTAS TU BACKEND ----
      // Ejemplo con Formspree / Google Apps Script / tu API:
      //
      // fetch('https://formspree.io/f/TU_ID', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      //   body: JSON.stringify(datos)
      // })
      //   .then(function (r) { if (!r.ok) throw new Error('Error'); return r.json(); })
      //   .then(function () { mostrarExito(datos); })
      //   .catch(function () {
      //     status.textContent = 'No hemos podido enviarlo. Escríbenos a hola@ramonycristina.com';
      //     status.className = 'form__status is-error';
      //     if (submitBtn) submitBtn.disabled = false;
      //   });

      // Simulación de envío correcto (quita este bloque al conectar el backend):
      setTimeout(function () { mostrarExito(datos); }, 900);
    });
  }

  function mostrarExito(datos) {
    form.classList.add('is-sent');
    status.className = 'form__status is-ok';
    status.textContent = datos.asistencia === 'si'
      ? '¡Gracias, ' + datos.nombre.split(' ')[0] + '! Ya tenemos apuntado que vienes. Nos vemos el 3 de julio de 2027.'
      : '¡Gracias por avisarnos, ' + datos.nombre.split(' ')[0] + '! Te echaremos de menos.';

    var aviso = document.createElement('p');
    aviso.className = 'form__status is-ok';
    aviso.style.marginTop = '14px';
    aviso.textContent = datos.asistencia === 'si' && datos.alergias
      ? 'Anotamos también: ' + datos.alergias
      : '';
    if (aviso.textContent) status.insertAdjacentElement('afterend', aviso);

    if (submitBtn) submitBtn.disabled = true;
  }

  /* ------------------------------------------------------------------
     6. SCROLL SUAVE con compensación de la barra fija
     ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      var offset = window.innerWidth > 760 ? 70 : 56;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: top,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    });
  });


/* ------------------------------------------------------------------
   7. REPRODUCTOR FLOTANTE
   ------------------------------------------------------------------ */
var musicBtn = document.getElementById('musicBtn');
var music = document.getElementById('weddingMusic');

if (musicBtn && music) {

  function pintarEstado() {
    var suena = !music.paused && !music.ended;
    musicBtn.classList.toggle('is-playing', suena);
    musicBtn.setAttribute('aria-pressed', suena ? 'true' : 'false');
    musicBtn.setAttribute('aria-label', suena ? 'Pausar música' : 'Reproducir música');
  }

  musicBtn.addEventListener('click', function () {
    if (music.paused) {
      music.play().catch(function () {
        musicBtn.setAttribute('aria-label', 'No se pudo reproducir la música');
      });
    } else {
      music.pause();
    }
  });

  ['play', 'pause', 'ended'].forEach(function (ev) {
    music.addEventListener(ev, pintarEstado);
  });

  /* --- Arranque automático al primer gesto del invitado ---
     Los navegadores no permiten que suene sola al cargar, pero sí en
     cuanto el usuario toca, hace scroll o pulsa una tecla. */
  var gestos = ['click', 'touchstart', 'keydown', 'scroll', 'pointerdown'];

  function arrancarMusica() {
    if (!music.paused) {
      quitarGestos();
      return;
    }
    music.play().then(function () {
      pintarEstado();
      quitarGestos();          // ya suena: dejamos de escuchar
    }).catch(function () {
      // Todavía bloqueado; esperamos al siguiente gesto
    });
  }

  function quitarGestos() {
    gestos.forEach(function (ev) {
      document.removeEventListener(ev, arrancarMusica);
    });
  }

  gestos.forEach(function (ev) {
    document.addEventListener(ev, arrancarMusica, { passive: true });
  });

  // Si el invitado sale de la pestaña, paramos
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && !music.paused) {
      music.pause();
    }
  });

  pintarEstado();
}


})();
