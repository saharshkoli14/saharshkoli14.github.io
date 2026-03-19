'use strict';

/* ══════════════════════════════════════
   SCROLL PROGRESS BAR
   ══════════════════════════════════════ */
const scrollBar = document.getElementById('scrollBar');
function updateScrollBar() {
  const max = document.body.scrollHeight - window.innerHeight;
  if (scrollBar && max > 0) scrollBar.style.width = (window.scrollY / max * 100) + '%';
}
window.addEventListener('scroll', updateScrollBar, { passive: true });

/* ══════════════════════════════════════
   NAVBAR
   ══════════════════════════════════════ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ══════════════════════════════════════
   MOBILE NAV
   ══════════════════════════════════════ */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );
}

/* ══════════════════════════════════════
   CURSOR GLOW
   ══════════════════════════════════════ */
const cursorEl = document.getElementById('cursorGlow');
let mx = 0, my = 0, gx = 0, gy = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
(function tickCursor() {
  gx += (mx - gx) * 0.07;
  gy += (my - gy) * 0.07;
  if (cursorEl) { cursorEl.style.left = gx + 'px'; cursorEl.style.top = gy + 'px'; }
  requestAnimationFrame(tickCursor);
})();

/* ══════════════════════════════════════
   PARTICLE CANVAS
   ══════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];
  const N = window.innerWidth < 768 ? 40 : 80;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }

  function Pt() { this.reset(); }
  Pt.prototype.reset = function () {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.r  = Math.random() * 1.4 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.28;
    this.vy = (Math.random() - 0.5) * 0.28;
    this.a  = Math.random() * 0.4 + 0.08;
    this.c  = Math.random() > 0.5 ? '108,79,255' : '0,212,255';
  };

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      pts[i].x += pts[i].vx;
      pts[i].y += pts[i].vy;
      if (pts[i].x < -10 || pts[i].x > W + 10 || pts[i].y < -10 || pts[i].y > H + 10) pts[i].reset();
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(108,79,255,${(1 - d / 130) * 0.09})`;
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

/* ══════════════════════════════════════
   LIGHTBOX — profile photo click
   ══════════════════════════════════════ */
(function initLightbox() {
  const img       = document.getElementById('profileImg');
  const lb        = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightboxImg');
  const lbClose   = document.getElementById('lightboxClose');
  const lbBg      = document.getElementById('lightboxBg');

  if (!img || !lb || !lbImg) return;   // bail if elements missing

  function open() {
    lbImg.src = img.src;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  img.addEventListener('click', open);
  if (lbClose) lbClose.addEventListener('click', close);
  if (lbBg)    lbBg.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
})();

/* ══════════════════════════════════════
   SCROLL REVEAL
   ══════════════════════════════════════ */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal-up, .reveal-right').forEach(el => revObs.observe(el));

/* ══════════════════════════════════════
   ANIMATED COUNTERS
   ══════════════════════════════════════ */
function animCount(el, target, dur) {
  dur = dur || 1800;
  let start = null;
  (function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(step);
  })(performance.now());
}
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const t = parseInt(e.target.dataset.target, 10);
      if (!isNaN(t)) animCount(e.target, t);
      cntObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => cntObs.observe(el));

/* ══════════════════════════════════════════════════
   CINEMATIC HORIZONTAL SCROLL  (GTA6-style)

   How it works:
   • The section is 500vh tall
   • Inside is a sticky container (height:100vh)
   • The track holds 4 panels side-by-side (width:400vw)
   • As user scrolls through the 500vh section,
     we map scroll progress (0→1) to translateX(0 → -300vw)
     so each panel slides in from the right as you scroll
   ══════════════════════════════════════════════════ */
