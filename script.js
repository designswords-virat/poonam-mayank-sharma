// =========================================================
// POONAM MAYANK SHARMA — script.js
// Loader, custom cursor, scroll reveal, hero parallax + auto-rotate slider,
// independent parallax for full-bleed sections, animated counters,
// mobile menu, smooth anchor scroll, nav state.
// =========================================================

// ---------- Loader ----------
(function () {
  var loader = document.getElementById('loader');
  if (!loader) return;
  var hide = function () {
    loader.classList.add('is-hidden');
    document.body.classList.add('is-loaded');
  };
  // Loader runs ~2.6s of animation; hide on window.load + max-timeout fallback.
  var min = 2700, max = 3500, start = performance.now(), fired = false;
  var fire = function () {
    if (fired) return; fired = true;
    setTimeout(hide, Math.max(0, min - (performance.now() - start)));
  };
  window.addEventListener('load', fire);
  setTimeout(fire, max);
})();

// ---------- Nav scroll state ----------
(function () {
  var nav = document.getElementById('nav');
  if (!nav) return;
  var onScroll = function () {
    nav.classList.toggle('is-scrolled', window.scrollY > 80);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ---------- Cursor (desktop only) ----------
(function () {
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  var cursor = document.getElementById('cursor');
  if (!cursor) return;
  document.addEventListener('mousemove', function (e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  document.querySelectorAll('[data-cursor]').forEach(function (el) {
    el.addEventListener('mouseenter', function () { cursor.classList.add('is-hovering'); });
    el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hovering'); });
  });
})();

// ---------- Scroll reveal + child stagger ----------
(function () {
  // Set --i index on every direct child of [data-stagger] containers
  // so CSS can read it for transition-delay.
  document.querySelectorAll('[data-stagger]').forEach(function (host) {
    Array.prototype.slice.call(host.children).forEach(function (child, i) {
      child.style.setProperty('--i', i);
    });
  });

  var allFade = document.querySelectorAll('[data-fade], [data-stagger]');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    allFade.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  if (!('IntersectionObserver' in window)) {
    allFade.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  allFade.forEach(function (el) { observer.observe(el); });
})();

// ---------- Hero parallax ----------
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var bg = document.getElementById('heroSlide');
  if (!bg) return;
  var ticking = false;
  function update() {
    var y = window.scrollY;
    if (y > window.innerHeight) { ticking = false; return; }
    bg.style.transform = 'translate3d(0,' + (y * 0.28) + 'px, 0) scale(' + (1 + y * 0.0003) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
})();

// ---------- Independent vertical parallax ----------
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var lanes = [
    { sel: '.story__photo', inner: '.story__img', factor: 0.14 }
  ];
  var nodes = lanes.map(function (l) {
    var section = document.querySelector(l.sel);
    var inner = document.querySelector(l.inner);
    if (!section || !inner) return null;
    inner.style.willChange = 'transform';
    return { section: section, inner: inner, factor: l.factor };
  }).filter(Boolean);
  if (!nodes.length) return;
  var vh = window.innerHeight;
  window.addEventListener('resize', function () { vh = window.innerHeight; });
  var ticking = false;
  function update() {
    nodes.forEach(function (n) {
      var rect = n.section.getBoundingClientRect();
      if (rect.bottom < -vh || rect.top > vh * 2) return;
      var center = rect.top + rect.height / 2 - vh / 2;
      n.inner.style.transform = 'translate3d(0, ' + (-center * n.factor).toFixed(2) + 'px, 0)';
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

// ---------- Animated counters ----------
(function () {
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  if (!('IntersectionObserver' in window)) {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
    });
    return;
  }
  function tween(el, target, suffix) {
    var start = 0, dur = 1700, t0 = performance.now();
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = Math.round(start + (target - start) * eased);
      el.textContent = v + (suffix || '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      tween(el, parseInt(el.getAttribute('data-count'), 10), el.getAttribute('data-suffix') || '');
      io.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(function (el) { io.observe(el); });
})();

// ---------- Mobile hamburger ----------
(function () {
  var btn = document.getElementById('navHamburger');
  var menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  function open() {
    btn.classList.add('is-open');
    menu.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    btn.classList.remove('is-open');
    menu.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  btn.addEventListener('click', function () {
    menu.classList.contains('is-open') ? close() : open();
  });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();

// ---------- Services rail (do__rail) — prev/next + progress ----------
(function () {
  var rail = document.getElementById('doRail');
  var prev = document.getElementById('doPrev');
  var next = document.getElementById('doNext');
  var bar  = document.getElementById('doBar');
  if (!rail) return;
  var step = function () {
    var card = rail.querySelector('.do-card');
    if (!card) return 320;
    var styles = window.getComputedStyle(rail);
    var gap = parseFloat(styles.columnGap || styles.gap || 24);
    return card.getBoundingClientRect().width + gap;
  };
  if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: 'smooth' }); });
  if (next) next.addEventListener('click', function () { rail.scrollBy({ left:  step(), behavior: 'smooth' }); });
  rail.addEventListener('scroll', function () {
    if (!bar) return;
    var max = Math.max(1, rail.scrollWidth - rail.clientWidth);
    var pct = rail.scrollLeft / max;
    var width = 24;
    bar.style.left = (pct * (100 - width)) + '%';
  });
})();

// ---------- Smooth anchor scroll ----------
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
