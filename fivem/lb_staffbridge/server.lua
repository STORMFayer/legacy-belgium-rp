--[[  lb_staffbridge — pont HTTP pour le panel staff web.
      Reçoit des requêtes signées du Cloudflare Worker et exécute kick / jail / warn.

      Auth : en-tête  Authorization: Bearer <lb_staff_secret>
      Convar serveur : set lb_staff_secret "une-longue-chaine-aleatoire"
--]]

local SECRET = GetConvar("lb_staff_secret", "")

if SECRET == "" then
  print("^1[lb_staffbridge] ERREUR : convar lb_staff_secret non définie — la ressource est inactive.^7")
end

-- Réponse JSON courte
local function reply(res, status, tbl)
  res.writeHead(status, { ["Content-Type"] = "application/json" })
  res.send(json.encode(tbl))
end

-- ID Discord -> source du joueur en ligne (ou nil)
local function findByDiscord(discordId)
  local wanted = "discord:" .. tostring(discordId)
  for _, src in ipairs(GetPlayers()) do
    for i = 0, GetNumPlayerIdentifiers(src) - 1 do
      if GetPlayerIdentifier(src, i) == wanted then
        return tonumber(src)
      end
    end
  end
  return nil
end

local ROUTES = {
  ["kick"] = function(body)
    local src = findByDiscord(body.discord)
    if not src then return 404, { ok = false, message = "Joueur hors ligne." } end
    DropPlayer(src, string.format(Config.KickReason, body.reason or "non précisé"))
    return 200, { ok = true, message = "Joueur expulsé." }
  end,

  ["jail"] = function(body)
    local src = findByDiscord(body.discord)
    if not src then return 404, { ok = false, message = "Joueur hors ligne." } end
    local minutes = math.max(1, math.min(1440, tonumber(body.minutes) or 0))
    local okc, err = pcall(Config.DoJail, src, minutes, body.reason or "non précisé", body.by or "staff")
    if not okc then return 500, { ok = false, message = "Erreur DoJail : " .. tostring(err) } end
    return 200, { ok = true, message = ("Prison %d min."):format(minutes) }
  end,

  ["warn"] = function(body)
    local src = findByDiscord(body.discord)
    if not src then return 404, { ok = false, message = "Joueur hors ligne." } end
    local okc, err = pcall(Config.DoWarn, src, body.reason or "non précisé", body.by or "staff")
    if not okc then return 500, { ok = false, message = "Erreur DoWarn : " .. tostring(err) } end
    return 200, { ok = true, message = "Avertissement envoyé." }
  end
}

SetHttpHandler(function(req, res)
  -- Récupère le corps puis traite
  local function handle(bodyStr)
    if SECRET == "" then return reply(res, 503, { ok = false, message = "Ressource non configurée." }) end

    local auth = req.headers["Authorization"] or req.headers["authorization"] or ""
    if auth ~= ("Bearer " .. SECRET) then
      return reply(res, 401, { ok = false, message = "Non autorisé." })
    end

    local path = (req.path or "/"):gsub("^/", ""):gsub("/$", "")
    -- path arrive sous la forme "lb_staffbridge/kick" ou "kick" selon la version
    path = path:match("([^/]+)$") or path
    local route = ROUTES[path]
    if not route then return reply(res, 404, { ok = false, message = "Route inconnue." }) end

    local ok, body = pcall(json.decode, bodyStr or "{}")
    if not ok or type(body) ~= "table" then body = {} end

    local status, out = route(body)
    return reply(res, status, out)
  end

  if req.method == "POST" then
    req.setDataHandler(function(data) handle(data) end)
  else
    reply(res, 405, { ok = false, message = "POST uniquement." })
  end
end)

print("^2[lb_staffbridge] prêt.^7")
