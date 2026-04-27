/* ===================================================
   FACE ART ZÜRICH — Main JavaScript
   =================================================== */

(function () {
  'use strict';

  /* ===== Nav: transparent → scrolled ===== */
  const nav = document.getElementById('nav');

  function updateNav() {
    if (!nav) return;
    if (nav.dataset.navStatic) return; // static nav pages (e.g. hochzeiten) stay scrolled
    if (window.scrollY > 40) {
      nav.classList.add('nav--scrolled');
      nav.classList.remove('nav--transparent');
    } else {
      nav.classList.remove('nav--scrolled');
      nav.classList.add('nav--transparent');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav(); // run once on load

  /* ===== Logo image fallback ===== */
  document.querySelectorAll('.nav__logo-img').forEach(function (img) {
    img.addEventListener('error', function () {
      this.style.display = 'none';
      const text = this.closest('.nav__logo') && this.closest('.nav__logo').querySelector('.nav__logo-text');
      if (text) {
        text.style.display = 'flex';
        text.style.opacity = '1';
        text.style.pointerEvents = 'auto';
      }
    });
  });

  /* ===== Mobile menu toggle ===== */
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('nav__menu--open');
      navToggle.classList.toggle('nav__toggle--open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Menü schliessen' : 'Menü öffnen');
      // prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    navMenu.querySelectorAll('.nav__link:not(.nav__link--disabled)').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('nav__menu--open');
        navToggle.classList.remove('nav__toggle--open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Menü öffnen');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (
        navMenu.classList.contains('nav__menu--open') &&
        !nav.contains(e.target)
      ) {
        navMenu.classList.remove('nav__menu--open');
        navToggle.classList.remove('nav__toggle--open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ===== Contact Forms ===== */
  var CONTACT_ENDPOINT = 'https://formspree.io/f/myklqzbr';

  document.querySelectorAll('.contact-form').forEach(function (form) {
    var confirmId = form.id === 'messenContactForm' ? 'messenFormConfirm' : 'formConfirm';
    var confirmEl = document.getElementById(confirmId);
    if (!confirmEl) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validation
      var requiredFields = form.querySelectorAll('[required]');
      var valid = true;
      requiredFields.forEach(function (field) {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#E07070';
        }
      });
      if (!valid) return;

      var btn = form.querySelector('button[type="submit"]');
      var originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Wird gesendet…';

      // Collect all form fields
      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = value; });

      // Email subject per form type
      data._subject = form.id === 'messenContactForm'
        ? 'Messeanfrage — Face Art Zürich'
        : 'Neue Kontaktanfrage — Face Art Zürich';

      fetch(CONTACT_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(data)
      })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          btn.disabled = false;
          btn.textContent = originalText;
          if (json.ok) {
            form.reset();
            confirmEl.classList.add('contact-form__confirm--visible');
            setTimeout(function () {
              confirmEl.classList.remove('contact-form__confirm--visible');
            }, 6000);
          } else {
            confirmEl.textContent = 'Fehler beim Senden — bitte versuche es erneut.';
            confirmEl.classList.add('contact-form__confirm--visible');
          }
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = originalText;
          confirmEl.textContent = 'Keine Verbindung — bitte versuche es erneut.';
          confirmEl.classList.add('contact-form__confirm--visible');
        });
    });

    form.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('input',  function () { this.style.borderColor = ''; });
      field.addEventListener('change', function () { this.style.borderColor = ''; });
    });
  });

  /* ===== Smooth scroll for anchor links ===== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 74;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ===== Fade-in on scroll ===== */
  if ('IntersectionObserver' in window) {
    const style = document.createElement('style');
    style.textContent = `
      .fade-in {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.55s ease, transform 0.55s ease;
      }
      .fade-in--visible {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    // Elements to animate
    const targets = document.querySelectorAll(
      '.service-card, .feature, .step, .benefit, .testimonial__text, .section__header, .pricing__card, .about-intro__img, .material-box'
    );

    targets.forEach(function (el) {
      el.classList.add('fade-in');
    });

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ===== Accordion Hero ===== */
  var accAccordion = document.getElementById('accHeroAccordion');
  if (accAccordion) {
    var accPanels = accAccordion.querySelectorAll('.acc-panel');

    function setAccActive(index) {
      accPanels.forEach(function (panel, i) {
        panel.classList.toggle('acc-panel--active', i === index);
      });
    }

    accPanels.forEach(function (panel, i) {
      panel.addEventListener('mouseenter', function () { setAccActive(i); });
      panel.addEventListener('click',      function () { setAccActive(i); });
    });
  }

  /* ===== Gallery Accordions (feature sections) ===== */
  document.querySelectorAll('.gallery-acc').forEach(function (acc) {
    var panels = acc.querySelectorAll('.gallery-acc__panel');
    panels.forEach(function (panel, i) {
      panel.addEventListener('mouseenter', function () {
        panels.forEach(function (p, j) {
          p.classList.toggle('gallery-acc__panel--active', j === i);
        });
      });
      panel.addEventListener('click', function () {
        panels.forEach(function (p, j) {
          p.classList.toggle('gallery-acc__panel--active', j === i);
        });
      });
    });
  });

  /* ===== Photo Fan — drag interaction ===== */
  const photoCards = document.querySelectorAll('.photo-card');

  photoCards.forEach(function (card) {
    var startX, startY, origLeft, origTop, isDragging = false;
    var baseX = parseInt(getComputedStyle(card).getPropertyValue('--tx')) || 0;
    var baseY = parseInt(getComputedStyle(card).getPropertyValue('--ty')) || 0;

    function onPointerDown(e) {
      isDragging = true;
      card.classList.add('photo-card--dragging');
      startX = e.clientX;
      startY = e.clientY;
      // Read current rendered translate from inline style if snapped back
      origLeft = baseX;
      origTop  = baseY;
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup',   onPointerUp);
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var newX = origLeft + dx;
      var newY = origTop  + dy;
      card.style.transform = 'translate(' + newX + 'px, ' + newY + 'px) rotate(var(--rot)) scale(1.06)';
    }

    function onPointerUp() {
      isDragging = false;
      card.classList.remove('photo-card--dragging');
      // Spring back
      card.style.transition = 'transform 0.55s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.25s ease';
      card.style.transform   = 'translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1)';
      setTimeout(function () { card.style.transition = ''; }, 600);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup',   onPointerUp);
    }

    card.addEventListener('pointerdown', onPointerDown);
  });

  /* ===== Newsletter Signup ===== */
  const FORMSPREE_FORM_ID = 'myklqzbr';

  document.querySelectorAll('.newsletter-section').forEach(function (section) {
    const options   = section.querySelectorAll('.nl-option');
    const form      = section.querySelector('.nl-form');
    const errorEl   = section.querySelector('.nl-form__error');
    const successEl = section.querySelector('.nl-success');

    if (!form) return;

    // Toggle option cards
    options.forEach(function (option) {
      option.addEventListener('click', function (e) {
        e.preventDefault();
        const cb = option.querySelector('.nl-option__checkbox');
        option.classList.toggle('is-active');
        cb.checked = option.classList.contains('is-active');
        if (errorEl) errorEl.textContent = '';
      });
    });

    // Submit
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const emailInput = form.querySelector('.nl-form__input');
      const btn        = form.querySelector('.nl-form__btn');
      const email      = emailInput.value.trim();
      const labelMap = { events: 'Events & Auftritte', angebote: 'Persönliche Angebote' };
      const selected = Array.from(options)
        .filter(function (o) { return o.classList.contains('is-active'); })
        .map(function (o) { return labelMap[o.dataset.value] || o.dataset.value; });

      // Validate: at least one option
      if (!selected.length) {
        options.forEach(function (o) {
          o.classList.add('nl-option--shake');
          setTimeout(function () { o.classList.remove('nl-option--shake'); }, 400);
        });
        if (errorEl) errorEl.textContent = 'Bitte mindestens eine Option auswählen.';
        return;
      }

      // Validate email
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (errorEl) errorEl.textContent = 'Bitte eine gültige E-Mail-Adresse eingeben.';
        emailInput.focus();
        return;
      }

      if (errorEl) errorEl.textContent = '';
      btn.disabled    = true;
      btn.textContent = '…';

      const payload = {
        email:       email,
        interessen:  selected.join(', '),
        _subject:    'Neue Newsletter-Anmeldung — Face Art Zürich (' + selected.join(' + ') + ')'
      };

      const endpoint = FORMSPREE_FORM_ID
        ? 'https://formspree.io/f/' + FORMSPREE_FORM_ID
        : null;

      function showSuccess() {
        form.hidden      = true;
        section.querySelector('.newsletter-section__options').hidden = true;
        section.querySelector('.newsletter-section__subtitle').hidden = true;
        successEl.hidden = false;
      }

      if (endpoint) {
        fetch(endpoint, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body:    JSON.stringify(payload)
        })
          .then(function (res) {
            if (res.ok) {
              showSuccess();
            } else {
              btn.disabled    = false;
              btn.textContent = 'Jetzt anmelden';
              if (errorEl) errorEl.textContent = 'Fehler beim Senden. Bitte versuche es erneut.';
            }
          })
          .catch(function () {
            btn.disabled    = false;
            btn.textContent = 'Jetzt anmelden';
            if (errorEl) errorEl.textContent = 'Keine Verbindung. Bitte versuche es erneut.';
          });
      } else {
        // No Formspree configured — show success after short delay (demo mode)
        setTimeout(showSuccess, 700);
      }
    });
  });

  /* ===== FAQ Accordion ===== */
  document.querySelectorAll('.faq__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = this.closest('.faq__item');
      var card = this.closest('.faq__card');
      var isOpen = item.classList.contains('faq__item--open');

      // Close all items in this card
      card.querySelectorAll('.faq__item').forEach(function (i) {
        i.classList.remove('faq__item--open');
        i.querySelector('.faq__btn').setAttribute('aria-expanded', 'false');
      });

      // If it was closed, open it
      if (!isOpen) {
        item.classList.add('faq__item--open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

})();
