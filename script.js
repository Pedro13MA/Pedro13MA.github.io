/**
 * Spotter Landing — lightweight interactions only.
 * No backend, no tracking, no dependencies.
 */

(function () {
  "use strict";

  // Mobile nav toggle
  const toggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      const open = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Hero fade-in on load
  var fadeEls = document.querySelectorAll(".fade-in");
  if (fadeEls.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    requestAnimationFrame(function () {
      fadeEls.forEach(function (el) {
        el.classList.add("visible");
      });
    });
  } else {
    fadeEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  // Header shadow on scroll
  var header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener(
      "scroll",
      function () {
        header.style.boxShadow = window.scrollY > 8 ? "0 4px 24px rgba(0,0,0,0.4)" : "none";
      },
      { passive: true }
    );
  }
})();
