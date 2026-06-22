(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  const body = document.body;
  const header = $('#header');
  const preloader = $('#preloader');
  const progress = $('#scrollProgress');
  const menuButton = $('#menuBtn');
  const mobileMenu = $('#mobileMenu');
  const toast = $('#toast');

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };

  window.addEventListener('load', () => {
    window.setTimeout(() => preloader?.classList.add('is-hidden'), 500);
  });

  const closeMenu = () => {
    mobileMenu?.classList.remove('is-open');
    menuButton?.classList.remove('is-active');
    menuButton?.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const open = !mobileMenu?.classList.contains('is-open');
    mobileMenu?.classList.toggle('is-open', open);
    menuButton.classList.toggle('is-active', open);
    menuButton.setAttribute('aria-expanded', String(open));
    body.classList.toggle('menu-open', open);
  });

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => closeMenu());
  });

  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 20);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const width = max > 0 ? Math.min(100, (y / max) * 100) : 0;
      progress.style.width = `${width}%`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  $('#backToTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
  if ($('#currentYear')) $('#currentYear').textContent = new Date().getFullYear();

  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -55px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const navLinks = $$('.desktop-nav a');
  const sections = $$('main section[id]');
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`));
    }, { threshold: [0.24, 0.45, 0.65], rootMargin: '-16% 0px -55% 0px' });
    sections.forEach((section) => navObserver.observe(section));
  }

  const countElement = $('[data-count]');
  if (countElement && 'IntersectionObserver' in window) {
    let counted = false;
    const countObserver = new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting || counted) return;
      counted = true;
      const target = Number(countElement.dataset.count || 100);
      const duration = prefersReducedMotion ? 0 : 900;
      const start = performance.now();
      const tick = (now) => {
        const ratio = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - ratio, 3);
        countElement.textContent = Math.round(target * eased);
        if (ratio < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.7 });
    countObserver.observe(countElement);
  }

  const vibeButton = $('#vibeToggle');
  const savedVibe = localStorage.getItem('gejor-vibe') === 'turbo';
  const setVibe = (enabled) => {
    body.classList.toggle('turbo', enabled);
    vibeButton?.setAttribute('aria-pressed', String(enabled));
    vibeButton?.setAttribute('title', enabled ? 'Desativar modo Turbo' : 'Ativar modo Turbo');
    localStorage.setItem('gejor-vibe', enabled ? 'turbo' : 'normal');
  };
  setVibe(savedVibe);
  vibeButton?.addEventListener('click', () => {
    const enabled = !body.classList.contains('turbo');
    setVibe(enabled);
    showToast(enabled ? 'Modo Turbo ativado ⚡' : 'Modo Turbo desativado');
  });

  if (isFinePointer && !prefersReducedMotion) {
    const cursorGlow = $('#cursorGlow');
    window.addEventListener('pointermove', (event) => {
      if (!cursorGlow) return;
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    }, { passive: true });

    $$('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1100px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateZ(0)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    $$('.magnetic').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px) translateY(-2px)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });
  }

  const filterButtons = $$('.filter-tabs button');
  const projectCards = $$('.project-card');
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
      projectCards.forEach((card) => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  const lightbox = $('#lightbox');
  const lightboxImage = $('#lightboxImage');
  const lightboxCaption = $('#lightboxCaption');
  const lightboxClose = $('#lightboxClose');
  let lastFocused = null;

  const openLightbox = (trigger) => {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;
    lastFocused = trigger;
    lightboxImage.src = trigger.dataset.lightbox || '';
    lightboxImage.alt = trigger.dataset.caption || 'Projeto GEJOR SOUND';
    lightboxCaption.textContent = trigger.dataset.caption || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    body.classList.add('modal-open');
    lightboxClose?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    body.classList.remove('modal-open');
    if (lightboxImage) lightboxImage.src = '';
    lastFocused?.focus();
  };

  $$('[data-lightbox]').forEach((trigger) => trigger.addEventListener('click', () => openLightbox(trigger)));
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      if (lightbox?.classList.contains('is-open')) closeLightbox();
    }
  });

  $$('[data-accordion] .accordion-item').forEach((item) => {
    const button = $('button', item);
    button?.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      $$('[data-accordion] .accordion-item').forEach((other) => {
        other.classList.remove('is-open');
        $('button', other)?.setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    });
  });

  const builder = $('#projectBuilder');
  if (builder) {
    const steps = $$('.builder-step', builder);
    const nextButton = $('#builderNext');
    const backButton = $('#builderBack');
    const sendButton = $('#builderSend');
    const stepNumber = $('#configStep');
    const stepProgress = $('#configProgress');
    const configStatus = $('#configStatus');
    let currentStep = 1;

    const updateBuilder = () => {
      steps.forEach((step) => step.classList.toggle('is-active', Number(step.dataset.step) === currentStep));
      if (stepNumber) stepNumber.textContent = String(currentStep).padStart(2, '0');
      if (stepProgress) stepProgress.style.width = `${(currentStep / steps.length) * 100}%`;
      if (backButton) backButton.disabled = currentStep === 1;
      if (nextButton) nextButton.hidden = currentStep === steps.length;
      if (sendButton) sendButton.hidden = currentStep !== steps.length;
      if (configStatus) {
        configStatus.textContent = currentStep === 1 ? 'Escolha o objetivo principal' : currentStep === 2 ? 'Defina o perfil do som' : 'Último passo: seus dados';
      }
    };

    const validateStep = () => {
      const activeStep = $(`.builder-step[data-step="${currentStep}"]`, builder);
      if (!activeStep) return true;
      if (currentStep <= 2) {
        const selected = $('input[type="radio"]:checked', activeStep);
        if (!selected) {
          showToast('Selecione uma opção para continuar.');
          return false;
        }
      }
      return true;
    };

    nextButton?.addEventListener('click', () => {
      if (!validateStep()) return;
      currentStep = Math.min(steps.length, currentStep + 1);
      updateBuilder();
    });

    backButton?.addEventListener('click', () => {
      currentStep = Math.max(1, currentStep - 1);
      updateBuilder();
    });

    builder.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!builder.reportValidity()) return;
      const data = new FormData(builder);
      const objetivo = data.get('objetivo') || 'Não informado';
      const perfil = data.get('perfil') || 'Não informado';
      const nome = String(data.get('nome') || '').trim();
      const carro = String(data.get('carro') || '').trim();
      const detalhes = String(data.get('detalhes') || '').trim();
      const message = [
        'Olá, GEJOR SOUND! Montei uma ideia pelo site:',
        '',
        `Nome: ${nome}`,
        `Carro/modelo: ${carro}`,
        `Objetivo: ${objetivo}`,
        `Perfil desejado: ${perfil}`,
        detalhes ? `Detalhes: ${detalhes}` : '',
        '',
        'Gostaria de conversar sobre o orçamento.'
      ].filter(Boolean).join('\n');
      window.open(`https://wa.me/5511948930695?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
      showToast('Projeto preparado para o WhatsApp.');
    });

    updateBuilder();
  }

  const canvas = $('#fxCanvas');
  const context = canvas?.getContext('2d');
  let particles = [];
  let animationId = null;

  const resizeCanvas = () => {
    if (!canvas || !context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const amount = window.innerWidth < 820 ? 28 : 64;
    particles = Array.from({ length: amount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.6 + 0.35,
      speed: Math.random() * 0.32 + 0.08,
      alpha: Math.random() * 0.35 + 0.08
    }));
  };

  const drawParticles = () => {
    if (!context || prefersReducedMotion) return;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((particle) => {
      particle.y -= particle.speed;
      if (particle.y < -6) {
        particle.y = window.innerHeight + 6;
        particle.x = Math.random() * window.innerWidth;
      }
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(8,216,255,${particle.alpha})`;
      context.fill();
    });
    animationId = requestAnimationFrame(drawParticles);
  };

  if (canvas && context && !prefersReducedMotion) {
    resizeCanvas();
    drawParticles();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && animationId) cancelAnimationFrame(animationId);
      if (!document.hidden) drawParticles();
    });
  }

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();
