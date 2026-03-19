'use strict';

// ========================
// SCROLL PROGRESS BAR
// ========================
const scrollBar = document.getElementById('scrollBar');
function updateScrollBar() {
  const max = document.body.scrollHeight - window.innerHeight;
  if (scrollBar && max > 0) scrollBar.style.width = (window.scrollY / max * 100) + '%';
}
window.addEventListener('scroll', updateScrollBar, { passive: true });

// ========================
// NAVBAR SCROLL STATE
// ========================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ========================
// MOBILE NAV
// ========================
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );
}

// ========================
// CURSOR GLOW
// ========================
const cursorGlow = document.getElementById('cursorGlow');
let mx = 0, my = 0, gx = 0, gy = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
(function animateCursor() {
  gx += (mx - gx) * 0.07;
  gy += (my - gy) * 0.07;
  if (cursorGlow) { cursorGlow.style.left = gx + 'px'; cursorGlow.style.top = gy + 'px'; }
  requestAnimationFrame(animateCursor);
})();

// ========================
// PARTICLE CANVAS
// ========================
(function () {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];
  const N = window.innerWidth < 768 ? 45 : 85;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }

  function Pt() { this.reset(); }
  Pt.prototype.reset = function () {
    this.x = Math.random() * W; this.y = Math.random() * H;
    this.r = Math.random() * 1.4 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.a = Math.random() * 0.45 + 0.08;
    this.c = Math.random() > 0.5 ? '108,79,255' : '0,212,255';
  };

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // Connections
    for (let i = 0; i < pts.length; i++) {
      pts[i].x += pts[i].vx; pts[i].y += pts[i].vy;
      if (pts[i].x < -10 || pts[i].x > W + 10 || pts[i].y < -10 || pts[i].y > H + 10) pts[i].reset();
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(108,79,255,${(1 - d / 130) * 0.1})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y, pts[i].r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pts[i].c},${pts[i].a})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize();
  pts = Array.from({ length: N }, () => new Pt());
  draw();
  window.addEventListener('resize', () => { resize(); pts.forEach(p => p.reset()); }, { passive: true });
})();

// ========================
// SCROLL REVEAL
// ========================
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal-up, .reveal-right').forEach(el => revealObs.observe(el));

// ========================
// ANIMATED COUNTERS
// ========================
function counter(el, target, dur = 1800) {
  let start = null;
  (function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target);
    if (p < 1) requestAnimationFrame(step);
  })(performance.now());
}
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const t = parseInt(e.target.dataset.target, 10);
      if (!isNaN(t)) counter(e.target, t);
      cntObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => cntObs.observe(el));

// ========================
// LIGHTBOX (profile photo)
// ========================
const profileImg = document.getElementById('profileImg');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');

if (profileImg && lightbox && lightboxImg) {
  profileImg.style.cursor = 'zoom-in';
  profileImg.addEventListener('click', () => {
    lightboxImg.src = profileImg.src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

// ========================
// CINEMATIC HORIZONTAL SCROLL
// ========================
(function initCinematicScroll() {
  const strip = document.getElementById('cinematicStrip');
  const track = document.getElementById('cinematicTrack');
  const dots = document.querySelectorAll('.cinema-dot');
  if (!strip || !track) return;

  const PANELS = 4;

  function update() {
    const rect = strip.getBoundingClientRect();
    const stripH = strip.offsetHeight;
    const viewH = window.innerHeight;

    // How far into the sticky section we've scrolled (0 → stripH - viewH)
    const scrolled = Math.max(0, -rect.top);
    const maxScroll = stripH - viewH;
    const progress = Math.min(Math.max(scrolled / maxScroll, 0), 1);

    // Translate track horizontally
    const totalShift = (PANELS - 1) * 100; // vw units
    const shift = progress * totalShift;
    track.style.transform = `translateX(-${shift}vw)`;

    // Active dot
    const activePanel = Math.round(progress * (PANELS - 1));
    dots.forEach((d, i) => d.classList.toggle('active', i === activePanel));
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

// ========================
// HERO PARALLAX ON SCROLL
// ========================
let rafTick = false;
function doParallax() {
  const sy = window.scrollY;
  const heroContent = document.querySelector('.hero-content');
  const heroPhoto = document.querySelector('.hero-photo-wrap');
  const orbs = document.querySelectorAll('.orb');

  if (heroContent) {
    const fade = Math.max(0, 1 - sy / 420);
    heroContent.style.transform = `translateY(${sy * 0.1}px)`;
    heroContent.style.opacity = fade;
  }
  if (heroPhoto && window.innerWidth > 1100) {
    heroPhoto.style.transform = `translateX(0) translateY(${sy * 0.05}px)`;
  }
  orbs.forEach((o, i) => {
    const spd = [0.07, 0.04, 0.09][i] || 0.05;
    const dir = i % 2 === 0 ? 1 : -1;
    o.style.transform = `translateY(${sy * spd * dir}px)`;
  });
  rafTick = false;
}
window.addEventListener('scroll', () => {
  if (!rafTick) { requestAnimationFrame(doParallax); rafTick = true; }
}, { passive: true });

// ========================
// 3D CARD TILT
// ========================
document.querySelectorAll('.project-card, .skill-card, .honor-card, .project-featured').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const rx = ((y - r.height / 2) / r.height) * -7;
    const ry = ((x - r.width / 2) / r.width) * 7;
    card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.5s cubic-bezier(.22,.8,.22,1)';
    card.style.transform = '';
    setTimeout(() => { card.style.transition = ''; }, 500);
  });
});

// ========================
// ACTIVE NAV HIGHLIGHT
// ========================
const sections = document.querySelectorAll('section[id]');
const navAs = document.querySelectorAll('.nav-links a');
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAs.forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href') === '#' + e.target.id) a.classList.add('active');
      });
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => secObs.observe(s));

// ========================
// SMOOTH ANCHOR SCROLL
// ========================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ========================
// CONTACT FORM
// ========================
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const msg = document.getElementById('message').value.trim();
    const subj = encodeURIComponent(`Portfolio Contact: ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${msg}`);
    window.location.href = `mailto:saharshkoli7007@gmail.com?subject=${subj}&body=${body}`;
  });
}

// ========================
// FOOTER YEAR
// ========================
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ========================
// PAGE LOAD FADE IN
// ========================
window.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.6s ease';
    document.body.style.opacity = '1';
  });
});
