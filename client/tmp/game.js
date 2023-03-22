"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayer = exports.getId = exports.world = void 0;
const msgpack_lite_1 = require("msgpack-lite");
const constants_1 = require("./constants");
const renderer_1 = require("./renderer");
const map_1 = require("./rendering/map");
const states_1 = require("./states");
const entities_1 = require("./store/entities");
const obstacles_1 = require("./store/obstacles");
const terrains_1 = require("./store/terrains");
const math_1 = require("./types/math");
const packet_1 = require("./types/packet");
const terrain_1 = require("./types/terrain");
exports.world = new terrain_1.World();
var id;
var tps = 1; // Default should be 1, so even if no TPS detail from server, we will not be dividing by 0
var username;
var address;
var player;
function getId() { return id; }
exports.getId = getId;
function getPlayer() { return player; }
exports.getPlayer = getPlayer;
var ws;
var connected = false;
function init(address) {
    return __awaiter(this, void 0, void 0, function* () {
        // Address for debugging
        ws = new WebSocket("ws://" + address);
        ws.binaryType = "arraybuffer";
        yield new Promise((res, rej) => {
            const timer = setTimeout(() => {
                rej(new Error("WebSocket timeout"));
                ws.close();
            }, constants_1.TIMEOUT);
            ws.onmessage = (event) => {
                var _a;
                const data = (0, msgpack_lite_1.decode)(new Uint8Array(event.data));
                id = data.id;
                tps = data.tps;
                exports.world = new terrain_1.World(new math_1.Vec2(data.size[0], data.size[1]), (0, terrains_1.castCorrectTerrain)(data.terrain));
                ws.send((0, msgpack_lite_1.encode)({ username, id }).buffer);
                connected = true;
                clearTimeout(timer);
                // Start animating after connection established
                (0, renderer_1.setRunning)(true);
                (0, renderer_1.animate)(0);
                (_a = document.getElementById("menu")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
                const interval = setInterval(() => {
                    if (connected)
                        ws.send((0, msgpack_lite_1.encode)(new packet_1.PingPacket()).buffer);
                    else
                        clearInterval(interval);
                }, 1000);
                ws.onmessage = (event) => {
                    const data = (0, msgpack_lite_1.decode)(new Uint8Array(event.data));
                    switch (data.type) {
                        case "game":
                            const gamePkt = data;
                            exports.world.updateEntities(gamePkt.entities);
                            exports.world.updateObstacles(gamePkt.obstacles);
                            exports.world.updateLiveCount(gamePkt.alivecount);
                            if (!player)
                                player = new entities_1.FullPlayer(gamePkt.player);
                            else
                                player.copy(gamePkt.player);
                            break;
                        case "map":
                            // This should happen once only normally
                            const mapPkt = data;
                            exports.world.terrains = mapPkt.terrains.map(ter => (0, terrains_1.castCorrectTerrain)(ter));
                            (0, map_1.initMap)(mapPkt.obstacles.map(obs => (0, obstacles_1.castCorrectObstacle)((0, obstacles_1.castMinObstacle)(obs))));
                            //Show player count once game starts
                            document.querySelector("#playercountcontainer").style.display = "block";
                            break;
                    }
                };
            };
            // Reset everything when connection closes
            ws.onclose = () => {
                var _a;
                connected = false;
                (0, renderer_1.setRunning)(false);
                (_a = document.getElementById("menu")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
                id = null;
                tps = 1;
                username = null;
                player = null;
                exports.world = new terrain_1.World();
                res(undefined);
            };
            ws.onerror = (err) => {
                console.error(err);
                rej(new Error("WebSocket error"));
            };
        });
    });
}
(_a = document.getElementById("connect")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    const errorText = document.getElementById("error-div");
    username = document.getElementById("username").value;
    address = document.getElementById("address").value;
    try {
        check(username, address);
        yield init(address);
        errorText.style.display = "none";
    }
    catch (error) {
        errorText.innerHTML = error.message;
        errorText.style.display = "block";
        return;
    }
}));
function check(username, address) {
    if (!username)
        throw new Error("Please provide a username.");
    else if (username.length > 50)
        throw new Error("Username too long! Try another username.");
    if (!address)
        throw new Error("Please provide an address.");
}
(_b = document.getElementById("disconnect")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
    var _a;
    ws.close();
    (_a = document.getElementById("settings")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
    (0, states_1.toggleMenu)();
});
window.onkeydown = (event) => {
    if (!connected || (0, states_1.isKeyPressed)(event.key))
        return;
    event.stopPropagation();
    (0, states_1.addKeyPressed)(event.key);
    const settingsElem = document.getElementById("settings");
    if (event.key == constants_1.KeyBind.MENU) {
        if ((0, states_1.isMenuHidden)())
            settingsElem === null || settingsElem === void 0 ? void 0 : settingsElem.classList.remove("hidden");
        else
            settingsElem === null || settingsElem === void 0 ? void 0 : settingsElem.classList.add("hidden");
        (0, states_1.toggleMenu)();
    }
    else if (event.key == constants_1.KeyBind.HIDE_HUD)
        (0, states_1.toggleHud)();
    else if (event.key == constants_1.KeyBind.WORLD_MAP)
        (0, states_1.toggleMap)();
    else if (event.key == constants_1.KeyBind.HIDE_MAP)
        (0, states_1.toggleMinimap)();
    else if (event.key == constants_1.KeyBind.BIG_MAP)
        (0, states_1.toggleBigMap)();
    if ((0, states_1.isMenuHidden)()) {
        const index = constants_1.movementKeys.indexOf(event.key);
        if (index >= 0)
            ws.send((0, msgpack_lite_1.encode)(new packet_1.MovementPressPacket(index)).buffer);
        else if (event.key == constants_1.KeyBind.INTERACT)
            ws.send((0, msgpack_lite_1.encode)(new packet_1.InteractPacket()).buffer);
        else if (event.key == constants_1.KeyBind.RELOAD)
            ws.send((0, msgpack_lite_1.encode)(new packet_1.ReloadWeaponPacket()).buffer);
        else if (!isNaN(parseInt(event.key)))
            ws.send((0, msgpack_lite_1.encode)(new packet_1.SwitchWeaponPacket(parseInt(event.key) + 1 - ((player === null || player === void 0 ? void 0 : player.inventory).holding || 0))));
    }
};
window.onkeyup = (event) => {
    if (!connected)
        return;
    event.stopPropagation();
    (0, states_1.removeKeyPressed)(event.key);
    const index = constants_1.movementKeys.indexOf(event.key);
    if (index >= 0)
        ws.send((0, msgpack_lite_1.encode)(new packet_1.MovementReleasePacket(index)).buffer);
};
window.onmousemove = (event) => {
    if (!connected)
        return;
    event.stopPropagation();
    ws.send((0, msgpack_lite_1.encode)(new packet_1.MouseMovePacket(event.x - window.innerWidth / 2, event.y - window.innerHeight / 2)).buffer);
};
window.onmousedown = (event) => {
    if (!connected)
        return;
    event.stopPropagation();
    (0, states_1.addMousePressed)(event.button);
    ws.send((0, msgpack_lite_1.encode)(new packet_1.MousePressPacket(event.button)));
};
window.onmouseup = (event) => {
    if (!connected)
        return;
    event.stopPropagation();
    (0, states_1.removeMousePressed)(event.button);
    ws.send((0, msgpack_lite_1.encode)(new packet_1.MouseReleasePacket(event.button)));
};
window.onwheel = (event) => {
    if (!connected || !player)
        return;
    event.stopPropagation();
    const delta = event.deltaY < 0 ? -1 : 1;
    ws.send((0, msgpack_lite_1.encode)(new packet_1.SwitchWeaponPacket(delta)));
};
// /** @param {MouseEvent} event */
// window.oncontextmenu = (event) => {
// 	if (!connected) return;
// 	ws.send(encode(new PingPacket(event.button)))
// }
//# sourceMappingURL=game.js.map