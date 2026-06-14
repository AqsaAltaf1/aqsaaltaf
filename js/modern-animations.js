(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function initScrollReveal() {
    var targets = document.querySelectorAll(
      "#skills-section .col-lg-3.mb-4, " +
        "#services-section .services, " +
        "#projects-section .project, " +
        "#section-counter .counter-wrap, " +
        "#about-section .img-about, " +
        "#about-section .heading-section, " +
        "#contact-section .contact-info-side, " +
        "#contact-section .contact-form"
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

  function initSkillCircles() {
    var circles = document.querySelectorAll("#skills-section .progress");
    if (!circles.length) return;

    function animateCircle(circle) {
      if (circle.classList.contains("is-animated")) return;
      circle.classList.add("is-animated");

      var value = parseInt(circle.getAttribute("data-value"), 10) || 0;
      var left = circle.querySelector(".progress-left .progress-bar");
      var right = circle.querySelector(".progress-right .progress-bar");
      if (!left || !right) return;

      function toDegrees(pct) {
        return (pct / 100) * 360;
      }

      setTimeout(function () {
        if (value <= 50) {
          right.style.transform = "rotate(" + toDegrees(value) + "deg)";
        } else {
          right.style.transform = "rotate(180deg)";
          left.style.transform = "rotate(" + toDegrees(value - 50) + "deg)";
        }
      }, 150);
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCircle(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    circles.forEach(function (circle) {
      observer.observe(circle);
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
    initSkillCircles();
    initHeroEntrance();
    initSmoothSectionObserver();
  }
})();
