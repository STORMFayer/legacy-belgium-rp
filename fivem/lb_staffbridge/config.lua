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
