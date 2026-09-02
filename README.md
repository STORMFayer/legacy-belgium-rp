# Legacy Belgium RP — Site web

Site statique (HTML/CSS/JS, aucune dépendance, aucun build) pour le serveur FiveM
**Legacy Belgium RP**.

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Présentation du serveur, univers, comment rejoindre, connexion, teaser VIP |
| `reglement.html` | Règlement complet (lexique, règles générales, zones safe, Discord, légal, illégal, mort RP, streamers, entreprise, code de la route, double perso) |
| `code-penal.html` | Onglet **Articles de loi** (81 articles + annexes) + onglet **Grille des amendes** (tableau filtrable : infractions, délits, crimes, code aérien, code maritime) |
| `abonnements.html` | Les 6 packs VIP (Bronze, Argent, Gold, Diamant, Ultime, à vie) |

## À compléter avant la mise en ligne

1. **Logo** — déposer le vrai fichier ici : `assets/img/logo.png`
   (un emblème `assets/img/logo.svg` dessiné à la main s'affiche automatiquement tant
   qu'il manque, via `onerror` sur les `<img>`). Format conseillé : PNG carré, fond
   transparent, ~512 px. Aucune autre modification nécessaire — le remplacement du
   fichier suffit.
2. **Code de connexion FiveM** — dans `index.html`, remplacer
   `connect <code-cfx-à-remplir>` par le vrai code `cfx.re` (et retirer le badge « À compléter »).
3. **Boutique Tebex** — dans `abonnements.html`, remplacer toutes les occurrences de
   `https://legacybelgium.tebex.io/` par l'URL réelle de la boutique
   (idéalement le lien direct de chaque package). Retirer ensuite le bloc « À configurer ».
4. Le lien Discord (`https://discord.gg/r7Qvk8H2c`) est déjà en place partout.

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
- `assets/js/main.js` : menu mobile, onglets, filtre du tableau, scrollspy, révélation au défilement
