/* ═══════════════════════════════════════════════════════
   ANTON WOLTER – PORTFOLIO SCRIPTS
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Initialize Lucide icons ──────────────────────────
  lucide.createIcons();

  // ── DOM References ───────────────────────────────────
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const themeToggle = document.getElementById('themeToggle');

  /* ═══════════════════════════════════════════════════════
     1. DARK / LIGHT MODE TOGGLE
     ─ Saves preference to localStorage so it persists
       across page reloads.
  ═══════════════════════════════════════════════════════ */
  const THEME_KEY = 'aw-theme';

  /**
   * Apply the saved theme on page load.
   * Priority: explicit user choice > OS preference > light fallback.
   */
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-mode');
    themeToggle.setAttribute('aria-pressed', 'true');
  }

  /** Toggle theme and persist choice */
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');

    // Re-render icons after class change so sun/moon swap immediately
    lucide.createIcons();
  });

  /* ═══════════════════════════════════════════════════════
     2. STICKY NAVBAR SHADOW ON SCROLL
     ─ Adds a subtle bottom border + shadow when the
       user scrolls past a small threshold.
  ═══════════════════════════════════════════════════════ */
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once in case page loads mid-scroll

  /* ═══════════════════════════════════════════════════════
     3. MOBILE HAMBURGER MENU
     ─ Toggles the nav links visibility and animates
       the hamburger icon into an "X".
  ═══════════════════════════════════════════════════════ */
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close mobile menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ═══════════════════════════════════════════════════════
     4. SCROLL-TRIGGERED FADE-IN ANIMATIONS
     ─ Uses IntersectionObserver to add the "visible"
       class when elements enter the viewport.
  ═══════════════════════════════════════════════════════ */
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once only
        }
      });
    },
    {
      threshold: 0.15,    // trigger when 15% of element is visible
      rootMargin: '0px 0px -40px 0px'
    }
  );

  animatedElements.forEach(el => observer.observe(el));

  /* ═══════════════════════════════════════════════════════
     4b. TYPEWRITER EFFECT FOR HERO TAGLINE
     ─ Cycles through phrases with a typing & deleting
       animation for a dynamic first impression.
  ═══════════════════════════════════════════════════════ */
  const typewriterEl = document.getElementById('typewriter');
  const phrases = [
    'IT-ingenjörsstudent på Högskolan i Borås.',
    'Bygger appar med Flutter & FastAPI.',
    'Systemarkitektur · Nätverk · Moln · Säkerhet.',
    'Från infrastruktur till användargränssnitt.',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const TYPE_SPEED = 55;
  const DELETE_SPEED = 30;
  const PAUSE_AFTER_TYPE = 2000;
  const PAUSE_AFTER_DELETE = 400;

  function typewrite() {
    const current = phrases[phraseIndex];
    if (!isDeleting) {
      typewriterEl.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        isDeleting = true;
        setTimeout(typewrite, PAUSE_AFTER_TYPE);
        return;
      }
      setTimeout(typewrite, TYPE_SPEED);
    } else {
      typewriterEl.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typewrite, PAUSE_AFTER_DELETE);
        return;
      }
      setTimeout(typewrite, DELETE_SPEED);
    }
  }

  if (typewriterEl) {
    typewrite();
  }

  /* ═══════════════════════════════════════════════════════
     5. SMOOTH SCROLL FOR NAV LINKS
     ─ Although CSS "scroll-behavior: smooth" handles
       most cases, this provides a fallback and closes
       the mobile menu automatically.
  ═══════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ═══════════════════════════════════════════════════════
     6. CONTACT FORM – Formspree-integration via fetch
     ─ Postar i bakgrunden så användaren stannar på sidan.
  ═══════════════════════════════════════════════════════ */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('contactSubmit');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      formStatus.textContent = '';
      formStatus.className = 'form-status';
      submitBtn.disabled = true;
      submitBtn.classList.add('btn-loading');

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          formStatus.textContent = 'Tack! Ditt meddelande är skickat — jag återkommer så snart jag kan.';
          formStatus.classList.add('form-status--success');
          contactForm.reset();
        } else {
          const data = await response.json().catch(() => ({}));
          const msg = data.errors?.map(e => e.message).join(', ')
            || 'Något gick fel. Försök igen eller mejla mig direkt på woltrananton@gmail.com.';
          formStatus.textContent = msg;
          formStatus.classList.add('form-status--error');
        }
      } catch (err) {
        formStatus.textContent = 'Nätverksfel. Kontrollera din anslutning eller mejla mig direkt.';
        formStatus.classList.add('form-status--error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
      }
    });
  }

});
