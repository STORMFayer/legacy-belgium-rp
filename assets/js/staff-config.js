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

     Noms déduits de ta liste de rôles Discord, dans l'ordre où tu as donné
     les IDs. Si l'ordre ne correspond pas, il suffit de réassocier les noms.
     Seuls les IDs conditionnent l'accès ; les noms ne servent qu'à l'affichage.
     ------------------------------------------------------------------------- */
  roles: {
    "1531350214655479921": "Fondateur",
    "1531350214655479920": "Co-Fondateur",
    "1531350214642761806": "Développeur",
    "1531350214642761801": "Administrateur",
    "1531350214642761800": "Modérateur",
    "1531350214642761798": "Communauté Manager",
    "1531350214630445115": "Staff de Legacy Belgium"
  },

  /* Widget du serveur activé ?  (Paramètres du serveur → Widget → Activer)
     Nécessaire pour les statistiques live et le repli de l'annuaire. */
  widgetEnabled: true,

  /* Annuaire du staff (affiché tel quel).  « role » doit correspondre à un nom
     défini dans `roles` ci-dessus.  « avatar » : URL d'image, ou vide = initiales. */
  roster: [
    // { name: "Pseudo", role: "Fondateur", avatar: "" },
  ],

  /* Raccourcis & ressources internes (cartes cliquables) */
  resources: [
    // { label: "Procédures staff", desc: "Google Doc", url: "https://..." },
    // { label: "Sanctions types",  desc: "Barème interne", url: "https://..." },
    { label: "Règlement",  desc: "Version publique",      url: "reglement.html" },
    { label: "Code pénal", desc: "Articles + amendes",    url: "code-penal.html" },
    { label: "Discord",    desc: "Serveur communautaire", url: "https://discord.gg/r7Qvk8H2c" }
  ]
};
