/* =============================================================================
   CONFIGURATION DE L'ESPACE STAFF
   -----------------------------------------------------------------------------
   Aucun secret ici : ce fichier est public. Ne mets JAMAIS le « Client Secret »
   Discord. Le Client ID, l'ID du serveur et les ID de rôles ne sont pas
   sensibles.
   ============================================================================= */

window.STAFF_CONFIG = {

  /* Discord Developer Portal → ton application → OAuth2 → CLIENT ID */
  clientId: "1544763433583386654",

  /* URL de redirection à déclarer dans OAuth2 → Redirects :
        https://stormfayer.github.io/legacy-belgium-rp/staff.html
     (laisse la ligne ci-dessous telle quelle) */
  redirectUri: location.origin + location.pathname,

  /* Identifiant du serveur Discord */
  guildId: "1531350214559137822",

  /* -------------------------------------------------------------------------
     RÔLES considérés comme « staff ».  Clé = ID du rôle, valeur = nom affiché.
     L'ordre = hiérarchie (haut = plus élevé).
     >>> À VÉRIFIER : noms déduits de ta hiérarchie Discord. Seuls les IDs
         conditionnent l'accès ; les noms ne servent qu'à l'affichage.
     ------------------------------------------------------------------------- */
  roles: {
    "1531350214655479921": "Fondateur",
    "1531350214655479920": "Co-Fondateur",
    "1531350214642761806": "Développeur",
    "1531350214642761801": "Administrateur",
    "1531350214642761800": "Modérateur",
    "1531350214642761798": "Douanier",
    "1531350214630445115": "Staff de Legacy Belgium"
  },

  /* Widget du serveur activé ?  (Paramètres du serveur → Widget → Activer) */
  widgetEnabled: true,

  /* -------------------------------------------------------------------------
     ANNUAIRE DU STAFF.  « role » doit correspondre à un nom de `roles`.
     « avatar » : URL d'image, ou vide = initiales.
     ------------------------------------------------------------------------- */
  roster: [
    { name: "FrostK",          role: "Fondateur",   avatar: "" },
    { name: "Rafael Iglesias", role: "Développeur", avatar: "" },
    { name: "Charle Bendero",  role: "Modérateur",  avatar: "" }
  ],

  /* -------------------------------------------------------------------------
     FICHES DE POSTE — ce que fait chaque rôle (source : « Notre travail »).
     ------------------------------------------------------------------------- */
  duties: [
    { role: "Fondateur", text: "Gère le Discord, prend les décisions importantes, s'occupe du passage des whitelist si besoin, participe au paiement des ressources." },
    { role: "Co-Fondateur", text: "Assiste le Fondateur et prend les décisions importantes lorsqu'il n'est pas disponible, s'occupe du passage des whitelist si besoin, participe au paiement des ressources." },
    { role: "Développeur", text: "Gère toute la partie technique (codage) ainsi que les demandes des fondateurs ou des citoyens, si elles sont validées par un fondateur." },
    { role: "Gérant staff", text: "S'occupe des recrutements et de la gestion du staff, des formulaires de recrutement, du passage des whitelist si besoin, participe au paiement des ressources en cas de besoin." },
    { role: "Gérant légal", text: "Gère les tickets des entreprises légales et la présentation en ville des jobs (points, véhicules, etc.)." },
    { role: "Gérant illégal", text: "Gère les tickets de l'illégal, connaît tous les points (drogues, armes, etc.) et s'occupe de la présentation en ville des jobs." },
    { role: "Administrateur", text: "S'occupe de la partie serveur (IG), des setjob sur accord et autorisation, du passage des whitelist, applique les sanctions, participe au paiement des ressources en cas de besoin." },
    { role: "Modérateur", text: "S'occupe de la partie serveur (IG), du passage des whitelist, applique les sanctions, participe au paiement des ressources en cas de besoin." },
    { role: "Douanier", text: "Période de test de 2 semaines minimum (activité Discord à prouver). S'occupe de la partie Discord : tickets, besoin d'aide, passage douane, etc." },
    { role: "Communauté Manager", text: "S'occupe principalement de la publicité du serveur sur les réseaux sociaux. Rappel : tous les staffs font de la pub, sans exception." }
  ],

  /* -------------------------------------------------------------------------
     BARÈME DES SANCTIONS (source : Règlement staff).
     ------------------------------------------------------------------------- */
  sanctions: [
    { faute: "Freekill / Carkill sans raison", peine: "Jail 1 h (3600)" },
    { faute: "Insultes parentales",            peine: "Ban 24 h" },
    { faute: "No pain abusif",                 peine: "Jail 20 min (1200)" },
    { faute: "No fear abusif",                 peine: "Jail 30 min (1800)" },
    { faute: "Force RP",                       peine: "Jail 45 min (2700)" },
    { faute: "Méta Gaming",                    peine: "Ban 24 h" },
    { faute: "Powergaming",                    peine: "Ban 48 h" },
    { faute: "Cheat",                          peine: "Ban définitif" }
  ],

  /* -------------------------------------------------------------------------
     RACCOURCIS & RESSOURCES INTERNES (cartes cliquables).
     ------------------------------------------------------------------------- */
  resources: [
    { label: "Règlement staff",  desc: "Règles internes + barème", url: "https://docs.google.com/document/d/1h3M75vip5M6E-e7hNvhu7VLkfRNKeevRFLSE9_mj2Ds/edit" },
    { label: "Règlement public", desc: "Version joueurs",          url: "reglement.html" },
    { label: "Code pénal",       desc: "Articles + amendes",       url: "code-penal.html" },
    { label: "Discord",          desc: "Serveur communautaire",    url: "https://discord.gg/r7Qvk8H2c" }
  ]
};
