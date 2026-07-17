/* ============================================================
   Caribbean Supply — shared behavior
   ============================================================ */
(function () {
  "use strict";

  /* --- Mobile nav toggle --- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { links.classList.remove("open"); });
    });
  }

  /* --- Scroll reveal --- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* --- Animated counters --- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var dur = parseInt(el.getAttribute("data-dur") || "1600", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = prefix + val.toLocaleString("fr-FR", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + target.toLocaleString("fr-FR", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
    }
    requestAnimationFrame(frame);
  }
  function initCounters() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(animateCount); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* --- Footer year --- */
  function initYear() {
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* --- Header shadow on scroll --- */
  function initHeaderScroll() {
    var h = document.querySelector(".site-header");
    if (!h) return;
    var onScroll = function () {
      if (window.scrollY > 8) h.style.boxShadow = "0 6px 24px rgba(15,35,75,.07)";
      else h.style.boxShadow = "none";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }
  ready(function () {
    initNav();
    initReveal();
    initCounters();
    initYear();
    initHeaderScroll();
  });

  /* expose for pages that need it */
  window.CS = { animateCount: animateCount };
})();
