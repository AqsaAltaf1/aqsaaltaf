(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function initScrollReveal() {
    var targets = document.querySelectorAll(
      "#skills-section .skill-category, " +
        "#services-section .services-carousel, " +
        "#why-me-section .why-me-card, " +
        "#projects-section .project-card, " +
        "#testimonials-section .testimony-wrap, " +
        "#section-counter .counter-wrap, " +
        "#about-section .img-about, " +
        "#about-section .heading-section, " +
        "#contact-section .contact-info-side, " +
        "#contact-section .contact-visual"
    );

    targets.forEach(function (el, i) {
      el.classList.add("reveal-on-scroll");
      el.style.transitionDelay = (i % 4) * 0.08 + "s";
    });

    document.querySelectorAll(".heading-section").forEach(function (el) {
      el.classList.add("reveal-fade");
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document
      .querySelectorAll(".reveal-on-scroll, .reveal-fade, .reveal-scale, .heading-section")
      .forEach(function (el) {
        observer.observe(el);
      });
  }

  function initHeroEntrance() {
    function playEntrance(slide) {
      if (!slide) return;
      var textBlock = slide.querySelector(".one-forth");
      if (!textBlock) return;
      textBlock.classList.remove("hero-entrance");
      void textBlock.offsetWidth;
      textBlock.classList.add("hero-entrance");
    }

    playEntrance(document.querySelector(".home-slider .slider-item"));

    if (window.jQuery && jQuery.fn.owlCarousel) {
      jQuery(".home-slider").on("translated.owl.carousel", function () {
        var active = document.querySelector(".home-slider .owl-item.active .slider-item");
        playEntrance(active);
      });
    }
  }

  function initSmoothSectionObserver() {
    var sections = document.querySelectorAll("section[id]");
    var navLinks = document.querySelectorAll('#ftco-nav a[href^="#"]');

    if (!sections.length || !navLinks.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navLinks.forEach(function (link) {
              link.parentElement.classList.toggle(
                "nav-active",
                link.getAttribute("href") === "#" + id
              );
            });
          }
        });
      },
      { threshold: 0.35, rootMargin: "-80px 0px -55% 0px" }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }

  function onReady() {
    initScrollReveal();
    initHeroEntrance();
    initSmoothSectionObserver();
  }
})();
