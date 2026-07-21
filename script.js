/* ============================================================
   CHAR & CO – THE CHARCOAL KITCHEN
   JavaScript: Nav, Ember Particles, Parallax, Tilt, Scroll Reveals
   ============================================================ */

(function () {
  'use strict';

  /* ========================================================
     Feature detection: respect prefers-reduced-motion
  ======================================================== */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = () => ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  /* ========================================================
     NAV – scroll state + hamburger
  ======================================================== */
  const navHeader = document.getElementById('nav-header');
  const hamburger = document.getElementById('nav-hamburger');
  const navMenu   = document.getElementById('nav-menu');

  function updateNav() {
    if (window.scrollY > 20) {
      navHeader.classList.add('scrolled');
    } else {
      navHeader.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    // Prevent body scroll when menu open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on link click
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ========================================================
     SMOOTH SCROLL for internal anchors
  ======================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
    });
  });

  /* ========================================================
     PARALLAX – hero smoke layer
  ======================================================== */
  if (!prefersReducedMotion && !isTouchDevice()) {
    const smokeLayer = document.getElementById('smoke-layer');
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          if (smokeLayer) {
            smokeLayer.style.transform = `translateY(${scrollY * 0.25}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ========================================================
     EMBER PARTICLE CANVAS
  ======================================================== */
  (function initEmbers() {
    const canvas = document.getElementById('ember-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrame;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    function randomBetween(a, b) {
      return a + Math.random() * (b - a);
    }

    function createParticle() {
      return {
        x:       randomBetween(0, canvas.width),
        y:       randomBetween(canvas.height * 0.3, canvas.height),
        vx:      randomBetween(-0.3, 0.3),
        vy:      randomBetween(-0.8, -0.2),
        size:    randomBetween(1.5, 4),
        life:    0,
        maxLife: randomBetween(80, 200),
        hue:     randomBetween(10, 45), // orange-yellow
        sat:     randomBetween(80, 100),
      };
    }

    // Seed particles
    for (let i = 0; i < (prefersReducedMotion ? 0 : 35); i++) {
      const p = createParticle();
      p.life = Math.random() * p.maxLife; // stagger
      particles.push(p);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        const progress = p.life / p.maxLife;
        const alpha = progress < 0.2
          ? progress / 0.2
          : progress > 0.8
          ? (1 - progress) / 0.2
          : 1;

        const lum = 60 + progress * 20;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${lum}%, ${alpha * 0.65})`;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, ${alpha * 0.4})`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Update
        p.x += p.vx + Math.sin(p.life * 0.05) * 0.3;
        p.y += p.vy;
        p.life++;

        // Reset when dead
        if (p.life >= p.maxLife) {
          particles[i] = createParticle();
        }
      });

      animFrame = requestAnimationFrame(draw);
    }

    // Only animate when hero is visible
    const heroSection = document.getElementById('home');
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (!animFrame) draw();
        } else {
          cancelAnimationFrame(animFrame);
          animFrame = null;
        }
      });
    }, { threshold: 0.1 });

    if (heroSection) heroObserver.observe(heroSection);
    else draw(); // fallback
  })();

  /* ========================================================
     3D TILT on Menu Cards (desktop only)
  ======================================================== */
  if (!prefersReducedMotion && !isTouchDevice()) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      const TILT_MAX = 12;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width  / 2;
        const cy = rect.height / 2;

        const rotX = ((y - cy) / cy) * -TILT_MAX;
        const rotY = ((x - cx) / cx) *  TILT_MAX;

        card.style.transform = `
          perspective(600px)
          rotateX(${rotX}deg)
          rotateY(${rotY}deg)
          translateZ(8px)
        `;
        card.style.boxShadow = `
          ${-rotY * 1.5}px ${rotX * 1.5}px 40px rgba(0,0,0,0.55),
          0 0 30px rgba(232, 93, 4, 0.2)
        `;
        card.style.borderColor = 'rgba(232, 93, 4, 0.35)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.borderColor = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.19,1,0.22,1), box-shadow 0.5s, border-color 0.3s';
        // Clean up transition after it settles
        setTimeout(() => { card.style.transition = ''; }, 500);
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'none';
      });
    });
  }

  /* ========================================================
     SCROLL REVEAL – Why Cards
  ======================================================== */
  (function initRevealCards() {
    const cards = document.querySelectorAll('.reveal-card');
    if (!cards.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0');
          if (prefersReducedMotion) {
            entry.target.classList.add('visible');
          } else {
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, delay);
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    cards.forEach(card => observer.observe(card));
  })();

  /* ========================================================
     SCROLL REVEAL – Signature 3D reveal
  ======================================================== */
  (function initSignatureReveal() {
    const el = document.querySelector('.reveal-3d');
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(el);
  })();

  /* ========================================================
     MENU TABS
  ======================================================== */
  (function initMenuTabs() {
    const tabs    = document.querySelectorAll('.menu-tab');
    const panels  = document.querySelectorAll('[role="tabpanel"]');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('aria-controls');

        // Update tabs
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Update panels
        panels.forEach(p => {
          if (p.id === targetId) {
            p.classList.remove('hidden');
            // Re-trigger tilt listeners on newly visible cards (desktop)
            if (!prefersReducedMotion && !isTouchDevice()) {
              p.querySelectorAll('.tilt-card').forEach(card => {
                // Cards will pick up the delegated listeners automatically
              });
            }
          } else {
            p.classList.add('hidden');
          }
        });
      });
    });
  })();

  /* ========================================================
     Active nav link on scroll
  ======================================================== */
  (function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const navH = 80;

    function setActive() {
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY + navH >= sec.offsetTop) {
          current = sec.id;
        }
      });
      navLinks.forEach(link => {
        link.classList.toggle('active-nav', link.dataset.section === current);
      });
    }

    window.addEventListener('scroll', setActive, { passive: true });
    setActive();
  })();

  /* ========================================================
     Hero image subtle float on mouse move (desktop)
  ======================================================== */
  if (!prefersReducedMotion && !isTouchDevice()) {
    const heroImg = document.querySelector('.hero__food-img');
    const heroSection = document.getElementById('home');

    if (heroImg && heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const cx = rect.width  / 2;
        const cy = rect.height / 2;
        const dx = (e.clientX - rect.left - cx) / cx;
        const dy = (e.clientY - rect.top  - cy) / cy;
        heroImg.style.transform = `translate(${dx * 8}px, ${dy * 6}px)`;
      });

      heroSection.addEventListener('mouseleave', () => {
        heroImg.style.transform = '';
        heroImg.style.transition = 'transform 0.8s cubic-bezier(0.19,1,0.22,1)';
        setTimeout(() => { heroImg.style.transition = ''; }, 800);
      });
    }
  }

  /* ========================================================
     Floating CTAs – hide when footer visible
  ======================================================== */
  (function initFloatingCTAs() {
    const floatingCTAs = document.querySelector('.floating-ctas');
    const footer = document.querySelector('.footer');
    if (!floatingCTAs || !footer) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        floatingCTAs.style.opacity = e.isIntersecting ? '0' : '1';
        floatingCTAs.style.pointerEvents = e.isIntersecting ? 'none' : 'auto';
      });
    }, { threshold: 0.1 });

    observer.observe(footer);
  })();

})();
