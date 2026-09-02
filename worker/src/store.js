/* Accès KV : avertissements, journal des actions, limite de débit. */
import { GUILD_ID, LOG_CAP, RATE_LIMIT } from "./config.js";

/* ---------- Avertissements ---------- */

const warnKey = (userId) => `warn:${GUILD_ID}:${userId}`;

export async function getWarns(kv, userId) {
  const raw = await kv.get(warnKey(userId));
  return raw ? JSON.parse(raw) : [];
}

export async function addWarn(kv, userId, warn) {
  const list = await getWarns(kv, userId);
  const entry = {
    id: crypto.randomUUID().slice(0, 8),
    reason: warn.reason,
    byId: warn.byId,
    byName: warn.byName,
    at: new Date().toISOString()
  };
  list.push(entry);
  await kv.put(warnKey(userId), JSON.stringify(list));
  return entry;
}

export async function deleteWarn(kv, userId, warnId) {
  const list = await getWarns(kv, userId);
  const next = list.filter((w) => w.id !== warnId);
  if (next.length === list.length) return false;
  await kv.put(warnKey(userId), JSON.stringify(next));
  return true;
}

/* ---------- Journal des actions ---------- */

const LOG_KEY = "log:recent";

export async function addLog(kv, entry) {
  const raw = await kv.get(LOG_KEY);
  const list = raw ? JSON.parse(raw) : [];
  list.unshift({ ...entry, at: new Date().toISOString() });
  if (list.length > LOG_CAP) list.length = LOG_CAP;
  await kv.put(LOG_KEY, JSON.stringify(list));
}

export async function getLog(kv, { limit = 50, offset = 0 } = {}) {
  const raw = await kv.get(LOG_KEY);
  const list = raw ? JSON.parse(raw) : [];
  return { total: list.length, entries: list.slice(offset, offset + limit) };
}

/* ---------- Limite de débit (par membre) ---------- */

export async function checkRate(kv, userId) {
  const key = `rl:${userId}`;
  const raw = await kv.get(key);
  const now = Math.floor(Date.now() / 1000);
  let data = raw ? JSON.parse(raw) : { count: 0, reset: now + RATE_LIMIT.windowSec };
  if (now >= data.reset) data = { count: 0, reset: now + RATE_LIMIT.windowSec };
  data.count++;
  await kv.put(key, JSON.stringify(data), { expirationTtl: RATE_LIMIT.windowSec + 5 });
  return { ok: data.count <= RATE_LIMIT.max, retryAfter: data.reset - now };
}
