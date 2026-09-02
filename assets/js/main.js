/* Legacy Belgium RP — interactions & animations */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  var onScroll = function () {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var ratio = max > 0 ? h.scrollTop / max : 0;
    progress.style.width = (ratio * 100).toFixed(2) + "%";
    if (toTop) toTop.classList.toggle("show", h.scrollTop > 700);
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
  if (reduce) return;

  /* --- Révélation au défilement, en cascade par groupe --- */
  var revealSelector = ".cell, .plan, .connect-row, .keys, .cmds, .table-tools, " +
    ".table-wrap, .doc-body > h2, .doc-body > h3, .fine-print, .note, .section-head, " +
    ".hero-meta";
  var groups = {};
  Array.prototype.slice.call(document.querySelectorAll(revealSelector)).forEach(function (el) {
    if (el.closest(".hero")) return;
    el.classList.add("reveal");
    var key = el.parentNode;
    groups.list = groups.list || [];
    var g = groups.list.filter(function (x) { return x.parent === key; })[0];
    if (!g) { g = { parent: key, items: [] }; groups.list.push(g); }
    g.items.push(el);
  });
  (groups.list || []).forEach(function (g) {
    g.items.forEach(function (el, i) { el.style.setProperty("--i", i % 8); });
  });

  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* --- Cascade des lignes (touches / commandes / tableau) --- */
  var cascade = function (container, sel, max) {
    var items = Array.prototype.slice.call(container.querySelectorAll(sel)).slice(0, max || 999);
    items.forEach(function (it, i) { it.classList.add("row-anim"); it.style.setProperty("--i", i); });
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (it) { it.classList.add("in"); });
      return;
    }
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); co.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -5% 0px" });
    items.forEach(function (it) { co.observe(it); });
  };
  Array.prototype.slice.call(document.querySelectorAll(".keys")).forEach(function (k) {
    cascade(k, ".key-row");
  });
  Array.prototype.slice.call(document.querySelectorAll(".cmds")).forEach(function (c) {
    cascade(c, ".cmd");
  });

  /* --- Compteurs (montants des packs VIP) --- */
  var fmt = function (n) { return n.toLocaleString("fr-FR").replace(/ | /g, " "); };
  var countUp = function (el) {
    var raw = el.getAttribute("data-amount");
    var target = parseInt(raw, 10);
    if (!target) return;
    var start = performance.now(), dur = 1100;
    var tick = function (now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased)) + " €";
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  var amounts = Array.prototype.slice.call(document.querySelectorAll("[data-amount]"));
  if (amounts.length && "IntersectionObserver" in window) {
    var ao = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); ao.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    amounts.forEach(function (el) { el.textContent = "0 €"; ao.observe(el); });
  }

  /* --- Parallaxe légère de l'emblème (souris, desktop) --- */
  var emblem = document.querySelector(".hero-emblem img");
  if (emblem && window.matchMedia("(min-width: 900px) and (pointer: fine)").matches) {
    var hero = document.querySelector(".hero");
    hero.addEventListener("mousemove", function (ev) {
      var r = hero.getBoundingClientRect();
      var dx = (ev.clientX - r.left - r.width / 2) / r.width;
      var dy = (ev.clientY - r.top - r.height / 2) / r.height;
      emblem.style.transform = "translate(" + (dx * 14).toFixed(1) + "px," + (dy * 14).toFixed(1) + "px)";
    });
    hero.addEventListener("mouseleave", function () { emblem.style.transform = ""; });
  }
})();
