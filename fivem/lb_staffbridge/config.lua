Config = {}

-- Motif affiché au joueur expulsé (%s = motif fourni par le staff).
Config.KickReason = "Expulsé par le staff — %s"

-- =============================================================================
--  À ADAPTER À TON SERVEUR ESX
--  Ces deux fonctions sont appelées côté serveur. `src` = ID du joueur en ligne.
-- =============================================================================

-- JAIL — mise en prison pour `minutes` minutes.
function Config.DoJail(src, minutes, reason, by)
  -- ▼ esx_jail classique (durée en secondes) :
  TriggerEvent("esx_jail:sendToJail", src, minutes * 60)

  -- ▼ Autres scripts fréquents — décommente celui qui correspond :
  -- exports["qbx_jail"]:JailPlayer(src, minutes)                       -- qbx_jail
  -- TriggerClientEvent("prison:client:jail", src, minutes)            -- certains scripts prison
  -- exports["esx-qbjail"]:JailPlayer(src, minutes, reason)            -- esx-qbjail

  TriggerClientEvent("chat:addMessage", src, {
    color = { 200, 40, 40 },
    args = { "STAFF", ("Prison %d min — %s"):format(minutes, reason) }
  })
end

-- WARN — avertissement en jeu.
function Config.DoWarn(src, reason, by)
  -- ▼ Par défaut : message chat au joueur. Branche ici ton script de warn si tu en as un.
  -- exports["snipe_warns"]:AddWarn(src, by, reason)
  TriggerClientEvent("chat:addMessage", src, {
    color = { 240, 190, 40 },
    args = { "AVERTISSEMENT", reason }
  })
end

-- =============================================================================
--  txAdmin
--  txAdmin ne fournit PAS d'API entrante : on ne peut pas lui demander de kick /
--  warn depuis l'extérieur. Ses seules intégrations sont des ÉVÉNEMENTS qu'il émet
--  (txAdmin:events:playerKicked, ...playerWarned, ...) qu'un script peut écouter.
--  -> lb_staffbridge fait le kick/jail/warn directement dans le jeu (effet identique
--     pour le joueur ; l'action est tracée dans le journal du panel).
--  Si tu veux que l'action apparaisse AUSSI dans l'historique txAdmin, tu peux, ci-
--  dessous, déclencher la commande console txAdmin correspondante :
-- =============================================================================
-- function Config.MirrorToTxAdmin(kind, src, reason, by)
--   -- ex. : ExecuteCommand(("txaWarn %d \"%s\""):format(src, reason))
-- end
