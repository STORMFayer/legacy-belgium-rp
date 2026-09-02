# lb_staffbridge

Petite ressource FiveM qui reçoit les actions **kick / jail / warn** du panel staff web
(via le Cloudflare Worker) et les exécute en jeu. Ciblé **ESX**.

## Installation

1. Copie le dossier `lb_staffbridge` dans `resources/` du serveur.
2. Dans `server.cfg` :
   ```
   set lb_staff_secret "colle-ici-une-longue-chaine-aleatoire"
   ensure lb_staffbridge
   ```
   Génère le secret au hasard (ex. 40 caractères). Il devra être identique au secret
   `FIVEM_SECRET` du Worker.
3. Adapte `config.lua` : les fonctions `Config.DoJail` et `Config.DoWarn` à ton script de
   prison / de warn (le kick fonctionne tel quel via `DropPlayer`).
4. Redémarre / `ensure lb_staffbridge`. La console doit afficher `[lb_staffbridge] prêt.`

## Exposer l'endpoint au Worker

Le Worker (Cloudflare) doit pouvoir joindre le serveur en HTTP. L'URL est :

```
http://<ip-ou-domaine-du-serveur>:<port-fivem>/lb_staffbridge/<kick|jail|warn>
```

`<port-fivem>` = le port TCP du serveur (souvent `30120`).

Puis côté Worker :
```bash
wrangler secret put FIVEM_URL      # http://<ip-ou-domaine>:<port>   (base, SANS /lb_staffbridge)
wrangler secret put FIVEM_SECRET   # = la valeur de lb_staff_secret
```

> Recommandé : mets un reverse-proxy HTTPS (nginx / Cloudflare Tunnel) devant, et donne
> l'URL `https://...` au Worker. Ne laisse pas le secret transiter en HTTP clair sur
> Internet ouvert si tu peux l'éviter.

## Sécurité

- Toute requête sans `Authorization: Bearer <lb_staff_secret>` valide est rejetée (401).
- Le Worker n'appelle cette ressource qu'après avoir vérifié le rôle du staff (palier 2+).
- La ressource ne fait que 3 actions bornées ; elle n'expose aucune commande arbitraire.

## Requête (pour test)

```bash
curl -X POST http://<ip>:30120/lb_staffbridge/kick \
  -H "Authorization: Bearer <lb_staff_secret>" \
  -H "Content-Type: application/json" \
  -d '{"discord":"123456789012345678","reason":"test","by":"moi"}'
```
