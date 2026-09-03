/* Configuration NON secrète du Worker de modération.
   (Les secrets — jeton du bot, URL/secret FiveM — sont dans les secrets Cloudflare,
   jamais ici.)
   ---------------------------------------------------------------------------- */

/* Serveur Discord */
export const GUILD_ID = "1531350214559137822";

/* Origine autorisée à appeler l'API (CORS). */
export const ALLOWED_ORIGIN = "https://stormfayer.github.io";

/* Salon où « /api/announce » publie (à remplir : clic droit sur le salon → Copier l'ID). */
export const ANNOUNCE_CHANNEL_ID = "1531350215439941682";

/* Rôle → palier de permission.  Palier du membre = le plus élevé de ses rôles.
     3 = Direction   (Fondateur, Co-Fondateur, Développeur)
     2 = Administration
     1 = Modération
   Un rôle absent d'ici = palier 0 = aucun accès. */
export const ROLE_TIERS = {
  "1531350214655479921": 3, // Fondateur
  "1531350214655479920": 3, // Co-Fondateur
  "1531350214642761806": 3, // Développeur
  "1531350214642761801": 2, // Administrateur
  "1531350214642761800": 1, // Modérateur
  "1531350214642761798": 1, // Douanier
  "1531350214630445115": 1  // Staff de Legacy Belgium
};

/* Palier minimum requis par action. */
export const ACTION_TIER = {
  "whoami": 1,
  "member": 1,
  "warns": 1,
  "warn": 1,
  "timeout": 1,
  "untimeout": 1,
  "log": 1,
  "kick": 2,
  "ban": 2,
  "unban": 2,
  "warn/delete": 2,
  "fivem/kick": 2,
  "fivem/jail": 2,
  "fivem/warn": 2,
  "announce": 3
};

/* Limite de débit : nb max d'actions écrivant (mutations) par membre et par fenêtre. */
export const RATE_LIMIT = { max: 25, windowSec: 60 };

/* Le warn envoie-t-il un MP au membre ? */
export const WARN_DM = true;

/* Nombre d'entrées conservées dans le journal. */
export const LOG_CAP = 500;
