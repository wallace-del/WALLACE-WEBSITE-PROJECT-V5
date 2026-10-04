(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Mobile navigation
  const menuButton = $('[data-menu-button]');
  const mobileMenu = $('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';

      menuButton.setAttribute('aria-expanded', String(!open));
      menuButton.setAttribute(
        'aria-label',
        open ? 'Open navigation' : 'Close navigation'
      );

      mobileMenu.hidden = open;
    });

    $$('a', mobileMenu).forEach(a => {
      a.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
        mobileMenu.hidden = true;
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !mobileMenu.hidden) {
        menuButton.setAttribute('aria-expanded', 'false');
        mobileMenu.hidden = true;
        menuButton.focus();
      }
    });
  }

  // Scroll progress
  const progress = $('[data-scroll-progress]');

  const updateProgress = () => {
    if (!progress) return;

    const max = document.documentElement.scrollHeight - innerHeight;

    progress.style.width =
      `${max > 0 ? Math.min(100, (scrollY / max) * 100) : 0}%`;
  };

  addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // Reveal animations
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealNodes = $$('[data-reveal]');

  if (reduce || !('IntersectionObserver' in window)) {
    revealNodes.forEach(n => n.classList.add('revealed'));
  } else {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            io.unobserve(e.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px'
      }
    );

    revealNodes.forEach(n => io.observe(n));
  }

  // Typing effect
  const typing = $('[data-typing]');

  if (typing) {
    const items = (typing.dataset.items || '')
      .split('|')
      .filter(Boolean);

    if (reduce || items.length === 0) {
      typing.textContent = items[0] || 'practical IT skills';
    } else {
      let item = 0;
      let char = 0;
      let deleting = false;

      const tick = () => {
        const word = items[item];

        char += deleting ? -1 : 1;

        typing.textContent = word.slice(
          0,
          Math.max(0, char)
        );

        let delay = deleting ? 45 : 75;

        if (!deleting && char === word.length) {
          deleting = true;
          delay = 1100;
        } else if (deleting && char === 0) {
          deleting = false;
          item = (item + 1) % items.length;
          delay = 250;
        }

        setTimeout(tick, delay);
      };

      tick();
    }
  }

  // CV download check
  $$('[data-cv-link]').forEach(async link => {
    const href = link.getAttribute('href') || '';

    link.setAttribute('aria-disabled', 'true');
    link.title = 'Final CV has not been added yet.';

    if (!href || location.protocol === 'file:') return;

    try {
      const response = await fetch(href, {
        method: 'HEAD',
        cache: 'no-store'
      });

      if (
        response.ok &&
        (response.headers.get('content-type') || '').includes('pdf')
      ) {
        link.removeAttribute('aria-disabled');
        link.removeAttribute('title');
      }
    } catch (_) {
      // Keep disabled
    }
  });

  // Contact form
  const form = $('[data-contact-form]');

  if (form) {
    const status = $('[data-form-status]', form);

    const API_BASE =
      window.WALLACE_API_URL ||
      (
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1'
          ? 'http://127.0.0.1:5001'
          : ''
      );

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const fields = $$('input, textarea', form);

      let valid = true;

      fields.forEach(f => {
        const value = f.value.trim();

        let bad = !value;

        if (f.type === 'email') {
          bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }

        if (
          f.name === 'name' &&
          value.length < 2
        ) {
          bad = true;
        }

        if (
          f.name === 'subject' &&
          value.length < 3
        ) {
          bad = true;
        }

        if (
          f.name === 'message' &&
          value.length < 10
        ) {
          bad = true;
        }

        f.setAttribute(
          'aria-invalid',
          String(bad)
        );

        if (bad) {
          valid = false;
        }
      });

      if (!valid) {
        status.textContent =
          'Please enter a valid name, email, subject, and a message of at least 10 characters.';

        const firstInvalid = fields.find(
          f =>
            f.getAttribute('aria-invalid') === 'true'
        );

        firstInvalid?.focus();

        return;
      }

      const data =
        Object.fromEntries(
          new FormData(form).entries()
        );

      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonHtml = submitButton?.innerHTML;

      status.textContent = 'Sending...';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      try {
        const response = await fetch(
          `${API_BASE}/api/contact`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          }
        );

        const result =
          await response
            .json()
            .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.error ||
            'Message could not be sent.'
          );
        }

        form.reset();

        fields.forEach(f =>
          f.removeAttribute(
            'aria-invalid'
          )
        );

        status.textContent = 'Message sent successfully.';
      } catch (error) {
        console.error('Contact form error:', error);
        status.textContent =
          'Unable to send the message. Please try again or email me directly.';
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonHtml;
        }
      }
    });
  }
})();