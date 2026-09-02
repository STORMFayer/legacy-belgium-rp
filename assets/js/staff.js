/* Legacy Belgium RP — Espace staff (OAuth Discord implicite, 100 % client) */
(function () {
  "use strict";

  var CFG = window.STAFF_CONFIG || {};
  var API = "https://discord.com/api/v10";
  var TOKEN_KEY = "lb_staff_token";
  var STATE_KEY = "lb_staff_oauth_state";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  var STATES = ["login", "loading", "denied", "panel", "error"];
  function showState(name) {
    STATES.forEach(function (s) {
      var node = $("#state-" + s);
      if (node) node.hidden = s !== name;
    });
  }

  /* ---------- Jeton (sessionStorage : effacé à la fermeture de l'onglet) ---------- */
  function getToken() {
    try {
      var t = JSON.parse(sessionStorage.getItem(TOKEN_KEY));
      return t && t.access_token && t.expires_at > Date.now() ? t : null;
    } catch (e) { return null; }
  }
  function setToken(t) { try { sessionStorage.setItem(TOKEN_KEY, JSON.stringify(t)); } catch (e) {} }
  function clearToken() { try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) {} }

  /* ---------- Flux OAuth implicite ---------- */
  function randomState() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "s" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function beginLogin() {
    if (!CFG.clientId || /REMPLIR/.test(CFG.clientId)) { showConfigError(); return; }
    var state = randomState();
    try { sessionStorage.setItem(STATE_KEY, state); } catch (e) {}
    var params = new URLSearchParams({
      client_id: CFG.clientId,
      redirect_uri: CFG.redirectUri,
      response_type: "token",
      scope: "identify guilds guilds.members.read",
      state: state,
      prompt: "consent"
    });
    window.location.href = "https://discord.com/oauth2/authorize?" + params.toString();
  }

  function consumeFragment() {
    if (!window.location.hash || window.location.hash.indexOf("access_token") === -1) return null;
    var p = new URLSearchParams(window.location.hash.slice(1));
    var returned = p.get("state");
    var expected = null;
    try { expected = sessionStorage.getItem(STATE_KEY); } catch (e) {}
    try { sessionStorage.removeItem(STATE_KEY); } catch (e) {}
    // nettoyage immédiat de l'URL (le jeton n'apparaît plus)
    history.replaceState(null, "", window.location.pathname);
    if (!returned || returned !== expected) return null;
    var expIn = parseInt(p.get("expires_in"), 10) || 3600;
    return {
      access_token: p.get("access_token"),
      token_type: p.get("token_type") || "Bearer",
      expires_at: Date.now() + expIn * 1000
    };
  }

  /* ---------- Appels API Discord ---------- */
  function dapi(path, token) {
    return fetch(API + path, {
      headers: { Authorization: token.token_type + " " + token.access_token }
    }).then(function (r) {
      if (r.status === 401) { clearToken(); return Promise.reject({ code: 401 }); }
      if (r.status === 404) return Promise.reject({ code: 404 });
      if (!r.ok) return Promise.reject({ code: r.status });
      return r.json();
    });
  }

  function avatarUrl(user, size) {
    size = size || 128;
    if (user.avatar) {
      var ext = user.avatar.indexOf("a_") === 0 ? "gif" : "png";
      return "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + "." + ext + "?size=" + size;
    }
    var idx = user.discriminator && user.discriminator !== "0"
      ? parseInt(user.discriminator, 10) % 5
      : Number((BigInt(user.id) >> 22n) % 6n);
    return "https://cdn.discordapp.com/embed/avatars/" + idx + ".png";
  }

  function displayName(user) { return user.global_name || user.username || "Utilisateur"; }

  function initials(name) {
    return String(name).trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }

  /* ---------- Rendu ---------- */
  function roleOrder() { return Object.keys(CFG.roles || {}); }

  function renderProfileCard(user, member, staffRoleIds) {
    var name = member && member.nick ? member.nick : displayName(user);
    var joined = member && member.joined_at
      ? new Date(member.joined_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
      : "—";
    var chips = (staffRoleIds || []).map(function (id) {
      return '<span class="role-chip">' + esc(CFG.roles[id]) + "</span>";
    }).join("");
    $("#profile-card").innerHTML =
      '<img class="pf-avatar" src="' + avatarUrl(user, 128) + '" alt="">' +
      '<div class="pf-body">' +
        '<div class="pf-name">' + esc(name) + "</div>" +
        '<div class="pf-sub">@' + esc(user.username) + "</div>" +
        (chips ? '<div class="pf-roles">' + chips + "</div>" : "") +
        '<div class="pf-meta">Membre du serveur depuis le ' + esc(joined) + "</div>" +
      "</div>";
  }

  function renderRoster(widget) {
    var wrap = $("#roster");
    var order = roleOrder().map(function (id) { return CFG.roles[id]; });
    var list = (CFG.roster || []).slice();

    if (!list.length && widget && widget.members) {
      // repli : membres en ligne du widget, sans rôle (annuaire indicatif)
      $("#roster-note").textContent =
        "Annuaire non renseigné — affichage des membres en ligne (widget Discord).";
      wrap.innerHTML = widget.members.slice(0, 24).map(function (m) {
        return '<div class="member">' +
          '<img src="' + esc(m.avatar_url) + '" alt="">' +
          '<span>' + esc(m.username) + "</span></div>";
      }).join("") || '<p class="muted">Aucun membre en ligne.</p>';
      return;
    }

    if (!list.length) {
      wrap.innerHTML = '<p class="muted">Annuaire à renseigner dans <code>assets/js/staff-config.js</code> (champ <code>roster</code>).</p>';
      return;
    }

    list.sort(function (a, b) {
      return (order.indexOf(a.role) + 1 || 99) - (order.indexOf(b.role) + 1 || 99);
    });
    var groups = {};
    list.forEach(function (m) { (groups[m.role] = groups[m.role] || []).push(m); });

    wrap.innerHTML = order.filter(function (r) { return groups[r]; }).map(function (role) {
      return '<div class="roster-group">' +
        '<h3 class="roster-role">' + esc(role) + "</h3>" +
        '<div class="roster-people">' + groups[role].map(function (m) {
          var av = m.avatar
            ? '<img src="' + esc(m.avatar) + '" alt="">'
            : '<span class="member-ini">' + esc(initials(m.name)) + "</span>";
          return '<div class="member">' + av + "<span>" + esc(m.name) + "</span></div>";
        }).join("") + "</div></div>";
    }).join("");
  }

  function renderWidget(widget) {
    var box = $("#live");
    if (!widget) {
      box.innerHTML = '<p class="muted">Statistiques indisponibles — active le widget dans ' +
        'Discord → Paramètres du serveur → Widget.</p>';
      return;
    }
    var online = widget.presence_count != null ? widget.presence_count : (widget.members ? widget.members.length : "—");
    var voice = (widget.channels || []).slice().sort(function (a, b) { return a.position - b.position; });
    var byChannel = {};
    (widget.members || []).forEach(function (m) {
      if (m.channel_id) (byChannel[m.channel_id] = byChannel[m.channel_id] || []).push(m.username);
    });

    box.innerHTML =
      '<div class="live-tiles">' +
        '<div class="tile"><span class="n">' + esc(online) + '</span><span class="l">En ligne</span></div>' +
        '<div class="tile"><span class="n">' + esc(voice.length) + '</span><span class="l">Salons vocaux</span></div>' +
        '<div class="tile"><span class="n">' + esc((widget.members || []).filter(function (m) { return m.channel_id; }).length) +
          '</span><span class="l">En vocal</span></div>' +
      "</div>" +
      (voice.length ? '<ul class="vc-list">' + voice.map(function (c) {
        var people = byChannel[c.id] || [];
        return "<li><span class=\"vc-name\">" + esc(c.name) + "</span>" +
          (people.length ? '<span class="vc-people">' + esc(people.join(", ")) + "</span>" : '<span class="muted">vide</span>') +
          "</li>";
      }).join("") + "</ul>" : "");
  }

  function renderResources() {
    var wrap = $("#resources");
    var items = CFG.resources || [];
    if (!items.length) { wrap.innerHTML = '<p class="muted">Aucune ressource configurée.</p>'; return; }
    wrap.innerHTML = items.map(function (r) {
      var ext = /^https?:/.test(r.url);
      return '<a class="res-card" href="' + esc(r.url) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" +
        '<span class="res-label">' + esc(r.label) + "</span>" +
        (r.desc ? '<span class="res-desc">' + esc(r.desc) + "</span>" : "") + "</a>";
    }).join("");
  }

  function renderDuties(mineNames) {
    var items = CFG.duties || [];
    var block = $("#duties-block");
    if (!items.length) { if (block) block.hidden = true; return; }
    if (block) block.hidden = false;
    var mine = mineNames || [];
    $("#duties").innerHTML = items.map(function (d) {
      var isMine = mine.indexOf(d.role) !== -1;
      return '<div class="duty' + (isMine ? " mine" : "") + '">' +
        '<span class="duty-role">' + esc(d.role) + (isMine ? ' <span class="duty-tag">toi</span>' : "") + "</span>" +
        '<span class="duty-text">' + esc(d.text) + "</span></div>";
    }).join("");
  }

  function renderSanctions() {
    var items = CFG.sanctions || [];
    var block = $("#sanctions-block");
    if (!items.length) { if (block) block.hidden = true; return; }
    if (block) block.hidden = false;
    $("#sanctions-table tbody").innerHTML = items.map(function (s) {
      return "<tr><td class=\"infraction-name\">" + esc(s.faute) + "</td>" +
        '<td class="price">' + esc(s.peine) + "</td></tr>";
    }).join("");
  }

  function fetchWidget() {
    if (!CFG.widgetEnabled || !CFG.guildId || /REMPLIR/.test(CFG.guildId)) return Promise.resolve(null);
    return fetch("https://discord.com/api/guilds/" + CFG.guildId + "/widget.json")
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function showConfigError() {
    showState("error");
    var m = $("#error-msg");
    if (m) m.textContent = "L'espace staff n'est pas encore configuré : renseigne assets/js/staff-config.js (clientId, guildId, roles).";
  }

  /* ---------- Démarrage ---------- */
  function boot() {
    $$("[data-login]").forEach(function (b) { b.addEventListener("click", beginLogin); });
    $$("[data-logout]").forEach(function (b) {
      b.addEventListener("click", function () { clearToken(); showState("login"); });
    });
    $$("[data-retry]").forEach(function (b) {
      b.addEventListener("click", function () { clearToken(); showState("login"); });
    });

    if (!CFG.clientId || /REMPLIR/.test(CFG.clientId) || !CFG.guildId || /REMPLIR/.test(CFG.guildId)) {
      // on montre quand même l'écran de connexion, avec l'avertissement
      var warn = $("#cfg-warning");
      if (warn) warn.hidden = false;
    }

    var fresh = consumeFragment();
    if (fresh) setToken(fresh);
    var token = getToken();
    if (!token) { showState("login"); return; }

    showState("loading");

    var meP = dapi("/users/@me", token);
    var memberP = dapi("/users/@me/guilds/" + CFG.guildId + "/member", token).catch(function () { return null; });
    var widgetP = fetchWidget();

    Promise.all([meP, memberP, widgetP]).then(function (res) {
      var me = res[0], member = res[1], widget = res[2];
      var roleIds = (member && member.roles) || [];
      var staffRoleIds = roleOrder().filter(function (id) { return roleIds.indexOf(id) !== -1; });

      renderProfileCard(me, member, staffRoleIds);

      if (!member || staffRoleIds.length === 0) {
        var who = $("#denied-user");
        if (who) who.textContent = displayName(me) + " (@" + me.username + ")";
        showState("denied");
        return;
      }

      var mineNames = staffRoleIds.map(function (id) { return CFG.roles[id]; });
      renderRoster(widget);
      renderWidget(widget);
      renderDuties(mineNames);
      renderSanctions();
      renderResources();
      showState("panel");
    }).catch(function (err) {
      if (err && err.code === 401) { showState("login"); return; }
      showState("error");
      var m = $("#error-msg");
      if (m) m.textContent = "Impossible de contacter Discord (" + ((err && err.code) || "réseau") + "). Réessaie.";
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
