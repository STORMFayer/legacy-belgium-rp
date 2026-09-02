/* =============================================================================
   CONFIGURATION DE L'ESPACE STAFF  —  à remplir
   -----------------------------------------------------------------------------
   Aucun secret ici : ce fichier est public. Ne mets JAMAIS le "Client Secret"
   Discord. Le "Client ID", les identifiants de serveur et de rôles ne sont pas
   sensibles.
   ============================================================================= */

window.STAFF_CONFIG = {

  /* --- Discord Developer Portal → ton application → OAuth2 → CLIENT ID --- */
  clientId: "REMPLIR_CLIENT_ID",

  /* URL de redirection à déclarer dans OAuth2 → Redirects (laisse tel quel) */
  redirectUri: location.origin + location.pathname,

  /* --- Identifiant du serveur Discord (clic droit sur l'icône → Copier l'ID) --- */
  guildId: "REMPLIR_GUILD_ID",

  /* --- Rôles considérés comme "staff".  Clé = ID du rôle, valeur = nom affiché.
         L'ordre compte : du plus haut au plus bas dans la hiérarchie.
         (Discord → Paramètres du serveur → Rôles → clic droit → Copier l'ID) --- */
  roles: {
    "REMPLIR_ID_FONDATEUR":      "Fondateur",
    "REMPLIR_ID_RESPONSABLE":    "Responsable",
    "REMPLIR_ID_ADMINISTRATEUR": "Administrateur",
    "REMPLIR_ID_DEVELOPPEUR":    "Développeur",
    "REMPLIR_ID_MODERATEUR":     "Modérateur",
    "REMPLIR_ID_MODTEST":        "Modérateur test"
  },

  /* --- Widget du serveur activé ?  (Paramètres du serveur → Widget → Activer)
         Nécessaire pour les statistiques live et le repli de l'annuaire. --- */
  widgetEnabled: true,

  /* --- Annuaire du staff (affiché tel quel).  Groupé par "role" (doit
         correspondre à un nom défini dans `roles` ci-dessus).
         `avatar` : URL d'image, ou laisse vide pour les initiales. --- */
  roster: [
    // { name: "Pseudo", role: "Fondateur", avatar: "" },
    // { name: "Pseudo", role: "Administrateur", avatar: "" },
  ],

  /* --- Raccourcis & ressources internes (cartes cliquables) --- */
  resources: [
    // { label: "Procédures staff", desc: "Google Doc", url: "https://..." },
    // { label: "Sanctions types",  desc: "Barème interne", url: "https://..." },
    { label: "Règlement",   desc: "Version publique", url: "reglement.html" },
    { label: "Code pénal",  desc: "Articles + amendes", url: "code-penal.html" },
    { label: "Discord",     desc: "Serveur communautaire", url: "https://discord.gg/r7Qvk8H2c" }
  ]
};
