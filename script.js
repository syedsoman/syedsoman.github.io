(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  const progressBar = document.getElementById('progress-bar');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = [...document.querySelectorAll('.nav-link')];
  const revealItems = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateScrollUI = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${progress}%`;
    header.classList.toggle('scrolled', window.scrollY > 24);
  };

  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    navLinks.classList.toggle('open', !isOpen);
  });

  navItems.forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
      navLinks.classList.remove('open');
    });
  });

  const sectionTargets = navItems
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navItems.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

  sectionTargets.forEach((section) => sectionObserver.observe(section));

  if (reduceMotion) {
    revealItems.forEach((item) => item.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min((index % 5) * 70, 280)}ms`;
      revealObserver.observe(item);
    });
  }

  const canvas = document.getElementById('particle-canvas');
  const context = canvas.getContext('2d');
  let particles = [];
  let animationFrame;

  const resizeCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const amount = window.innerWidth < 600 ? 26 : 48;
    particles = Array.from({ length: amount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * document.documentElement.scrollHeight,
      radius: Math.random() * 1.2 + .3,
      opacity: Math.random() * .35 + .08,
      speed: Math.random() * .12 + .03
    }));
  };

  const drawParticles = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const viewTop = window.scrollY;
    particles.forEach((particle) => {
      particle.y -= particle.speed;
      if (particle.y < viewTop - 20) particle.y = viewTop + window.innerHeight + 20;
      const localY = particle.y - viewTop;
      context.beginPath();
      context.arc(particle.x, localY, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(121, 244, 255, ${particle.opacity})`;
      context.fill();
    });
    if (!reduceMotion) animationFrame = requestAnimationFrame(drawParticles);
  };

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  if (reduceMotion) drawParticles();
  else animationFrame = requestAnimationFrame(drawParticles);

  const form = document.getElementById('contact-form');
  const formNote = document.getElementById('form-note');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    formNote.textContent = 'Thanks! Please contact me directly through email or LinkedIn.';
    form.reset();
  });

  window.addEventListener('beforeunload', () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
  });
})();