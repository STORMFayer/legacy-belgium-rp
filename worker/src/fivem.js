/* Appels vers la ressource FiveM `lb_staffbridge`.
   Nécessite les secrets FIVEM_URL et FIVEM_SECRET. */
import { HttpError } from "./auth.js";

export function fivemConfigured(env) {
  return !!(env.FIVEM_URL && env.FIVEM_SECRET);
}

export async function fivemCall(env, path, payload) {
  if (!fivemConfigured(env)) throw new HttpError(503, "Intégration FiveM non configurée.");
  const base = env.FIVEM_URL.replace(/\/+$/, "");
  let res;
  try {
    res = await fetch(`${base}/lb_staffbridge/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.FIVEM_SECRET}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new HttpError(502, "Serveur FiveM injoignable.");
  }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }
  if (!res.ok) throw new HttpError(res.status === 401 ? 500 : 502, data?.message || "Erreur FiveM.");
  return data || { ok: true };
}