(function initCinema() {
  const section = document.getElementById('about');   // cinema section
  const track   = document.getElementById('cinemaTrack');
  const dots    = document.querySelectorAll('.cp-dot');
  const counter = document.getElementById('cpCounter');

  if (!section || !track) return;

  const PANELS = 4;

  function update() {
    const rect    = section.getBoundingClientRect();
    const sectionH = section.offsetHeight;
    const viewH   = window.innerHeight;

    // How far the sticky container has "scrolled past" = top gone negative
    const scrolled = Math.max(0, -rect.top);
    // Total scrollable amount within the section
    const maxScroll = sectionH - viewH;
    // Normalised 0 → 1
    const progress = maxScroll > 0 ? Math.min(scrolled / maxScroll, 1) : 0;

    // Translate: 0 = first panel, 1 = last panel
    const shiftVw = progress * (PANELS - 1) * 100;
    track.style.transform = `translateX(-${shiftVw}vw)`;

    // Which panel is "active"
    const active = Math.round(progress * (PANELS - 1));
    dots.forEach((d, i) => d.classList.toggle('active', i === active));
    if (counter) counter.textContent = (active + 1) + ' / ' + PANELS;
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();

  // Dot click → scroll to that panel's position
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx     = parseInt(dot.dataset.panel, 10);
      const sectionH = section.offsetHeight;
      const viewH   = window.innerHeight;
      const frac    = idx / (PANELS - 1);
      const targetScroll = section.offsetTop + frac * (sectionH - viewH);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    });
  });
})();

/* ══════════════════════════════════════
   HERO PARALLAX
   ══════════════════════════════════════ */
let rafPending = false;
function runParallax() {
  const sy = window.scrollY;
  const hl = document.querySelector('.hero-left');
  const hr = document.querySelector('.hero-right');
  const orbs = document.querySelectorAll('.orb');

  if (hl && sy < window.innerHeight * 1.5) {
    const fade = Math.max(0, 1 - sy / 500);
    hl.style.transform = `translateY(${sy * 0.08}px)`;
    hl.style.opacity   = fade;
  }
  if (hr && window.innerWidth > 1080 && sy < window.innerHeight) {
    hr.style.transform = `translateX(0) translateY(${sy * 0.04}px)`;
  }
  orbs.forEach((o, i) => {
    const spd = [0.06, 0.035, 0.08][i] || 0.05;
    const dir = i % 2 === 0 ? 1 : -1;
    o.style.transform = `translateY(${sy * spd * dir}px)`;
  });
  rafPending = false;
}
window.addEventListener('scroll', () => {
  if (!rafPending) { requestAnimationFrame(runParallax); rafPending = true; }
}, { passive: true });

/* ══════════════════════════════════════
   3D CARD TILT ON HOVER
   ══════════════════════════════════════ */
function initTilt(sel) {
  document.querySelectorAll(sel).forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top  - r.height / 2) / r.height) * -6;
      const ry = ((e.clientX - r.left - r.width  / 2) / r.width)  *  6;
      card.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(.22,.8,.22,1)';
      card.style.transform  = '';
      setTimeout(() => { card.style.transition = ''; }, 520);
    });
  });
}
initTilt('.proj-card, .skill-card, .honor-card, .proj-feat');

/* ══════════════════════════════════════
   ACTIVE NAV LINK
   ══════════════════════════════════════ */
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href') === '#' + e.target.id) a.classList.add('active');
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('section[id]').forEach(s => secObs.observe(s));

/* ══════════════════════════════════════
   SMOOTH ANCHOR SCROLL
   ══════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ══════════════════════════════════════
   CONTACT FORM
   ══════════════════════════════════════ */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const msg   = document.getElementById('message').value.trim();
    const subj  = encodeURIComponent('Portfolio Contact: ' + name);
    const body  = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + msg);
    window.location.href = 'mailto:saharshkoli7007@gmail.com?subject=' + subj + '&body=' + body;
  });
}

/* ══════════════════════════════════════
   FOOTER YEAR
   ══════════════════════════════════════ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ══════════════════════════════════════
   PAGE LOAD FADE-IN
   ══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.55s ease';
    document.body.style.opacity    = '1';
  });
});
