// ============================================================
// LOADER
// ============================================================
window.addEventListener('load', () => {
  document.getElementById('loaderBar').style.width = '100%';
  setTimeout(() => {
    document.getElementById('loader').classList.add('hide');
  }, 2000);
});

// ============================================================
// PROGRESS BAR
// ============================================================
const progress = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const s = window.scrollY;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (s / h * 100) + '%';
}, { passive: true });

// ============================================================
// NAV SCROLL
// ============================================================
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ============================================================
// SCROLL REVEAL
// ============================================================
const revEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .feature-item');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });
  revEls.forEach(el => revealObserver.observe(el));
}

// ============================================================
// PARALLAX
// ============================================================
const parEls = document.querySelectorAll('.parallax');
let tick = false;
window.addEventListener('scroll', () => {
  if (!tick) {
    window.requestAnimationFrame(() => {
      parEls.forEach(el => {
        const sp = parseFloat(el.dataset.speed) || 0.05;
        const r = el.getBoundingClientRect();
        el.style.transform = `translateY(${(r.top + r.height / 2 - window.innerHeight / 2) * sp}px)`;
      });
      tick = false;
    });
    tick = true;
  }
}, { passive: true });

// ============================================================
// MASONRY FILTER
// ============================================================
const filterBtns = document.querySelectorAll('.filter-btn');
const masonryItems = document.querySelectorAll('.masonry-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    masonryItems.forEach(item => {
      if (filter === 'all' || item.dataset.cat === filter) {
        item.style.display = 'block';
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, 10);
      } else {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => { item.style.display = 'none'; }, 500);
      }
    });
  });
});

// ============================================================
// STATS ANIMATION — PERBAIKAN: format angka besar + durasi tetap
// ============================================================
const stats = document.querySelectorAll('.stat-num');
if ('IntersectionObserver' in window) {
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const duration = 1800; // ms
        const startTime = performance.now();

        const formatNum = (n) => {
          if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
          if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
          return Math.ceil(n).toLocaleString();
        };

        const updateCount = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * target;

          el.innerText = formatNum(current);

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            el.innerText = formatNum(target);
          }
        };

        requestAnimationFrame(updateCount);
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  stats.forEach(stat => statObserver.observe(stat));
}

// ============================================================
// DRIFT TRACK — Drag support (mouse & touch)
// ============================================================
const driftTrack = document.getElementById('driftTrack');
if (driftTrack) {
  let isDown = false;
  let startX;
  let scrollLeft;

  driftTrack.addEventListener('mousedown', (e) => {
    isDown = true;
    driftTrack.style.animationPlayState = 'paused';
    startX = e.pageX - driftTrack.offsetLeft;
    scrollLeft = driftTrack.scrollLeft;
  });

  driftTrack.addEventListener('mouseleave', () => { isDown = false; });
  driftTrack.addEventListener('mouseup', () => { isDown = false; });
  driftTrack.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - driftTrack.offsetLeft;
    const walk = (x - startX) * 2;
    driftTrack.scrollLeft = scrollLeft - walk;
  });
}

// ============================================================
// LIGHTBOX — PERBAIKAN: querySelector yang benar untuk img
// ============================================================
const lb = document.getElementById('lightbox');
const lbImgWrap = document.getElementById('lbImgWrap');
const lbCaption = document.getElementById('lbCaption');
const lbClose = document.getElementById('lbClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');

let currentLbIndex = 0;
// Ambil semua elemen yang punya onclick openLightbox sebelum dihapus
const allLbTriggers = document.querySelectorAll('[onclick^="openLightbox"]');

allLbTriggers.forEach((trigger, index) => {
  trigger.removeAttribute('onclick');
  trigger.addEventListener('click', function (e) {
    e.preventDefault();

    // PERBAIKAN: querySelector yang benar — cari tag img langsung
    const imgEl = this.querySelector('img');
    // Cari caption dari berbagai kemungkinan elemen
    const captionEl = this.querySelector(
      '.drift-caption, .masonry-name, .card-name, .cinematic-title, .cinematic-label'
    );
    const captionText = captionEl ? captionEl.innerText : 'ArtIn™ Collection';

    if (imgEl) {
      lbImgWrap.innerHTML = '';
      const clone = document.createElement('img');
      clone.src = imgEl.src;
      clone.alt = imgEl.alt || captionText;
      lbImgWrap.appendChild(clone);
    }

    lbCaption.innerText = captionText;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
    currentLbIndex = index;
  });
});

const closeLightbox = () => {
  lb.classList.remove('active');
  document.body.style.overflow = '';
};

lbClose.addEventListener('click', closeLightbox);
lb.addEventListener('click', (e) => {
  if (e.target === lb) closeLightbox();
});

lbPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  currentLbIndex = (currentLbIndex - 1 + allLbTriggers.length) % allLbTriggers.length;
  allLbTriggers[currentLbIndex].click();
});

lbNext.addEventListener('click', (e) => {
  e.stopPropagation();
  currentLbIndex = (currentLbIndex + 1) % allLbTriggers.length;
  allLbTriggers[currentLbIndex].click();
});

document.addEventListener('keydown', (e) => {
  if (!lb.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lbPrev.click();
  if (e.key === 'ArrowRight') lbNext.click();
});

// ============================================================
// HERO CANVAS PARTICLES
// ============================================================
const canvas = document.getElementById('heroCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.1,
      vx: (Math.random() - 0.5) * 0.3
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(196, 168, 130, 0.4)';
    ctx.beginPath();
    particles.forEach(p => {
      ctx.moveTo(p.x, p.y);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
      p.y += p.vy;
      p.x += p.vx;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
    });
    ctx.fill();
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

// ============================================================
// VIDEO BUTTON
// ============================================================
const playBtn = document.getElementById('videoPlayBtn');
if (playBtn) {
  playBtn.addEventListener('click', () => {
    alert('▶ Play Brand Film: The Art of Silence\n(Conceptual Video Placeholder)');
  });
}