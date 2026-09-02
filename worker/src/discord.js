/* Helpers API Discord.
   - `userApi`  : appels avec le jeton OAuth de l'utilisateur (identité)
   - `botApi`   : appels avec le jeton du bot (actions privilégiées)
*/
import { GUILD_ID } from "./config.js";

const BASE = "https://discord.com/api/v10";

export class DiscordError extends Error {
  constructor(status, body) {
    super(`Discord ${status}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
    this.status = status;
    this.body = body;
  }
}

async function call(path, { method = "GET", token, bot = false, json, reason } = {}) {
  const headers = { Authorization: `${bot ? "Bot" : "Bearer"} ${token}` };
  if (json !== undefined) headers["Content-Type"] = "application/json";
  if (reason) headers["X-Audit-Log-Reason"] = encodeURIComponent(reason).slice(0, 460);

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: json !== undefined ? JSON.stringify(json) : undefined
  });

  if (res.status === 204) return null;
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new DiscordError(res.status, data);
  return data;
}

/* ---------- Jeton utilisateur ---------- */

export const userApi = {
  me: (token) => call("/users/@me", { token }),
  guildMember: (token) => call(`/users/@me/guilds/${GUILD_ID}/member`, { token })
};

/* ---------- Jeton bot ---------- */

let rolesCache = { at: 0, data: null };

export const botApi = {
  async guildRoles(botToken) {
    if (rolesCache.data && Date.now() - rolesCache.at < 60_000) return rolesCache.data;
    const roles = await call(`/guilds/${GUILD_ID}/roles`, { token: botToken, bot: true });
    rolesCache = { at: Date.now(), data: roles };
    return roles;
  },

  member: (botToken, userId) =>
    call(`/guilds/${GUILD_ID}/members/${userId}`, { token: botToken, bot: true }),

  user: (botToken, userId) =>
    call(`/users/${userId}`, { token: botToken, bot: true }),

  botUser: (botToken) => call("/users/@me", { token: botToken, bot: true }),

  timeout: (botToken, userId, untilIso, reason) =>
    call(`/guilds/${GUILD_ID}/members/${userId}`, {
      method: "PATCH", token: botToken, bot: true, reason,
      json: { communication_disabled_until: untilIso }
    }),

  kick: (botToken, userId, reason) =>
    call(`/guilds/${GUILD_ID}/members/${userId}`, {
      method: "DELETE", token: botToken, bot: true, reason
    }),

  ban: (botToken, userId, reason, deleteSeconds = 0) =>
    call(`/guilds/${GUILD_ID}/bans/${userId}`, {
      method: "PUT", token: botToken, bot: true, reason,
      json: { delete_message_seconds: Math.max(0, Math.min(604800, deleteSeconds)) }
    }),

  unban: (botToken, userId, reason) =>
    call(`/guilds/${GUILD_ID}/bans/${userId}`, {
      method: "DELETE", token: botToken, bot: true, reason
    }),

  getBan: (botToken, userId) =>
    call(`/guilds/${GUILD_ID}/bans/${userId}`, { token: botToken, bot: true }),

  async sendChannel(botToken, channelId, content) {
    return call(`/channels/${channelId}/messages`, {
      method: "POST", token: botToken, bot: true, json: { content }
    });
  },

  async sendDM(botToken, userId, content) {
    const dm = await call("/users/@me/channels", {
      method: "POST", token: botToken, bot: true, json: { recipient_id: userId }
    });
    return call(`/channels/${dm.id}/messages`, {
      method: "POST", token: botToken, bot: true, json: { content }
    });
  }
};

/* Position du plus haut rôle d'une liste d'IDs de rôles. */
export function highestPosition(roleList, roleIds) {
  let pos = 0;
  for (const r of roleList) {
    if (roleIds.includes(r.id) && r.position > pos) pos = r.position;
  }
  return pos;
}
