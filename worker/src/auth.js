/* Authentification & contrôle d'accès. */
import { ROLE_TIERS, ACTION_TIER } from "./config.js";
import { userApi, botApi, highestPosition, DiscordError } from "./discord.js";

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

/* Identifie l'appelant à partir de son jeton OAuth, récupère ses rôles via le bot,
   calcule son palier. Lève HttpError(401/403). */
export async function identify(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) throw new HttpError(401, "Jeton manquant.");

  let me;
  try {
    me = await userApi.me(token);
  } catch (e) {
    if (e instanceof DiscordError && (e.status === 401 || e.status === 403)) {
      throw new HttpError(401, "Session Discord expirée, reconnecte-toi.");
    }
    throw e;
  }

  // Rôles de l'appelant sur le serveur — via le bot (source de vérité).
  let member;
  try {
    member = await botApi.member(env.DISCORD_BOT_TOKEN, me.id);
  } catch (e) {
    if (e instanceof DiscordError && e.status === 404) {
      throw new HttpError(403, "Tu n'es pas membre du serveur.");
    }
    throw e;
  }

  const roleIds = member.roles || [];
  const tier = roleIds.reduce((max, id) => Math.max(max, ROLE_TIERS[id] || 0), 0);
  if (tier < 1) throw new HttpError(403, "Aucun rôle staff.");

  return {
    id: me.id,
    username: me.username,
    displayName: member.nick || me.global_name || me.username,
    roleIds,
    tier
  };
}

/* Vérifie que le palier de l'appelant couvre l'action. */
export function authorize(caller, action) {
  const need = ACTION_TIER[action];
  if (need === undefined) throw new HttpError(404, "Action inconnue.");
  if (caller.tier < need) throw new HttpError(403, "Palier insuffisant pour cette action.");
}

/* Garde-fous hiérarchie : pas d'action sur soi-même ni sur quelqu'un d'égal/supérieur.
   `targetRoleIds` peut être null (cible hors serveur → autorisé pour ban/unban). */
export async function assertCanTarget(env, caller, targetId, targetRoleIds) {
  if (targetId === caller.id) throw new HttpError(403, "Action impossible sur toi-même.");
  if (!targetRoleIds) return; // cible absente du serveur

  const roles = await botApi.guildRoles(env.DISCORD_BOT_TOKEN);
  const callerPos = highestPosition(roles, caller.roleIds);
  const targetPos = highestPosition(roles, targetRoleIds);
  if (targetPos >= callerPos) {
    throw new HttpError(403, "Cible d'un rang égal ou supérieur au tien.");
  }
}
