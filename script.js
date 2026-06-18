/* STARFIELD */
(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeStar() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.6,
      a: Math.random() * 0.6 + 0.2,
      spd: Math.random() * 0.07 + 0.008,
      tw: Math.random() * Math.PI * 2,
    };
  }

  function drawLines() {
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 85) {
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.strokeStyle = `rgba(79,255,207,${(1 - d / 85) * 0.055})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);
    drawLines();
    stars.forEach(s => {
      s.tw += 0.018;
      const a = s.a * (0.65 + 0.35 * Math.sin(s.tw));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,200,230,${a})`;
      ctx.fill();
      s.y -= s.spd;
      if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; }
    });
  }

  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 300; i++) stars.push(makeStar());
  loop();
})();

/* LIVE CLOCK (Colombo time) */
function tickClock() {
  const now = new Date();
  const cmb = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
  const pad = n => String(n).padStart(2, '0');
  const el = document.getElementById('clk');
  if (el) el.textContent = `${pad(cmb.getHours())}:${pad(cmb.getMinutes())}:${pad(cmb.getSeconds())}`;
}
tickClock();
setInterval(tickClock, 1000);

/* ACTIVE NAV LINK ON SCROLL */
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = document.querySelectorAll('section[id], div[id]');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

/* SCROLL REVEAL */

// Generic elements — class-based so CSS hover transforms aren't overridden by inline styles
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); });
}, { threshold: 0.07 });

document.querySelectorAll('.si, .contact-row, .stack-row').forEach(el => {
  el.classList.add('reveal-el');
  revealObserver.observe(el);
});

// Project cards staggered bounce-in on scroll into view
const cardObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('card-revealed'); });
}, { threshold: 0.08 });

document.querySelectorAll('.proj-card').forEach((el, i) => {
  el.style.transitionDelay = `${i * 60}ms`;
  cardObserver.observe(el);
});

// Education entries slide in from sides as user scroll
const eduObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('edu-revealed'); });
}, { threshold: 0.15 });

document.querySelectorAll('.edu-entry').forEach((el, i) => {
  el.style.transitionDelay = `${i * 120}ms`;
  eduObserver.observe(el);
});

// Timeline line grows downward as section enters view
const timelineObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('timeline-active'); });
}, { threshold: 0.05 });

const timeline = document.querySelector('.edu-timeline');
if (timeline) timelineObserver.observe(timeline);

/*  PROJECT CAROUSEL */
(function () {
  const carousel   = document.getElementById('projCarousel');
  const dotsWrap   = document.getElementById('projDots');
  const prevBtn    = document.getElementById('projPrev');
  const nextBtn    = document.getElementById('projNext');
  if (!carousel) return;

  const cards      = Array.from(carousel.querySelectorAll('.proj-card'));
  const total      = cards.length;
  // Show 3 at a time on desktop, 1 on mobile
  let perPage      = window.innerWidth < 900 ? 1 : 3;
  let current      = 0;

  function maxIndex() { return Math.max(0, total - perPage); }

  // Build dots for one per page of projects
  function buildDots() {
    dotsWrap.innerHTML = '';
    const pages = maxIndex() + 1;
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('button');
      d.className = 'proj-dot' + (i === current ? ' active' : '');
      d.setAttribute('aria-label', `Go to slide ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.proj-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function getCardWidth() {
    return cards[0].getBoundingClientRect().width + 20;
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    carousel.style.transform = `translateX(-${current * getCardWidth()}px)`;
    updateDots();
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === maxIndex();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch / drag swipe
  let startX = 0, dragging = false;
  carousel.addEventListener('pointerdown', e => { startX = e.clientX; dragging = true; });
  carousel.addEventListener('pointermove', e => { if (!dragging) return; });
  carousel.addEventListener('pointerup', e => {
    if (!dragging) return;
    dragging = false;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  });

  // Responsive resize
  window.addEventListener('resize', () => {
    const newPer = window.innerWidth < 900 ? 1 : 3;
    if (newPer !== perPage) {
      perPage = newPer;
      current = 0;
      buildDots();
    }
    goTo(current);
  });

  buildDots();
  goTo(0);
})();


document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});