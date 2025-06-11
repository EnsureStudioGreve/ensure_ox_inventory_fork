if not lib then return end
local VirtualPed = {}
local clonedPed = nil
local screenOffset = { distance = 3.0, z = 0.0, x = 0.0 }

local function createPed(model)
    local hash = type(model) == 'string' and GetHashKey(model) or model
    RequestModel(hash)
    while not HasModelLoaded(hash) do Wait(1) end
    return CreatePed(4, hash, 0.0, 0.0, 0.0, 0.0, false, false)
end

local function loadAnimDict(dict)
    RequestAnimDict(dict)
    while not HasAnimDictLoaded(dict) do Wait(10) end
end

function VirtualPed.startClonedPedPreview(targetPed, emote, offset)
    targetPed = targetPed or PlayerPedId()
    screenOffset = offset or screenOffset

    if clonedPed then DeleteEntity(clonedPed) end

    clonedPed = createPed(GetEntityModel(targetPed))
    ClonePedToTarget(targetPed, clonedPed)

    SetEntityCollision(clonedPed, false, true)
    SetEntityInvincible(clonedPed, true)
    NetworkSetEntityInvisibleToNetwork(clonedPed, true)
    SetEntityCanBeDamaged(clonedPed, false)
    SetBlockingOfNonTemporaryEvents(clonedPed, true)
    FreezeEntityPosition(clonedPed, true)
    SetEntityAlpha(clonedPed, 255, false)
    SetEntityVisible(clonedPed, true, false)
    DisableIdleCamera(true)

    if emote then
        loadAnimDict(emote.dict)
        TaskPlayAnim(clonedPed, emote.dict, emote.name, 8.0, 1.0, -1, 1, 0, false, false, false)
    end

    CreateThread(function()
        while clonedPed do
            local camCoords = GetGameplayCamCoord()
            local camRot = GetGameplayCamRot(2)

            local forward = vector3(
                -math.sin(math.rad(camRot.z)) * math.cos(math.rad(camRot.x)),
                math.cos(math.rad(camRot.z)) * math.cos(math.rad(camRot.x)),
                math.sin(math.rad(camRot.x))
            )

            local right = vector3(
                math.cos(math.rad(camRot.z)),
                math.sin(math.rad(camRot.z)),
                0.0
            )

            local up = vector3(0.0, 0.0, 1.0)

            local target = camCoords + forward * screenOffset.distance
            target = target + right * screenOffset.x
            target = target + up * screenOffset.z

            SetEntityCoordsNoOffset(clonedPed, target.x, target.y, target.z, false, false, false)

            local dir = camCoords - target
            local pitch = math.deg(math.atan(dir.z / math.sqrt(dir.x^2 + dir.y^2)))
            local yaw = math.deg(math.atan(dir.y / dir.x)) - 90.0
            if dir.x < 0 then yaw = yaw + 180.0 end

            SetEntityRotation(clonedPed, pitch, 0.0, yaw, 2, true)

            SetEntityLodDist(clonedPed, 0)
            SetModelAsNoLongerNeeded(GetEntityModel(clonedPed))

            Wait(0)
        end
    end)
end

function VirtualPed.stopClonedPedPreview()
    if clonedPed then
        DisableIdleCamera(false)
        DeleteEntity(clonedPed)
        clonedPed = nil
    end
end

AddEventHandler('onResourceStop', function(resource)
    if resource == GetCurrentResourceName() then
        VirtualPed.stopClonedPedPreview()
    end
end)

return VirtualPed