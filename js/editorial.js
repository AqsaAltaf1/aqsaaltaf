/* Aqsa Altaf — Editorial Bold interactions (vanilla, no dependencies) */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme toggle (remembers choice) ---------- */
  var themeBtn = document.querySelector(".theme-btn");
  function systemDark() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") ||
      (systemDark() ? "dark" : "light");
  }
  function paintThemeBtn() {
    if (themeBtn) themeBtn.textContent = currentTheme() === "dark" ? "☀" : "☾";
  }
  try {
    var saved = localStorage.getItem("aa-theme");
    if (saved === "dark" || saved === "light") {
      document.documentElement.setAttribute("data-theme", saved);
    }
  } catch (e) {}
  paintThemeBtn();
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("aa-theme", next); } catch (e) {}
      paintThemeBtn();
    });
  }

  /* ---------- mobile nav ---------- */
  var burger = document.querySelector(".burger");
  var mnav = document.querySelector(".mobile-nav");
  function closeNav() {
    if (burger) burger.classList.remove("is-open");
    if (mnav) mnav.classList.remove("is-open");
  }
  if (burger && mnav) {
    burger.addEventListener("click", function () {
      burger.classList.toggle("is-open");
      mnav.classList.toggle("is-open");
    });
    mnav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var delay = parseFloat(el.getAttribute("data-delay") || "0");
        setTimeout(function () { el.classList.add("is-in"); }, delay * 1000);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduced) { el.textContent = target + suffix; return; }
    var dur = 1400, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        runCount(en.target);
        cio.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCount);
  }

  /* ---------- active nav link on scroll ---------- */
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.nav a[href^="#"]')
  );
  var targets = links
    .map(function (a) {
      var id = a.getAttribute("href");
      if (!id || id === "#") return null;
      var sec = document.querySelector(id);
      return sec ? { link: a, sec: sec } : null;
    })
    .filter(Boolean);

  /* ---------- scroll progress + to-top + nav state ---------- */
  var bar = document.querySelector(".progress");
  var toTop = document.querySelector(".to-top");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var h = document.documentElement.scrollHeight - window.innerHeight;

    if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    if (toTop) toTop.classList.toggle("is-on", y > 700);

    var mid = y + window.innerHeight * 0.3;
    var active = null;
    targets.forEach(function (t) {
      if (t.sec.offsetTop <= mid) active = t;
    });
    links.forEach(function (a) { a.classList.remove("is-active"); });
    if (active) active.link.classList.add("is-active");

    ticking = false;
  }
  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(onScroll);
    },
    { passive: true }
  );
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------- floating project preview (desktop pointer only) ---------- */
  var peek = document.querySelector(".hover-peek");
  var fine = window.matchMedia("(min-width: 1024px) and (hover: hover)").matches;
  if (peek && fine) {
    var rows = document.querySelectorAll(".work__row[data-peek]");
    var px = 0, py = 0, shown = false;

    rows.forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        peek.style.backgroundImage = "url('" + row.getAttribute("data-peek") + "')";
        peek.classList.add("is-on");
        shown = true;
      });
      row.addEventListener("mouseleave", function () {
        peek.classList.remove("is-on");
        shown = false;
      });
    });

    window.addEventListener(
      "mousemove",
      function (e) {
        px = e.clientX;
        py = e.clientY;
        if (shown) {
          peek.style.transform =
            "translate(" + px + "px," + py + "px) translate(-50%,-50%) scale(1)";
        }
      },
      { passive: true }
    );
  }

  /* ---------- footer year ---------- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
