/* Legacy Belgium RP — API de modération staff (Cloudflare Worker).
   Toutes les routes : POST /api/<action>, corps JSON, en-tête
   Authorization: Bearer <jeton OAuth Discord de l'utilisateur>. */

import { ALLOWED_ORIGIN, ANNOUNCE_CHANNEL_ID, WARN_DM, GUILD_ID } from "./config.js";
import { identify, authorize, assertCanTarget, HttpError } from "./auth.js";
import { botApi, DiscordError } from "./discord.js";
import { getWarns, addWarn, deleteWarn, addLog, getLog, checkRate } from "./store.js";
import { fivemCall, fivemConfigured } from "./fivem.js";

const MUTATIONS = new Set([
  "timeout", "untimeout", "kick", "ban", "unban",
  "warn", "warn/delete", "announce", "fivem/kick", "fivem/jail", "fivem/warn"
]);

const ID_RE = /^\d{15,25}$/;

function cors(origin) {
  const allow = origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) }
  });
}

const need = (obj, key) => {
  const v = obj?.[key];
  if (v === undefined || v === null || v === "") throw new HttpError(400, `Champ requis : ${key}.`);
  return v;
};
const reasonOf = (body) => {
  const r = String(need(body, "reason")).trim();
  if (r.length < 3) throw new HttpError(400, "Motif trop court.");
  return r.slice(0, 400);
};

/* Résout une cible : renvoie { user, member|null } à partir d'un ID Discord. */
async function resolveTarget(env, userId) {
  if (!ID_RE.test(String(userId))) throw new HttpError(400, "Identifiant Discord invalide.");
  let member = null;
  try { member = await botApi.member(env.DISCORD_BOT_TOKEN, userId); }
  catch (e) { if (!(e instanceof DiscordError && e.status === 404)) throw e; }
  let user = member?.user || null;
  if (!user) {
    try { user = await botApi.user(env.DISCORD_BOT_TOKEN, userId); }
    catch { user = { id: String(userId), username: "inconnu" }; }
  }
  return { user, member };
}

const nameOf = (u, m) => (m?.nick || u?.global_name || u?.username || u?.id);

