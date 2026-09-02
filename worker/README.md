# API de modération — Legacy Belgium RP

Backend de l'espace staff (Cloudflare Worker). Il vérifie qui appelle (jeton Discord de
l'utilisateur) + son rôle, puis exécute les actions avec un **bot Discord**. Aucun secret
n'est dans le dépôt.

```
staff.html ──▶ Worker (ici) ──▶ API Discord (jeton bot)  +  KV (warns / journal)  +  FiveM
```

## 1. Créer le bot Discord

1. <https://discord.com/developers/applications> → ton application → onglet **Bot**
2. **Reset Token** → copie-le, c'est le secret `DISCORD_BOT_TOKEN` (ne le partage jamais)
3. Plus bas : active **Server Members Intent** (nécessaire pour lire les membres / rechercher par pseudo)
4. Onglet **OAuth2 → URL Generator** :
   - scope : `bot`
   - permissions : `Kick Members`, `Ban Members`, `Moderate Members`, `Send Messages`
   - ouvre l'URL générée → ajoute le bot au serveur
5. Serveur Discord → **Paramètres → Rôles** : place le rôle du bot **au-dessus** de tous les
   rôles qu'il devra sanctionner (sinon Discord refuse kick/ban/timeout)
6. Copie l'**ID du salon d'annonces** (clic droit sur le salon → Copier l'identifiant)

## 2. Configurer le Worker

Édite `src/config.js` :
- `ANNOUNCE_CHANNEL_ID` = l'ID du salon d'annonces
- vérifie `ROLE_TIERS` (rôle → palier) et `ACTION_TIER` si besoin

`GUILD_ID` et les IDs de rôles sont déjà renseignés.

## 3. Déployer

```bash
npm i -g wrangler
wrangler login

cd worker
npm install

# crée le stockage KV et colle l'id affiché dans wrangler.toml (kv_namespaces.id)
wrangler kv namespace create LB_STAFF

# secret du bot
wrangler secret put DISCORD_BOT_TOKEN

wrangler deploy
```

`wrangler deploy` affiche l'URL du Worker, du type
`https://lb-staff-api.<ton-sous-domaine>.workers.dev`.

## 4. Brancher le site

Dans `assets/js/staff-config.js` (à la racine du site) :

```js
apiBase: "https://lb-staff-api.<ton-sous-domaine>.workers.dev",
```

Puis `git add . && git commit -m "branche l'API staff" && git push`.
La section **Modération** apparaît alors dans l'espace staff, selon le palier de chacun.

## 5. (Optionnel) FiveM

Voir `../fivem/lb_staffbridge/README.md`. Après avoir posé la ressource :

```bash
wrangler secret put FIVEM_URL      # ex. http://mon-serveur:30120  (base, sans /lb_staffbridge)
wrangler secret put FIVEM_SECRET   # = la convar lb_staff_secret
```

## Développement local

```bash
cp .dev.vars.example .dev.vars   # puis remplis DISCORD_BOT_TOKEN
wrangler dev
```

Récupère un jeton utilisateur de test : connecte-toi sur la page staff, console du
navigateur → `JSON.parse(sessionStorage.lb_staff_token).access_token`.

```bash
curl -X POST http://localhost:8787/api/whoami -H "Authorization: Bearer <jeton>"
```

## Paliers & actions

| Palier | Actions |
|---|---|
| 1 · Modération | `whoami` `member` `warns` `warn` `timeout` `untimeout` `log` |
| 2 · Administration | + `kick` `ban` `unban` `warn/delete` `fivem/kick` `fivem/jail` `fivem/warn` |
| 3 · Direction | + `announce` |

Garde-fous : jamais sur soi-même, jamais sur un rôle ≥ au sien, motif obligatoire &
journalisé, limite de débit par membre, CORS restreint à `stormfayer.github.io`.

## Coûts

Cloudflare Workers gratuit : 100 000 requêtes/jour, KV 1 000 écritures/jour et
100 000 lectures/jour. Large pour un panel staff.
