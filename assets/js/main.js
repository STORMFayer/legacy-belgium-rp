/* Legacy Belgium RP — interactions & animations */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = "IntersectionObserver" in window;

  /* ---- Menu mobile ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () { links.classList.toggle("open"); });
  }

  /* ---- Barre de progression + bouton retour haut ---- */
  var progress = document.createElement("div");
  progress.className = "progress";
  document.body.appendChild(progress);
  var toTop = document.querySelector(".to-top");
  var doc = document.documentElement;

  var onScroll = function () {
    var max = doc.scrollHeight - doc.clientHeight;
    var ratio = max > 0 ? doc.scrollTop / max : 0;
    progress.style.width = (ratio * 100).toFixed(2) + "%";
    if (toTop) toTop.classList.toggle("show", doc.scrollTop > 700);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ---- Sommaire repliable (mobile) ---- */
  var tocToggle = document.querySelector(".toc-toggle");
  var toc = document.querySelector(".toc");
  if (tocToggle && toc) {
    tocToggle.addEventListener("click", function () { toc.classList.toggle("open"); });
  }

  /* ---- Scrollspy du sommaire ---- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
  if (tocLinks.length) {
    var targets = tocLinks
      .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
      .filter(Boolean);
    var spy = function () {
      var pos = window.scrollY + 130;
      var current = targets[0];
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].offsetTop <= pos) current = targets[i];
      }
      tocLinks.forEach(function (a) {
        a.classList.toggle("active", current && a.getAttribute("href") === "#" + current.id);
      });
    };
    window.addEventListener("scroll", spy, { passive: true });
    spy();
  }

  /* ---- Onglets ---- */
  var tabButtons = Array.prototype.slice.call(document.querySelectorAll(".tabs button[data-tab]"));
  if (tabButtons.length) {
    tabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-tab");
        tabButtons.forEach(function (b) { b.classList.toggle("active", b === btn); });
        document.querySelectorAll(".tab-panel").forEach(function (p) {
          p.classList.toggle("active", p.id === id);
        });
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      });
    });
  }

  /* ---- Filtre du tableau des amendes ---- */
  var search = document.getElementById("fine-search");
  var catFilter = document.getElementById("fine-cat");
  var table = document.getElementById("fines-table");
  var countEl = document.getElementById("fine-count");
  if (search && table) {
    var rows = Array.prototype.slice.call(table.querySelectorAll("tbody tr"));
    var applyFilter = function () {
      var q = search.value.trim().toLowerCase();
      var cat = catFilter ? catFilter.value : "all";
      var visible = 0;
      rows.forEach(function (row) {
        if (row.classList.contains("cat-row")) {
          row.style.display = (cat === "all" && !q) ? "" : "none";
          return;
        }
        var matchText = !q || row.textContent.toLowerCase().indexOf(q) !== -1;
        var matchCat = cat === "all" || (row.getAttribute("data-cat") || "") === cat;
        var show = matchText && matchCat;
        row.style.display = show ? "" : "none";
        if (show) visible++;
      });
      if (countEl) countEl.textContent = visible + " résultat" + (visible > 1 ? "s" : "");
    };
    search.addEventListener("input", applyFilter);
    if (catFilter) catFilter.addEventListener("change", applyFilter);
    applyFilter();
  }

  /* ---- Année ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* =====================================================================
     ANIMATIONS
     ===================================================================== */

  /* --- Révélation au défilement, en cascade par groupe --- */
  var revealSelector = ".cell, .plan, .connect-row, .keys, .cmds, " +
    ".doc-body > h2, .doc-body > h3, .fine-print, .note, .section-head, " +
    ".hero-meta, .stat, .site-footer .footer-inner";
  var seen = [];
  Array.prototype.slice.call(document.querySelectorAll(revealSelector)).forEach(function (el) {
    if (el.closest(".hero")) return;
    el.classList.add("reveal");
    var parent = el.parentNode;
    var rec = null;
    for (var i = 0; i < seen.length; i++) if (seen[i].p === parent) rec = seen[i];
    if (!rec) { rec = { p: parent, items: [] }; seen.push(rec); }
    rec.items.push(el);
  });
  seen.forEach(function (rec) {
    rec.items.forEach(function (el, i) {
      el.style.setProperty("--i", i % 8);
      if (el.matches(".doc-body > h2, .doc-body > h3, .note, .fine-print")) {
        el.setAttribute("data-dir", "left");
      }
    });
  });

  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (io) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { ro.observe(el); });

    /* Filet de sécurité : rien ne doit rester masqué une fois passé à l'écran */
    var failsafe = function () {
      var vh = window.innerHeight;
      for (var i = revealEls.length - 1; i >= 0; i--) {
        var el = revealEls[i];
        if (el.classList.contains("in")) { revealEls.splice(i, 1); continue; }
        if (el.getBoundingClientRect().top < vh * 0.96) {
          el.classList.add("in");
          if (ro) ro.unobserve(el);
          revealEls.splice(i, 1);
        }
      }
    };
    window.addEventListener("scroll", failsafe, { passive: true });
    window.addEventListener("resize", failsafe, { passive: true });
    failsafe();
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* --- Cascade des lignes (touches / commandes / tableau) --- */
  var cascade = function (container, sel, cap) {
    var items = Array.prototype.slice.call(container.querySelectorAll(sel)).slice(0, cap || 9999);
    items.forEach(function (it, i) {
      it.classList.add("row-anim");
      it.style.setProperty("--i", Math.min(i, 40));
    });
    if (!io) { items.forEach(function (it) { it.classList.add("in"); }); return; }
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); co.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -4% 0px" });
    items.forEach(function (it) { co.observe(it); });
    var fs = function () {
      var vh = window.innerHeight;
      for (var i = items.length - 1; i >= 0; i--) {
        var el = items[i];
        if (el.classList.contains("in")) { items.splice(i, 1); continue; }
        if (el.getBoundingClientRect().top < vh * 0.98) {
          el.classList.add("in"); co.unobserve(el); items.splice(i, 1);
        }
      }
      if (!items.length) window.removeEventListener("scroll", fs);
    };
    window.addEventListener("scroll", fs, { passive: true });
    fs();
  };
  Array.prototype.slice.call(document.querySelectorAll(".keys")).forEach(function (k) { cascade(k, ".key-row"); });
  Array.prototype.slice.call(document.querySelectorAll(".cmds")).forEach(function (c) { cascade(c, ".cmd"); });

  /* --- Compteurs (chiffres du serveur + montants VIP) --- */
  var fmt = function (n) { return n.toLocaleString("fr-FR"); };
  var countTo = function (el, target, suffix, money) {
    var start = performance.now(), dur = 1300;
    var step = function (now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = fmt(val) + (money ? " €" : (suffix || ""));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count], [data-amount]"));
  if (counters.length && io) {
    var co2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
         co2.unobserve(el);
        if (reduce) return;
        if (el.hasAttribute("data-amount")) {
          countTo(el, parseInt(el.getAttribute("data-amount"), 10), null, true);
        } else {
          countTo(el, parseInt(el.getAttribute("data-count"), 10), el.getAttribute("data-suffix") || "");
        }
      });
    }, { threshold: 0.55 });
    counters.forEach(function (el) {
      if (!reduce) {
        if (el.hasAttribute("data-amount")) el.textContent = "0 €";
        else el.textContent = "0" + (el.getAttribute("data-suffix") || "");
      }
       co2.observe(el);
    });
  }

  if (reduce) return;

  /* --- Parallaxe de l'emblème (souris, desktop) --- */
  var emblem = document.querySelector(".hero-emblem img");
  var hero = document.querySelector(".hero");
  if (emblem && hero && window.matchMedia("(min-width: 900px) and (pointer: fine)").matches) {
    hero.addEventListener("mousemove", function (ev) {
      var r = hero.getBoundingClientRect();
      var dx = (ev.clientX - r.left - r.width / 2) / r.width;
      var dy = (ev.clientY - r.top - r.height / 2) / r.height;
      emblem.style.transform = "translate(" + (dx * 16).toFixed(1) + "px," + (dy * 16).toFixed(1) + "px)";
    });
    hero.addEventListener("mouseleave", function () { emblem.style.transform = ""; });
  }

  /* --- Parallaxe au défilement (contenu du hero + sceaux) --- */
  var heroText = document.querySelector(".hero-inner > div:first-child");
  var seals = Array.prototype.slice.call(document.querySelectorAll(".doc-head .seal"));
  var raf = null;
  var parallax = function () {
    raf = null;
    var sy = window.scrollY;
    if (heroText && sy < 900) heroText.style.transform = "translateY(" + (sy * 0.12).toFixed(1) + "px)";
    seals.forEach(function (s) { s.style.transform = "translateY(-50%) rotate(" + (sy * 0.03).toFixed(1) + "deg)"; });
  };
  window.addEventListener("scroll", function () {
    if (!raf) raf = requestAnimationFrame(parallax);
  }, { passive: true });
  parallax();
})();
