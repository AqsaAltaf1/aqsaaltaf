(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var body = document.body;

  // Start the hero fade-in straight away (no loading screen).
  requestAnimationFrame(function () { body.classList.add("is-ready"); });

  /* ---------- Typed role ---------- */
  var typedEl = document.querySelector(".typed");
  if (typedEl) {
    var words = [];
    try { words = JSON.parse(typedEl.getAttribute("data-words")); } catch (e) {}
    if (words.length) {
      typedEl.textContent = words[0];
      if (!reduceMotion && words.length > 1) {
        var w = 0, c = words[0].length, deleting = false;
        setTimeout(function tick() {
          var word = words[w];
          c += deleting ? -1 : 1;
          typedEl.textContent = word.slice(0, c);
          var delay = deleting ? 35 : 70;
          if (!deleting && c === word.length) { deleting = true; delay = 2200; }
          else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
          setTimeout(tick, delay);
        }, 2600);
      }
    }
  }

  /* ---------- Nav, progress bar, back to top ---------- */
  var nav = document.querySelector(".nav");
  var progress = document.querySelector(".scroll-progress");
  var backTop = document.querySelector(".back-top");
  var timeline = document.querySelector(".timeline");
  var fill = document.querySelector(".timeline__fill");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    if (nav) nav.classList.toggle("is-scrolled", y > 10);
    if (backTop) backTop.classList.toggle("is-visible", y > 700);
    if (timeline && fill) {
      var r = timeline.getBoundingClientRect();
      var p = (window.innerHeight * 0.65 - r.top) / r.height;
      fill.style.transform = "scaleY(" + Math.max(0, Math.min(1, p)) + ")";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  var toggle = document.querySelector(".nav__toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = document.querySelectorAll('.nav__links a[href^="#"]');
  if (navLinks.length && "IntersectionObserver" in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("section[id]").forEach(function (s) { sectionObs.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var step = parseFloat(group.getAttribute("data-stagger")) || 0.06;
    Array.prototype.forEach.call(group.children, function (child, idx) {
      child.classList.add("reveal");
      child.style.setProperty("--d", (idx % 6) * step + "s");
    });
  });

  var revealEls = document.querySelectorAll(".reveal, [data-count], .job");
  function show(el) {
    el.classList.add("is-visible");
    if (el.hasAttribute("data-count")) countUp(el);
    setTimeout(function () { el.style.setProperty("--d", "0s"); }, 1200);
  }
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        revealObs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
      if (el.hasAttribute("data-count")) el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
    });
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var start = null, dur = 1400;
    requestAnimationFrame(function frame(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    });
  }

  /* ---------- Project filters (projects page) ---------- */
  var filters = document.querySelectorAll(".filter");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var shown = 0;
      document.querySelectorAll(".projects .project").forEach(function (p) {
        var cats = (p.getAttribute("data-cat") || "").split(" ");
        var match = f === "all" || cats.indexOf(f) !== -1;
        p.classList.toggle("is-hidden", !match);
        if (match) { p.classList.add("is-visible"); shown++; }
      });
      var count = document.querySelector("[data-result-count]");
      if (count) count.textContent = shown + (shown === 1 ? " project" : " projects");
    });
  });

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
