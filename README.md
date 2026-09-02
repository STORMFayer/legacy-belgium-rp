# Legacy Belgium RP — Site web

Site statique (HTML/CSS/JS, aucune dépendance, aucun build) pour le serveur FiveM
**Legacy Belgium RP**.

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Présentation du serveur, univers, comment rejoindre, connexion FiveM, teaser VIP |
| `reglement.html` | Règlement complet (lexique, règles générales, zones safe, Discord, légal, illégal, mort RP, streamers, entreprise, code de la route, double perso) |
| `code-penal.html` | Onglet **Articles de loi** (81 articles + annexes) + onglet **Grille des amendes** (tableau filtrable : infractions, délits, crimes, code aérien, code maritime) |
| `touches.html` | **Touches & commandes IG** : touches F, déplacements AZERTY, commandes (véhicules, perso, services, radio, plage, communication) |
| `abonnements.html` | Les 6 packs VIP (Bronze, Argent, Gold, Diamant, Ultime, à vie) |
| `staff.html` | **Espace staff** — connexion Discord (OAuth implicite), vérification de rôle, profil, annuaire, serveur en direct, ressources. Config dans `assets/js/staff-config.js`. |

## À compléter avant la mise en ligne

1. Logo — ✅ en place (`assets/img/logo.png`, 640 px). L'original 1024 px reste en local
   sous `logo-original.png` (ignoré par git). Un emblème SVG (`logo.svg`) sert de secours
   automatique via `onerror`.
2. Connexion FiveM — ✅ `cfx.re/join/988a64e` (console F8 + bouton « Se connecter »).
3. **Boutique Tebex** — dans `abonnements.html`, remplacer toutes les occurrences de
   `https://legacybelgium.tebex.io/` par l'URL réelle de la boutique
   (idéalement le lien direct de chaque package). Retirer ensuite le bloc « À configurer ».
4. **Espace staff** — voir la section « Espace staff » ci-dessous.
5. Le lien Discord (`https://discord.gg/r7Qvk8H2c`) est déjà en place partout.

## Espace staff (`staff.html`)

Panneau réservé à l'équipe. Authentification **OAuth2 Discord en flux implicite** :
100 % côté navigateur, aucun serveur, aucun secret. Le site lit uniquement le profil,
la liste des serveurs et l'appartenance/les rôles sur le serveur Legacy Belgium.

> ⚠️ C'est un **filtre de confort**, pas une sécurité forte : tout se passe côté client.
> Ne mets rien de réellement confidentiel dans `staff-config.js` (le fichier est public).
> Pour des outils de modération réels (kick/ban/logs), il faudra un backend + un bot.

### Mise en place (Discord Developer Portal)

1. <https://discord.com/developers/applications> → **New Application**.
2. Onglet **OAuth2** :
   - copier le **Client ID** → `clientId` dans `assets/js/staff-config.js`
   - **Redirects** → ajouter exactement :
     `https://<utilisateur>.github.io/<repo>/staff.html`
     (pour test local : `http://localhost:4173/staff.html`)
   - **NE PAS** toucher/partager le *Client Secret*.
3. Discord (client) → activer le **Mode développeur** (Paramètres → Avancés).
4. Clic droit sur l'icône du serveur → **Copier l'identifiant du serveur** → `guildId`.
5. Paramètres du serveur → **Rôles** → clic droit sur chaque rôle staff → **Copier
   l'identifiant** → remplir l'objet `roles` (clé = ID, valeur = nom affiché, ordre =
   hiérarchie).
6. (Optionnel) Paramètres du serveur → **Widget** → *Activer le widget du serveur*
   pour les statistiques live et le repli de l'annuaire.
7. Remplir `roster` (annuaire) et `resources` (liens internes) dans le même fichier.

Un membre voit le tableau de bord s'il est **sur le serveur** ET possède **au moins un**
des rôles listés. Sinon : écran « Accès refusé ».

### Panel de modération (backend)

Actions réelles (timeout, kick, ban/unban, warns + historique, fiche membre, journal,
annonces) + actions FiveM (kick serveur / jail / warn). GitHub Pages ne pouvant pas
exécuter de code serveur, elles passent par un **Cloudflare Worker** (gratuit) + un
**bot Discord**, et une petite **ressource FiveM** pour l'in-game.

- Code du Worker : `worker/` — déploiement : `worker/README.md`
- Ressource FiveM (ESX) : `fivem/lb_staffbridge/` — installation : son `README.md`
- Une fois le Worker déployé, coller son URL dans `assets/js/staff-config.js` → `apiBase`.
  Tant que `apiBase` est vide, la section Modération n'apparaît pas (aucune régression).
- Permissions par palier : Modération (timeout/warn) · Administration (+ kick/ban/FiveM) ·
  Direction (+ annonces). Défini dans `worker/src/config.js`.

## Mettre en ligne sur GitHub Pages

```bash
cd "legacy-belgium-site"
git init
git add .
git commit -m "Site Legacy Belgium RP"
git branch -M main
git remote add origin https://github.com/<utilisateur>/<repo>.git
git push -u origin main
```

Puis sur GitHub : **Settings → Pages → Build and deployment → Source : Deploy from a
branch → Branch : `main` / `(root)` → Save**.
Le site sera disponible sous quelques minutes à
`https://<utilisateur>.github.io/<repo>/`.

Le fichier `.nojekyll` est présent pour que GitHub Pages serve le dossier `assets/`
sans traitement Jekyll.

### Nom de domaine personnalisé (optionnel)

Ajouter un fichier `CNAME` contenant le domaine (ex. `legacybelgium.fr`) puis configurer
les DNS selon la documentation GitHub Pages.

## Développement local

Aucun outil requis. Ouvrir `index.html` dans un navigateur, ou lancer un petit serveur :

```bash
python -m http.server 8000
```

## Direction artistique — « Le Registre »

Sobriété institutionnelle : le site est traité comme le registre officiel d'un petit
État. Univers unique sombre (choix délibéré), or patiné en accent unique, rouge belge
réservé au sémantique (crimes, obligations), tricolore réduit à un filet de 2 px.

- Couleurs : fond `#0e0e0f`, encre `#ecebe4`, or `#c9a24b`, rouge `#a62a2a`
- Typographies (Google Fonts) : **Spectral** (serif, titres), **Public Sans** (texte),
  **IBM Plex Mono** (données, libellés, articles)
- Tout est centralisé dans `assets/css/style.css` (variables CSS en haut du fichier)
- `assets/js/main.js` : menu mobile, onglets, filtre du tableau, scrollspy, révélations
  au défilement, compteurs animés, barre de progression, parallaxe

### Animations

Le site est fortement animé : séquence d'entrée du hero, révélations en cascade au
défilement, compteurs (chiffres du serveur, montants VIP), reflet sur le titre, halo
et anneau de l'emblème, parallaxe souris + défilement, survols (cartes, boutons, nav,
sommaire), transitions d'onglets, barre de progression de lecture.

Les mouvements **continus** (flottement, rotation, reflets) et la **parallaxe** sont
désactivés si le visiteur a activé « réduire les animations » dans son système
(Windows : Paramètres → Accessibilité → Effets visuels → Effets d'animation).
Les apparitions ponctuelles restent actives, en version rapide.