async function handle(request, env) {
  const url = new URL(request.url);
  const action = url.pathname.replace(/^\/api\//, "").replace(/\/+$/, "");
  const kv = env.LB_STAFF;

  const caller = await identify(request, env);
  authorize(caller, action);

  if (MUTATIONS.has(action)) {
    const rl = await checkRate(kv, caller.id);
    if (!rl.ok) throw new HttpError(429, `Trop d'actions. Réessaie dans ${rl.retryAfter}s.`);
  }

  let body = {};
  if (request.headers.get("Content-Type")?.includes("application/json")) {
    body = await request.json().catch(() => ({}));
  }

  const log = (entry) => addLog(kv, {
    action, byId: caller.id, byName: caller.displayName, ...entry
  });

  switch (action) {

    case "whoami":
      return {
        id: caller.id, username: caller.username, displayName: caller.displayName,
        tier: caller.tier, fivem: fivemConfigured(env)
      };

    case "member": {
      const query = String(need(body, "query")).trim();
      let hits = [];
      if (ID_RE.test(query)) {
        const { user, member } = await resolveTarget(env, query);
        hits = [{ user, member }];
      } else {
        const res = await fetch(
          `https://discord.com/api/v10/guilds/${GUILD_ID}/members/search?query=${encodeURIComponent(query)}&limit=8`,
          { headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` } }
        );
        if (res.status === 403 || res.status === 401) {
          throw new HttpError(503, "Recherche par pseudo indisponible : active l'intent « Server Members » du bot, ou cherche par ID.");
        }
        const list = res.ok ? await res.json() : [];
        hits = list.map((m) => ({ user: m.user, member: m }));
      }
      const out = [];
      for (const h of hits) {
        out.push({
          id: h.user.id,
          name: nameOf(h.user, h.member),
          username: h.user.username,
          avatar: h.user.avatar,
          inGuild: !!h.member,
          roles: h.member?.roles || [],
          joinedAt: h.member?.joined_at || null,
          timedOutUntil: h.member?.communication_disabled_until || null,
          warns: await getWarns(kv, h.user.id)
        });
      }
      return { results: out };
    }

    case "warns": {
      const userId = need(body, "userId");
      const { user, member } = await resolveTarget(env, userId);
      return { user: { id: user.id, name: nameOf(user, member) }, warns: await getWarns(kv, userId) };
    }

    case "warn": {
      const userId = need(body, "userId");
      const reason = reasonOf(body);
      const { user, member } = await resolveTarget(env, userId);
      const entry = await addWarn(kv, userId, { reason, byId: caller.id, byName: caller.displayName });
      let dm = false;
      if (WARN_DM) {
        try { await botApi.sendDM(env.DISCORD_BOT_TOKEN, userId, `⚠️ **Avertissement — Legacy Belgium RP**\nMotif : ${reason}`); dm = true; }
        catch { dm = false; }
      }
      await log({ targetId: userId, targetName: nameOf(user, member), reason, result: dm ? "warn + MP" : "warn (MP échoué)" });
      return { ok: true, warn: entry, dm };
    }

    case "warn/delete": {
      const userId = need(body, "userId");
      const warnId = need(body, "warnId");
      const removed = await deleteWarn(kv, userId, warnId);
      if (!removed) throw new HttpError(404, "Avertissement introuvable.");
      await log({ targetId: userId, targetName: userId, reason: `suppression warn ${warnId}`, result: "warn supprimé" });
      return { ok: true };
    }

    case "timeout": {
      const userId = need(body, "userId");
      const minutes = Math.max(1, Math.min(40320, parseInt(need(body, "minutes"), 10) || 0));
      const reason = reasonOf(body);
      const { user, member } = await resolveTarget(env, userId);
      if (!member) throw new HttpError(404, "Membre absent du serveur.");
      await assertCanTarget(env, caller, userId, member.roles);
      const until = new Date(Date.now() + minutes * 60_000).toISOString();
      await botApi.timeout(env.DISCORD_BOT_TOKEN, userId, until, `${reason} — par ${caller.displayName}`);
      await log({ targetId: userId, targetName: nameOf(user, member), reason, result: `timeout ${minutes} min` });
      return { ok: true, until };
    }

    case "untimeout": {
      const userId = need(body, "userId");
      await botApi.timeout(env.DISCORD_BOT_TOKEN, userId, null, `Levée du timeout — par ${caller.displayName}`);
      await log({ targetId: userId, targetName: userId, reason: "levée du timeout", result: "timeout levé" });
      return { ok: true };
    }

    case "kick": {
      const userId = need(body, "userId");
      const reason = reasonOf(body);
      const { user, member } = await resolveTarget(env, userId);
      if (!member) throw new HttpError(404, "Membre absent du serveur.");
      await assertCanTarget(env, caller, userId, member.roles);
      await botApi.kick(env.DISCORD_BOT_TOKEN, userId, `${reason} — par ${caller.displayName}`);
      await log({ targetId: userId, targetName: nameOf(user, member), reason, result: "kick Discord" });
      return { ok: true };
    }

    case "ban": {
      const userId = need(body, "userId");
      const reason = reasonOf(body);
      const deleteDays = Math.max(0, Math.min(7, parseInt(body.deleteDays, 10) || 0));
      const { user, member } = await resolveTarget(env, userId);
      await assertCanTarget(env, caller, userId, member?.roles || null);
      await botApi.ban(env.DISCORD_BOT_TOKEN, userId, `${reason} — par ${caller.displayName}`, deleteDays * 86400);
      await log({ targetId: userId, targetName: nameOf(user, member), reason, result: `ban Discord (purge ${deleteDays}j)` });
      return { ok: true };
    }

    case "unban": {
      const userId = need(body, "userId");
      const reason = reasonOf(body);
      await botApi.unban(env.DISCORD_BOT_TOKEN, userId, `${reason} — par ${caller.displayName}`).catch((e) => {
        if (e instanceof DiscordError && e.status === 404) throw new HttpError(404, "Ce membre n'est pas banni.");
        throw e;
      });
      await log({ targetId: userId, targetName: userId, reason, result: "unban Discord" });
      return { ok: true };
    }

    case "announce": {
      if (!ANNOUNCE_CHANNEL_ID) throw new HttpError(503, "Salon d'annonce non configuré (src/config.js).");
      const message = String(need(body, "message")).trim().slice(0, 1900);
      if (message.length < 3) throw new HttpError(400, "Message trop court.");
      await botApi.sendChannel(env.DISCORD_BOT_TOKEN, ANNOUNCE_CHANNEL_ID, message);
      await log({ targetId: ANNOUNCE_CHANNEL_ID, targetName: "#annonces", reason: message.slice(0, 120), result: "annonce publiée" });
      return { ok: true };
    }

    case "log": {
      const limit = Math.max(1, Math.min(200, parseInt(body.limit, 10) || 50));
      const offset = Math.max(0, parseInt(body.offset, 10) || 0);
      return await getLog(kv, { limit, offset });
    }

    case "fivem/kick": {
      const userId = need(body, "userId");
      const reason = reasonOf(body);
      const r = await fivemCall(env, "kick", { discord: userId, reason, by: caller.displayName });
      await log({ targetId: userId, targetName: userId, reason, result: r.message || "kick serveur" });
      return { ok: true, ...r };
    }
    case "fivem/jail": {
      const userId = need(body, "userId");
      const minutes = Math.max(1, Math.min(1440, parseInt(need(body, "minutes"), 10) || 0));
      const reason = reasonOf(body);
      const r = await fivemCall(env, "jail", { discord: userId, minutes, reason, by: caller.displayName });
      await log({ targetId: userId, targetName: userId, reason, result: r.message || `jail ${minutes} min` });
      return { ok: true, ...r };
    }
    case "fivem/warn": {
      const userId = need(body, "userId");
      const reason = reasonOf(body);
      const r = await fivemCall(env, "warn", { discord: userId, reason, by: caller.displayName });
      await log({ targetId: userId, targetName: userId, reason, result: r.message || "warn IG" });
      return { ok: true, ...r };
    }

    default:
      throw new HttpError(404, "Route inconnue.");
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (request.method !== "POST") return json({ error: "Méthode non autorisée." }, 405, origin);
    if (!new URL(request.url).pathname.startsWith("/api/")) return json({ error: "Not found." }, 404, origin);

    try {
      const result = await handle(request, env);
      return json(result, 200, origin);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status, origin);
      if (e instanceof DiscordError) {
        if (e.status === 403) return json({ error: "Le bot n'a pas les droits, ou la cible est au-dessus du bot dans la hiérarchie." }, 403, origin);
        if (e.status === 404) return json({ error: "Introuvable côté Discord." }, 404, origin);
        if (e.status === 429) return json({ error: "Discord limite le débit, réessaie dans un instant." }, 429, origin);
        return json({ error: "Erreur Discord." }, 502, origin);
      }
      return json({ error: "Erreur interne." }, 500, origin);
    }
  }
};
