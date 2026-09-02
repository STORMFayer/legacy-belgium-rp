/* Legacy Belgium RP — interactions communes */
(function () {
  "use strict";

  /* ---- Menu mobile ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () { links.classList.toggle("open"); });
  }

  /* ---- Bouton retour haut ---- */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("show", window.scrollY > 700);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
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
        window.scrollTo({ top: 0, behavior: "smooth" });
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

  /* ---- Révélation au défilement ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reveals.length && "IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Année ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
