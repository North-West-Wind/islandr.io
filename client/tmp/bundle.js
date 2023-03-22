(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPENSURVIV_DATA = exports.GunColor = exports.GLOBAL_UNIT_MULTIPLIER = exports.TIMEOUT = exports.MINIMAP_SIZE = exports.GRID_INTERVAL = exports.movementKeys = exports.KeyBind = exports.CommonNumber = exports.CommonAngle = void 0;
var CommonAngle;
(function (CommonAngle) {
    CommonAngle[CommonAngle["PI_FOUR"] = Math.PI / 4] = "PI_FOUR";
    CommonAngle[CommonAngle["PI_TWO"] = Math.PI / 2] = "PI_TWO";
})(CommonAngle = exports.CommonAngle || (exports.CommonAngle = {}));
var CommonNumber;
(function (CommonNumber) {
    CommonNumber[CommonNumber["SIN45"] = Math.sin(CommonAngle.PI_FOUR)] = "SIN45";
})(CommonNumber = exports.CommonNumber || (exports.CommonNumber = {}));
// More like configuration
var KeyBind;
(function (KeyBind) {
    KeyBind["MENU"] = "Escape";
    KeyBind["HIDE_HUD"] = "F1";
    KeyBind["WORLD_MAP"] = "g";
    KeyBind["HIDE_MAP"] = "z";
    KeyBind["BIG_MAP"] = "v";
    KeyBind["RIGHT"] = "d";
    KeyBind["UP"] = "w";
    KeyBind["LEFT"] = "a";
    KeyBind["DOWN"] = "s";
    KeyBind["INTERACT"] = "f";
    KeyBind["MELEE"] = "e";
    KeyBind["LAST_USED"] = "q";
    KeyBind["RELOAD"] = "r";
})(KeyBind = exports.KeyBind || (exports.KeyBind = {}));
exports.movementKeys = [KeyBind.RIGHT, KeyBind.UP, KeyBind.LEFT, KeyBind.DOWN].map(k => k);
exports.GRID_INTERVAL = 20;
exports.MINIMAP_SIZE = 100;
exports.TIMEOUT = 10000;
// Translate original surviv.io game units to suit this one
exports.GLOBAL_UNIT_MULTIPLIER = 0.5;
var GunColor;
(function (GunColor) {
    GunColor[GunColor["YELLOW"] = 0] = "YELLOW";
    GunColor[GunColor["RED"] = 1] = "RED";
    GunColor[GunColor["BLUE"] = 2] = "BLUE";
    GunColor[GunColor["GREEN"] = 3] = "GREEN";
    GunColor[GunColor["BLACK"] = 4] = "BLACK";
    GunColor[GunColor["OLIVE"] = 5] = "OLIVE";
    GunColor[GunColor["ORANGE"] = 6] = "ORANGE";
    GunColor[GunColor["PURPLE"] = 7] = "PURPLE";
    GunColor[GunColor["TEAL"] = 8] = "TEAL";
    GunColor[GunColor["BROWN"] = 9] = "BROWN";
    GunColor[GunColor["PINK"] = 10] = "PINK";
    GunColor[GunColor["PURE_BLACK"] = 11] = "PURE_BLACK";
    GunColor[GunColor["CURSED"] = 12] = "CURSED";
    GunColor[GunColor["BUGLE"] = 13] = "BUGLE";
})(GunColor = exports.GunColor || (exports.GunColor = {}));
exports.OPENSURVIV_DATA = "https://raw.githubusercontent.com/North-West-Wind/opensurviv-data/main";

},{}],2:[function(require,module,exports){
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
                document.querySelector("#playercountcontainer").style.display = "none";
                id = null;
                tps = 1;
                username = null;
                player = null;
                exports.world = new terrain_1.World();
                res(undefined);
                //remove playercount
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

},{"./constants":1,"./renderer":3,"./rendering/map":5,"./states":7,"./store/entities":15,"./store/obstacles":23,"./store/terrains":28,"./types/math":38,"./types/packet":40,"./types/terrain":41,"msgpack-lite":44}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.animate = exports.setRunning = void 0;
const constants_1 = require("./constants");
const game_1 = require("./game");
const hud_1 = require("./rendering/hud");
const map_1 = require("./rendering/map");
const states_1 = require("./states");
const utils_1 = require("./utils");
const prompt_1 = require("./rendering/prompt");
const canvas = document.getElementById("game");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
var running = false;
function setRunning(r) { running = r; }
exports.setRunning = setRunning;
var lastTime;
const ctx = canvas.getContext("2d");
function animate(currentTime) {
    if (!lastTime)
        lastTime = currentTime;
    const elapsed = currentTime - lastTime;
    lastTime = currentTime;
    // Don't panic when drawing error
    try {
        // Fill canvas with default terrain color
        ctx.fillStyle = game_1.world.defaultTerrain.colorToHex();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const player = (0, game_1.getPlayer)();
        if (player) {
            // 1 unit to x pixels
            const scale = Math.max(canvas.width, canvas.height) / (20 + 20 * player.scope);
            const size = game_1.world.size;
            const x = canvas.width / 2 - player.position.x * scale;
            const y = canvas.height / 2 - player.position.y * scale;
            const width = size.x * scale;
            const height = size.y * scale;
            // Draw terrains
            // Do negative layer first
            game_1.world.terrains.filter((terrain) => !!terrain["renderLayerN1"]).forEach(terrain => terrain.renderLayerN1(player, canvas, ctx, scale));
            // Do layer zero
            game_1.world.terrains.forEach(terrain => terrain.render(player, canvas, ctx, scale));
            // Draw grid lines
            ctx.globalAlpha = 0.2;
            for (let ii = 0; ii <= size.x; ii += constants_1.GRID_INTERVAL)
                (0, utils_1.lineBetween)(ctx, canvas.width / 2 - (player.position.x - ii) * scale, Math.max(y, 0), canvas.width / 2 - (player.position.x - ii) * scale, Math.min(y + height, canvas.height));
            for (let ii = 0; ii <= size.y; ii += constants_1.GRID_INTERVAL)
                (0, utils_1.lineBetween)(ctx, Math.max(x, 0), canvas.height / 2 - (player.position.y - ii) * scale, Math.min(x + width, canvas.width), canvas.height / 2 - (player.position.y - ii) * scale);
            ctx.globalAlpha = 1;
            // Draw obstacles and entities
            var combined = [];
            combined = combined.concat(game_1.world.entities, game_1.world.obstacles);
            combined.push(player);
            // Sort them by zIndex. Higher = Above
            combined = combined.sort((a, b) => a.zIndex - b.zIndex);
            // Do negative layer first
            combined.filter((entOrObs) => !!entOrObs["renderLayerN1"]).forEach(entOrObs => entOrObs.renderLayerN1(player, canvas, ctx, scale));
            // Do layer zero
            combined.forEach(thing => {
                thing.render(player, canvas, ctx, scale);
                thing.renderTick(elapsed);
            });
            // Fill areas outside the border
            ctx.fillStyle = game_1.world.defaultTerrain.colorToHex();
            // The corners: top-left, top-right, bottom-left, bottom-right
            ctx.fillRect(0, 0, canvas.width / 2 - player.position.x * scale, canvas.height / 2 - player.position.y * scale);
            ctx.fillRect(canvas.width, 0, (game_1.world.size.x - player.position.x) * scale - canvas.width / 2, canvas.height / 2 - player.position.y * scale);
            ctx.fillRect(0, canvas.height, canvas.width / 2 - player.position.x * scale, (game_1.world.size.y - player.position.y) * scale - canvas.height / 2);
            ctx.fillRect(canvas.width, canvas.height, (game_1.world.size.x - player.position.x) * scale - canvas.width / 2, (game_1.world.size.y - player.position.y) * scale - canvas.height / 2);
            // The sides: top, bottom, left, right
            ctx.fillRect(canvas.width / 2 - player.position.x * scale, 0, game_1.world.size.x * scale, canvas.height / 2 - player.position.y * scale);
            ctx.fillRect(canvas.width / 2 - player.position.x * scale, canvas.height, game_1.world.size.x * scale, (game_1.world.size.y - player.position.y) * scale - canvas.height / 2);
            ctx.fillRect(0, canvas.height / 2 - player.position.y * scale, canvas.width / 2 - player.position.x * scale, game_1.world.size.y * scale);
            ctx.fillRect(canvas.width, canvas.height / 2 - player.position.y * scale, (game_1.world.size.x - player.position.x) * scale - canvas.width / 2, game_1.world.size.y * scale);
            // Draw world border
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = scale / 4;
            ctx.strokeRect(x, y, width, height);
            // Draw overlays
            if (!(0, states_1.isHudHidden)())
                (0, hud_1.drawHud)(player, canvas, ctx);
            if ((0, states_1.isMapOpened)())
                (0, map_1.drawMap)(canvas, ctx);
            else if (!(0, states_1.isMapHidden)())
                (0, map_1.drawMinimap)(player, canvas, ctx);
            if (player.canInteract)
                (0, prompt_1.drawPrompt)(canvas, ctx, scale);
        }
    }
    catch (err) {
        console.error(err);
    }
    if (running)
        requestAnimationFrame(animate);
}
exports.animate = animate;

},{"./constants":1,"./game":2,"./rendering/hud":4,"./rendering/map":5,"./rendering/prompt":6,"./states":7,"./utils":43}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawHud = void 0;
const weapon_1 = require("../types/weapon");
const utils_1 = require("../utils");
// Calls all the HUD related functions
function drawHud(player, canvas, ctx) {
    drawHealth(player, canvas, ctx);
    drawGunAmmo(player, canvas, ctx);
    drawInventory(player, canvas, ctx);
}
exports.drawHud = drawHud;
// Draws the player's health
function drawHealth(player, canvas, ctx) {
    const width = canvas.width / 4;
    const height = canvas.height / 20;
    const padding = Math.min(canvas.width, canvas.height) / 100;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;
    ctx.fillStyle = "#000000";
    ctx.globalAlpha = 0.2;
    (0, utils_1.roundRect)(ctx, (canvas.width - width) / 2, canvas.height - height - padding, width, height, padding / 2);
    if (player.health == player.maxHealth)
        ctx.fillStyle = "#ccc";
    else if (player.health / player.maxHealth < 0.8)
        ctx.fillStyle = "#fdd";
    else if (player.health / player.maxHealth < 0.25)
        ctx.fillStyle = "#daa";
    else
        ctx.fillStyle = "#fff";
    ctx.globalAlpha = 1;
    (0, utils_1.roundRect)(ctx, (canvas.width - innerWidth) / 2, canvas.height - height, innerWidth * player.health / player.maxHealth, innerHeight, padding / 2);
}
// Draws the player's inventory (temporary)
function drawInventory(player, canvas, ctx) {
    ctx.fillStyle = "#fff";
    ctx.font = `${canvas.height / 27}px Arial`;
    ctx.textBaseline = "bottom";
    ctx.textAlign = "end";
    const inventory = player.inventory;
    var str = "";
    for (let ii = 0; ii < inventory.weapons.length; ii++) {
        if (!inventory.weapons[ii])
            continue;
        if (ii != 0)
            str += " ";
        if (ii == inventory.holding)
            str += `[${inventory.weapons[ii].name}]`;
        else
            str += inventory.weapons[ii].name;
    }
    ctx.fillText(str, canvas.width * 191 / 192, canvas.height - canvas.width / 192);
}
// Draws the ammo amount inside and outside the gun
function drawGunAmmo(player, canvas, ctx) {
    var _a;
    if (((_a = player.inventory.getWeapon()) === null || _a === void 0 ? void 0 : _a.type) != weapon_1.WeaponType.GUN)
        return;
    const weapon = player.inventory.getWeapon();
    const size = canvas.height / 27;
    const smallSize = size / 1.5;
    ctx.font = `${size}px Arial bold`;
    ctx.textBaseline = "bottom";
    ctx.textAlign = "center";
    const yOffset = canvas.height / 20 + Math.min(canvas.width, canvas.height) / 50;
    const padding = Math.min(canvas.width, canvas.height) / 200;
    const width = canvas.width / 20;
    ctx.fillStyle = "#000";
    ctx.globalAlpha = 0.6;
    (0, utils_1.roundRect)(ctx, (canvas.width - width) / 2, canvas.height - yOffset - padding * 2 - size, width, size + padding * 2, canvas.height / 108);
    (0, utils_1.roundRect)(ctx, (canvas.width - width) / 2 + width + padding, canvas.height - yOffset - padding * 2 - smallSize, width, smallSize + padding * 2, canvas.height / 108);
    if (!weapon.magazine)
        ctx.fillStyle = "#ff0000";
    else
        ctx.fillStyle = "#fff";
    ctx.globalAlpha = 1;
    ctx.fillText(`${weapon.magazine}`, canvas.width / 2, canvas.height - yOffset - padding);
    ctx.font = `${smallSize}px Arial bold`;
    const ammos = player.inventory.ammos[weapon.color];
    if (!ammos)
        ctx.fillStyle = "#ff0000";
    else
        ctx.fillStyle = "#fff";
    ctx.fillText(`${ammos}`, (canvas.width - width) / 2 + width * 1.5 + padding, canvas.height - yOffset - padding);
}

},{"../types/weapon":42,"../utils":43}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawMinimap = exports.drawMap = exports.initMap = void 0;
const constants_1 = require("../constants");
const game_1 = require("../game");
const states_1 = require("../states");
const utils_1 = require("../utils");
const mapCanvas = document.createElement("canvas");
var mapCtx;
var constScale;
const tmpCanvas = document.createElement("canvas");
// Initialize the map when MapPacket is received
function initMap(obstacles) {
    // Determine the dimension
    const size = game_1.world.size;
    const maxSide = Math.max(size.x, size.y);
    const minScreen = Math.min(window.screen.availWidth, window.screen.availHeight);
    mapCanvas.width = minScreen * size.x / maxSide;
    mapCanvas.height = minScreen * size.y / maxSide;
    constScale = minScreen / maxSide;
    const scale = mapCanvas.width / game_1.world.size.x;
    mapCtx = mapCanvas.getContext("2d");
    // Fill map background
    mapCtx.fillStyle = game_1.world.defaultTerrain.colorToHex();
    mapCtx.fillRect(0, 0, mapCanvas.width, mapCanvas.height);
    // Draw terrains on map, -ve layer -> layer 0
    game_1.world.terrains.filter((terrain) => !!terrain["renderMapLayerN1"]).forEach(terrain => terrain.renderMapLayerN1(mapCanvas, mapCtx, scale));
    game_1.world.terrains.forEach(terrain => terrain.renderMap(mapCanvas, mapCtx, scale));
    // Draw the grid
    mapCtx.strokeStyle = "#000000";
    mapCtx.lineWidth = 1;
    mapCtx.globalAlpha = 0.2;
    for (let ii = 0; ii <= size.x; ii += constants_1.GRID_INTERVAL)
        (0, utils_1.lineBetween)(mapCtx, ii * minScreen / maxSide, 0, ii * minScreen / maxSide, mapCanvas.height);
    for (let ii = 0; ii <= size.y; ii += constants_1.GRID_INTERVAL)
        (0, utils_1.lineBetween)(mapCtx, 0, ii * minScreen / maxSide, mapCanvas.width, ii * minScreen / maxSide);
    mapCtx.globalAlpha = 1;
    // Draw obstacles on map, -ve layer -> layer 0
    obstacles = obstacles.sort((a, b) => a.zIndex - b.zIndex);
    obstacles.filter((obstacle) => !!obstacle["renderMapLayerN1"]).forEach(obstacle => obstacle.renderMapLayerN1(mapCanvas, mapCtx, scale));
    obstacles.forEach(obstacle => obstacle.renderMap(mapCanvas, mapCtx, scale));
}
exports.initMap = initMap;
// Draw world map
function drawMap(canvas, ctx) {
    // Determine the dimension
    const scaleByWidth = canvas.width / mapCanvas.width;
    const scaleByHeight = canvas.height / mapCanvas.height;
    var width, height, scale;
    if (scaleByHeight * mapCanvas.width > canvas.width) {
        width = canvas.width;
        height = scaleByWidth * mapCanvas.height;
        scale = canvas.width / game_1.world.size.x;
    }
    else {
        width = scaleByHeight * mapCanvas.width;
        height = canvas.height;
        scale = canvas.height / game_1.world.size.y;
    }
    // Draw pre-rendered map
    ctx.drawImage(mapCanvas, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    // Draw border around map
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect((canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    // Draw player icon
    const player = (0, game_1.getPlayer)();
    ctx.fillStyle = "#F8C675";
    (0, utils_1.circleFromCenter)(ctx, (canvas.width - width) / 2 + player.position.x * scale, (canvas.height - height) / 2 + player.position.y * scale, 8);
    (0, utils_1.circleFromCenter)(ctx, (canvas.width - width) / 2 + player.position.x * scale, (canvas.height - height) / 2 + player.position.y * scale, 12, false, true);
}
exports.drawMap = drawMap;
// Draw minimap
function drawMinimap(player, canvas, ctx) {
    var _a;
    // Determine the dimension
    const size = constants_1.MINIMAP_SIZE * constScale * ((0, states_1.isBigMap)() ? 1.5 : 1);
    const x = player.position.x * constScale - size / 2;
    const y = player.position.y * constScale - size / 2;
    const imageData = mapCtx.getImageData(x, y, size, size);
    tmpCanvas.width = tmpCanvas.height = size;
    (_a = tmpCanvas.getContext("2d")) === null || _a === void 0 ? void 0 : _a.putImageData(imageData, 0, 0);
    const margin = canvas.width / 100;
    const side = canvas.width / (8 / ((0, states_1.isBigMap)() ? 1.5 : 1));
    // Fill map background
    ctx.fillStyle = game_1.world.defaultTerrain.colorToHex();
    ctx.fillRect(margin, canvas.height - margin - side, side, side);
    // Draw pre-rendered map
    ctx.drawImage(tmpCanvas, margin, canvas.height - margin - side, side, side);
    // Draw border around map
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, canvas.height - margin - side, side, side);
    // Draw the player icon
    ctx.fillStyle = "#F8C675";
    (0, utils_1.circleFromCenter)(ctx, margin + side / 2, canvas.height - margin - side / 2, 8);
    (0, utils_1.circleFromCenter)(ctx, margin + side / 2, canvas.height - margin - side / 2, 12, false, true);
}
exports.drawMinimap = drawMinimap;

},{"../constants":1,"../game":2,"../states":7,"../utils":43}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawPrompt = void 0;
const constants_1 = require("../constants");
const utils_1 = require("../utils");
function drawPrompt(canvas, ctx, scale) {
    drawInteract(canvas, ctx, scale);
}
exports.drawPrompt = drawPrompt;
function drawInteract(canvas, ctx, scale) {
    const size = canvas.height / 27;
    ctx.font = `${size}px Arial bold`;
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    const metric = ctx.measureText(`[${constants_1.KeyBind.INTERACT.toUpperCase()}] Interact`);
    const yOffset = 1.5 * scale;
    const padding = 0.25 * scale;
    const width = metric.width + padding * 2;
    ctx.fillStyle = "#000";
    ctx.globalAlpha = 0.6;
    (0, utils_1.roundRect)(ctx, (canvas.width - width) / 2, canvas.height / 2 + yOffset, width, size + 2 * padding, canvas.height / 108);
    ctx.fillStyle = "#fff";
    ctx.globalAlpha = 1;
    ctx.fillText("[F] Interact", canvas.width / 2, canvas.height / 2 + padding + yOffset);
}

},{"../constants":1,"../utils":43}],7:[function(require,module,exports){
"use strict";
// This file records the state of things
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleBigMap = exports.isBigMap = exports.toggleMinimap = exports.isMapHidden = exports.toggleMap = exports.isMapOpened = exports.toggleHud = exports.isHudHidden = exports.toggleMenu = exports.isMenuHidden = exports.removeMousePressed = exports.addMousePressed = exports.isMousePressed = exports.removeKeyPressed = exports.addKeyPressed = exports.isKeyPressed = void 0;
const keyPressed = new Map();
function isKeyPressed(key) { return !!keyPressed.get(key); }
exports.isKeyPressed = isKeyPressed;
function addKeyPressed(key) { keyPressed.set(key, true); }
exports.addKeyPressed = addKeyPressed;
function removeKeyPressed(key) { keyPressed.delete(key); }
exports.removeKeyPressed = removeKeyPressed;
const mousePressed = new Map();
function isMousePressed(button) { return !!mousePressed.get(button); }
exports.isMousePressed = isMousePressed;
function addMousePressed(button) { mousePressed.set(button, true); }
exports.addMousePressed = addMousePressed;
function removeMousePressed(button) { mousePressed.delete(button); }
exports.removeMousePressed = removeMousePressed;
var menuHidden = true;
function isMenuHidden() { return menuHidden; }
exports.isMenuHidden = isMenuHidden;
function toggleMenu() { menuHidden = !menuHidden; }
exports.toggleMenu = toggleMenu;
var hudHidden = false;
function isHudHidden() { return hudHidden; }
exports.isHudHidden = isHudHidden;
function toggleHud() { hudHidden = !hudHidden; }
exports.toggleHud = toggleHud;
var mapOpened = false;
function isMapOpened() { return mapOpened; }
exports.isMapOpened = isMapOpened;
function toggleMap() { mapOpened = !mapOpened; }
exports.toggleMap = toggleMap;
var mapHidden = false;
function isMapHidden() { return mapHidden; }
exports.isMapHidden = isMapHidden;
function toggleMinimap() { mapHidden = !mapHidden; }
exports.toggleMinimap = toggleMinimap;
var bigMap = false;
function isBigMap() { return bigMap; }
exports.isBigMap = isBigMap;
function toggleBigMap() { bigMap = !bigMap; }
exports.toggleBigMap = toggleBigMap;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const animation_1 = require("../../types/animation");
const math_1 = require("../../types/math");
const LEFT_FIST = new animation_1.DefinedAnimation("left_fist", [new math_1.Vec2(0, -1), math_1.Vec2.ONE, new math_1.Vec2(0, -1)], Array(3).fill(math_1.Vec2.ONE), [0, 0.5, 1], 250);
const RIGHT_FIST = new animation_1.DefinedAnimation("right_fist", [new math_1.Vec2(0, 1), math_1.Vec2.ONE, new math_1.Vec2(0, 1)], Array(3).fill(math_1.Vec2.ONE), [0, 0.5, 1], 250);
function init() {
    _1.DEFINED_ANIMATIONS.set(LEFT_FIST.id, LEFT_FIST);
    _1.DEFINED_ANIMATIONS.set(RIGHT_FIST.id, RIGHT_FIST);
}
exports.default = init;

},{".":10,"../../types/animation":36,"../../types/math":38}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const animation_1 = require("../../types/animation");
const math_1 = require("../../types/math");
const SMALL_RECOIL = new animation_1.DefinedAnimation("small_recoil", [new math_1.Vec2(-0.1, 0), math_1.Vec2.ZERO], Array(2).fill(math_1.Vec2.ONE), [0, 1], 100);
const MEDIUM_RECOIL = new animation_1.DefinedAnimation("medium_recoil", [new math_1.Vec2(-0.25, 0), math_1.Vec2.ZERO], Array(2).fill(math_1.Vec2.ONE), [0, 1], 150);
const LARGE_RECOIL = new animation_1.DefinedAnimation("large_recoil", [new math_1.Vec2(-0.5, 0), math_1.Vec2.ZERO], Array(2).fill(math_1.Vec2.ONE), [0, 1], 200);
function init() {
    _1.DEFINED_ANIMATIONS.set(SMALL_RECOIL.id, SMALL_RECOIL);
    _1.DEFINED_ANIMATIONS.set(MEDIUM_RECOIL.id, MEDIUM_RECOIL);
    _1.DEFINED_ANIMATIONS.set(LARGE_RECOIL.id, LARGE_RECOIL);
}
exports.default = init;

},{".":10,"../../types/animation":36,"../../types/math":38}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFINED_ANIMATIONS = void 0;
const fists_1 = require("./fists");
const guns_1 = require("./guns");
exports.DEFINED_ANIMATIONS = new Map();
(0, fists_1.default)();
(0, guns_1.default)();

},{"./fists":8,"./guns":9}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const constants_1 = require("../../constants");
const entity_1 = require("../../types/entity");
class AmmoSupplier {
    create(minEntity) {
        return new Ammo(minEntity);
    }
}
// Refer to gun color for the order
// Inner order: frame, outer, inner
const COLOR_SCHEME = [
    ["#332300", "#b37a00", "#f2a500"],
    ["#4c0000", "#b30000", "#f20000"],
    ["#002c6d", "#0048b3", "#0061f2"],
    ["#013d00", "#026f00", "#039600"],
    ["#111111", "#111111", "#006400"],
];
class Ammo extends entity_1.Entity {
    constructor(minEntity) {
        super(minEntity);
        this.type = Ammo.TYPE;
        this.zIndex = 8;
        this.copy(minEntity);
    }
    copy(minEntity) {
        super.copy(minEntity);
        this.amount = minEntity.amount;
        this.color = minEntity.color;
    }
    render(you, canvas, ctx, scale) {
        const relative = this.position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        ctx.scale(scale, scale);
        const length = this.hitbox.comparable * Math.sin(constants_1.CommonAngle.PI_TWO);
        ctx.strokeStyle = COLOR_SCHEME[this.color][0];
        ctx.lineWidth = 0.2;
        ctx.fillStyle = COLOR_SCHEME[this.color][1];
        ctx.fillRect(-length / 2, -length / 2, length, length);
        ctx.strokeRect(-length / 2, -length / 2, length, length);
        ctx.fillStyle = COLOR_SCHEME[this.color][2];
        ctx.fillRect(-length / 8, -length / 4, length / 3, length / 3);
        ctx.resetTransform();
    }
}
exports.default = Ammo;
Ammo.TYPE = "ammo";
(() => {
    _1.ENTITY_SUPPLIERS.set(Ammo.TYPE, new AmmoSupplier());
})();

},{".":15,"../../constants":1,"../../types/entity":37}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const textures_1 = require("../../textures");
const entity_1 = require("../../types/entity");
const utils_1 = require("../../utils");
class BulletSupplier {
    create(minEntity) {
        return new Bullet(minEntity);
    }
}
class Bullet extends entity_1.Entity {
    constructor(minEntity) {
        super(minEntity);
        this.type = Bullet.TYPE;
        this.copy(minEntity);
    }
    copy(minEntity) {
        super.copy(minEntity);
        this.tracer = minEntity.tracer;
    }
    render(you, canvas, ctx, scale) {
        var _a;
        const relative = this.position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(this.direction.angle());
        ctx.scale(scale, scale);
        ctx.fillStyle = `#${((_a = (0, textures_1.getTracerColor)(this.tracer.type)) === null || _a === void 0 ? void 0 : _a.color.regular) || "000"}`;
        const gradient = ctx.createLinearGradient(0, 0, -this.tracer.length * 2, 0);
        gradient.addColorStop(0, ctx.fillStyle + "ff");
        gradient.addColorStop(1, ctx.fillStyle + "00");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.tracer.width * 2;
        (0, utils_1.lineBetween)(ctx, -this.tracer.length * 2, 0, 0, 0);
        (0, utils_1.circleFromCenter)(ctx, 0, 0, this.tracer.width, true);
        ctx.resetTransform();
    }
}
exports.default = Bullet;
Bullet.TYPE = "bullet";
(() => {
    _1.ENTITY_SUPPLIERS.set(Bullet.TYPE, new BulletSupplier());
})();

},{".":15,"../../textures":35,"../../types/entity":37,"../../utils":43}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const textures_1 = require("../../textures");
const entity_1 = require("../../types/entity");
const utils_1 = require("../../utils");
const images = new Map();
class GrenadeSupplier {
    create(minEntity) {
        return new Grenade(minEntity);
    }
}
class Grenade extends entity_1.Entity {
    constructor(minEntity) {
        super(minEntity);
        this.type = Grenade.TYPE;
        this.copy(minEntity);
    }
    copy(minEntity) {
        super.copy(minEntity);
        this.name = minEntity.name;
    }
    render(you, canvas, ctx, scale) {
        const relative = this.position.addVec(you.position.inverse());
        const radius = scale * this.hitbox.comparable;
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        ctx.strokeStyle = "#000";
        ctx.lineWidth = scale * 0.1;
        (0, utils_1.circleFromCenter)(ctx, 0, 0, radius, false, true);
        ctx.fillStyle = "#00000066"; // <- alpha/opacity
        (0, utils_1.circleFromCenter)(ctx, 0, 0, radius, true, false);
        const img = (0, textures_1.getWeaponImage)(this.name);
        if (!(img === null || img === void 0 ? void 0 : img.loaded)) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#fff";
            ctx.font = `${canvas.height / 54}px Arial`;
            ctx.fillText(this.name, 0, 0);
        }
        else {
            ctx.drawImage(img, -0.6 * radius, -0.6 * radius, 1.2 * radius, 1.2 * radius);
        }
        ctx.resetTransform();
    }
}
exports.default = Grenade;
Grenade.TYPE = "grenade";
(() => {
    _1.ENTITY_SUPPLIERS.set(Grenade.TYPE, new GrenadeSupplier());
})();

},{".":15,"../../textures":35,"../../types/entity":37,"../../utils":43}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const textures_1 = require("../../textures");
const entity_1 = require("../../types/entity");
const utils_1 = require("../../utils");
class GunSupplier {
    create(minEntity) {
        return new Gun(minEntity);
    }
}
const HEX_COLORS = ["#F2A500", "#F20000", "#0061F2", "#039700"];
class Gun extends entity_1.Entity {
    constructor(minEntity) {
        super(minEntity);
        this.type = Gun.TYPE;
        this.zIndex = 8;
        this.copy(minEntity);
    }
    copy(minEntity) {
        super.copy(minEntity);
        this.name = minEntity.name;
        this.color = minEntity.color;
    }
    render(you, canvas, ctx, scale) {
        const relative = this.position.addVec(you.position.inverse());
        const radius = scale * this.hitbox.comparable;
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        ctx.strokeStyle = HEX_COLORS[this.color];
        ctx.lineWidth = scale * 0.25;
        (0, utils_1.circleFromCenter)(ctx, 0, 0, radius, false, true);
        ctx.fillStyle = HEX_COLORS[this.color] + "66"; // <- alpha/opacity
        (0, utils_1.circleFromCenter)(ctx, 0, 0, radius, true, false);
        const img = (0, textures_1.getWeaponImage)(this.name);
        if (!(img === null || img === void 0 ? void 0 : img.loaded)) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#fff";
            ctx.font = `${canvas.height / 54}px Arial`;
            ctx.fillText(this.name, 0, 0);
        }
        else {
            ctx.drawImage(img, -0.7 * radius, -0.7 * radius, 1.4 * radius, 1.4 * radius);
        }
        ctx.resetTransform();
    }
}
exports.default = Gun;
Gun.TYPE = "gun";
(() => {
    _1.ENTITY_SUPPLIERS.set(Gun.TYPE, new GunSupplier());
})();

},{".":15,"../../textures":35,"../../types/entity":37,"../../utils":43}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.castCorrectEntity = exports.FullPlayer = exports.PartialPlayer = exports.Player = exports.Gun = exports.Grenade = exports.Bullet = exports.Ammo = exports.ENTITY_SUPPLIERS = void 0;
const entity_1 = require("../../types/entity");
exports.ENTITY_SUPPLIERS = new Map();
var ammo_1 = require("./ammo");
Object.defineProperty(exports, "Ammo", { enumerable: true, get: function () { return ammo_1.default; } });
var bullet_1 = require("./bullet");
Object.defineProperty(exports, "Bullet", { enumerable: true, get: function () { return bullet_1.default; } });
var grenade_1 = require("./grenade");
Object.defineProperty(exports, "Grenade", { enumerable: true, get: function () { return grenade_1.default; } });
var gun_1 = require("./gun");
Object.defineProperty(exports, "Gun", { enumerable: true, get: function () { return gun_1.default; } });
var player_1 = require("./player");
Object.defineProperty(exports, "Player", { enumerable: true, get: function () { return player_1.default; } });
var player_2 = require("./player");
Object.defineProperty(exports, "PartialPlayer", { enumerable: true, get: function () { return player_2.PartialPlayer; } });
Object.defineProperty(exports, "FullPlayer", { enumerable: true, get: function () { return player_2.FullPlayer; } });
// This still need hard-coding unfortunately
function castCorrectEntity(minEntity) {
    var _a;
    return ((_a = exports.ENTITY_SUPPLIERS.get(minEntity.type)) === null || _a === void 0 ? void 0 : _a.create(minEntity)) || new entity_1.DummyEntity(minEntity);
}
exports.castCorrectEntity = castCorrectEntity;

},{"../../types/entity":37,"./ammo":11,"./bullet":12,"./grenade":13,"./gun":14,"./player":16}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullPlayer = exports.PartialPlayer = void 0;
const _1 = require(".");
const entity_1 = require("../../types/entity");
const weapon_1 = require("../../types/weapon");
const utils_1 = require("../../utils");
const weapons_1 = require("../weapons");
const deathImg = Object.assign(new Image(), { loaded: false });
deathImg.onload = () => deathImg.loaded = true;
deathImg.src = "assets/images/game/entities/death.svg";
class PlayerSupplier {
    create(minEntity) {
        return new PartialPlayer(minEntity);
    }
}
class Player extends entity_1.Entity {
    constructor(minEntity) {
        super(minEntity);
        this.type = Player.TYPE;
        this.zIndex = 9;
        this.copy(minEntity);
    }
    copy(minEntity) {
        super.copy(minEntity);
        this.username = minEntity.username;
        if (typeof minEntity.inventory.holding === "number") {
            const inventory = minEntity.inventory;
            this.inventory = new entity_1.Inventory(inventory.holding, inventory.slots, inventory.weapons.map(w => w ? (0, weapons_1.castCorrectWeapon)(w, w.type == weapon_1.WeaponType.GUN ? w.magazine : 0) : w), inventory.ammos, inventory.utilities);
        }
        else
            this.inventory = new entity_1.PartialInventory(minEntity.inventory);
        if (this.despawn)
            this.zIndex = 7;
    }
    render(you, canvas, ctx, scale) {
        const relative = this.position.addVec(you.position.inverse());
        const radius = scale * this.hitbox.comparable;
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        if (!this.despawn) {
            ctx.rotate(this.direction.angle());
            ctx.fillStyle = "#F8C675";
            (0, utils_1.circleFromCenter)(ctx, 0, 0, radius);
            // We will leave the transform for the weapon
            // If player is holding nothing, render fist
            var weapon = weapons_1.WEAPON_SUPPLIERS.get("fists").create();
            //console.log(this.inventory);
            if (typeof this.inventory.holding === "number")
                weapon = this.inventory.getWeapon();
            else
                weapon = this.inventory.holding;
            weapon.render(this, canvas, ctx, scale);
            ctx.resetTransform();
        }
        else {
            ctx.drawImage(deathImg, -radius * 2, -radius * 2, radius * 4, radius * 4);
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.font = `700 ${scale}px Jura`;
            ctx.fillStyle = "#60605f";
            ctx.fillText(this.username, 2, radius * 2 + 2);
            ctx.fillStyle = "#80807f";
            ctx.fillText(this.username, 0, radius * 2);
            ctx.resetTransform();
        }
    }
}
exports.default = Player;
Player.TYPE = "player";
class PartialPlayer extends Player {
}
exports.PartialPlayer = PartialPlayer;
(() => {
    _1.ENTITY_SUPPLIERS.set(Player.TYPE, new PlayerSupplier());
})();
class FullPlayer extends Player {
    copy(minEntity) {
        super.copy(minEntity);
        this.boost = minEntity.boost;
        this.scope = minEntity.scope;
        this.canInteract = minEntity.canInteract || false;
        this.reloadTicks = minEntity.reloadTicks;
        this.maxReloadTicks = minEntity.maxReloadTicks;
    }
}
exports.FullPlayer = FullPlayer;

},{".":15,"../../types/entity":37,"../../types/weapon":42,"../../utils":43,"../weapons":34}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const obstacle_1 = require("../../types/obstacle");
const utils_1 = require("../../utils");
const ak47stoneImg = Object.assign(new Image(), { loaded: false });
ak47stoneImg.onload = () => ak47stoneImg.loaded = true;
ak47stoneImg.src = "assets/images/game/objects/ak47stone.png";
class AK47StoneSupplier {
    create(minObstacle) {
        return new AK47Stone(minObstacle);
    }
}
class AK47Stone extends obstacle_1.Obstacle {
    constructor() {
        super(...arguments);
        this.type = AK47Stone.TYPE;
    }
    render(you, canvas, ctx, scale) {
        if (!ak47stoneImg.loaded)
            return;
        const relative = this.position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        if (!this.despawn) {
            const width = scale * this.hitbox.comparable * 2, height = width * ak47stoneImg.naturalWidth / ak47stoneImg.naturalHeight;
            ctx.drawImage(ak47stoneImg, -width / 2, -height / 2, width, height);
        }
        else {
            const radius = scale * this.hitbox.comparable / 2;
            ctx.fillStyle = "#000000";
            ctx.globalAlpha = 0.25;
            (0, utils_1.circleFromCenter)(ctx, 0, 0, radius);
            ctx.globalAlpha = 1;
        }
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.fillStyle = "#b3b3b3";
        (0, utils_1.circleFromCenter)(ctx, this.position.x * scale, this.position.y * scale, 2 * scale);
    }
}
exports.default = AK47Stone;
AK47Stone.TYPE = "ak47-stone";
(() => {
    _1.OBSTACLE_SUPPLIERS.set(AK47Stone.TYPE, new AK47StoneSupplier());
})();

},{".":23,"../../types/obstacle":39,"../../utils":43}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const obstacle_1 = require("../../types/obstacle");
const awmCrateImg = Object.assign(new Image(), { loaded: false });
awmCrateImg.onload = () => awmCrateImg.loaded = true;
awmCrateImg.src = "assets/images/game/objects/awm_crate.png";
const awmCrateResidueImg = Object.assign(new Image(), { loaded: false });
awmCrateResidueImg.onload = () => awmCrateResidueImg.loaded = true;
awmCrateResidueImg.src = "assets/images/game/objects/residues/crate.svg";
class AWMCrateSupplier {
    create(minObstacle) {
        return new AWMCrate(minObstacle);
    }
}
class AWMCrate extends obstacle_1.Obstacle {
    constructor() {
        super(...arguments);
        this.type = AWMCrate.TYPE;
    }
    render(you, canvas, ctx, scale) {
        if (!awmCrateImg.loaded || !awmCrateResidueImg.loaded)
            return;
        const relative = this.position.addVec(you.position.inverse());
        const width = scale * this.hitbox.width * (this.despawn ? 0.5 : 1), height = width * awmCrateImg.naturalWidth / awmCrateImg.naturalHeight;
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        ctx.drawImage(this.despawn ? awmCrateResidueImg : awmCrateImg, -width / 2, -height / 2, width + 1, height + 0.5);
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.translate(this.position.x * scale, this.position.y * scale);
        ctx.fillStyle = "#683c05";
        ctx.fillRect(-2 * scale, -2 * scale, 5 * scale, 4 * scale);
        ctx.resetTransform();
    }
}
exports.default = AWMCrate;
AWMCrate.TYPE = "AWMCrate";
(() => {
    _1.OBSTACLE_SUPPLIERS.set(AWMCrate.TYPE, new AWMCrateSupplier());
})();

},{".":23,"../../types/obstacle":39}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obstacle_1 = require("../../types/obstacle");
const utils_1 = require("../../utils");
const _1 = require(".");
const barrelImg = Object.assign(new Image(), { loaded: false });
barrelImg.onload = () => barrelImg.loaded = true;
barrelImg.src = "assets/images/game/objects/barrel.png";
const barrelResidueImg = Object.assign(new Image(), { loaded: false });
barrelResidueImg.onload = () => barrelResidueImg.loaded = true;
barrelResidueImg.src = "assets/images/game/objects/residues/barrel.png";
class BarrelSupplier {
    create(minObstacle) {
        return new Barrel(minObstacle);
    }
}
// Barrel
class Barrel extends obstacle_1.Obstacle {
    constructor() {
        super(...arguments);
        this.type = Barrel.TYPE;
        this.zIndex = 0;
    }
    render(you, canvas, ctx, scale) {
        if (!barrelImg.loaded || !barrelResidueImg.loaded)
            return;
        const relative = this.position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        const img = this.despawn ? barrelResidueImg : barrelImg;
        // Times 2 because radius * 2 = diameter
        const width = scale * this.hitbox.comparable * 2 * (this.despawn ? 0.5 : 1), height = width * img.naturalWidth / img.naturalHeight;
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.fillStyle = "#005f00";
        (0, utils_1.circleFromCenter)(ctx, this.position.x * scale, this.position.y * scale, 2 * scale);
    }
}
exports.default = Barrel;
Barrel.TYPE = "barrel";
(() => {
    _1.OBSTACLE_SUPPLIERS.set(Barrel.TYPE, new BarrelSupplier());
})();

},{".":23,"../../types/obstacle":39,"../../utils":43}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obstacle_1 = require("../../types/obstacle");
const utils_1 = require("../../utils");
const _1 = require(".");
const bushImg = Object.assign(new Image(), { loaded: false });
bushImg.onload = () => bushImg.loaded = true;
bushImg.src = "assets/images/game/objects/bush.svg";
const bushResidueImg = Object.assign(new Image(), { loaded: false });
bushResidueImg.onload = () => bushResidueImg.loaded = true;
bushResidueImg.src = "assets/images/game/objects/residues/bush.svg";
class BushSupplier {
    create(minObstacle) {
        return new Bush(minObstacle);
    }
}
// Bush
class Bush extends obstacle_1.Obstacle {
    constructor(minObstacle) {
        super(minObstacle);
        this.type = Bush.TYPE;
        this.zIndex = 10;
        if (this.despawn)
            this.zIndex = 0;
    }
    render(you, canvas, ctx, scale) {
        if (!bushImg.loaded || !bushResidueImg.loaded)
            return;
        const relative = this.position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        const img = this.despawn ? bushResidueImg : bushImg;
        // Times 2 because radius * 2 = diameter
        const width = scale * this.hitbox.comparable * 2 * (this.despawn ? 0.5 : 1), height = width * img.naturalWidth / img.naturalHeight;
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.fillStyle = "#005f00";
        (0, utils_1.circleFromCenter)(ctx, this.position.x * scale, this.position.y * scale, 2 * scale);
    }
}
exports.default = Bush;
Bush.TYPE = "bush";
(() => {
    _1.OBSTACLE_SUPPLIERS.set(Bush.TYPE, new BushSupplier());
})();

},{".":23,"../../types/obstacle":39,"../../utils":43}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const obstacle_1 = require("../../types/obstacle");
const crateImg = Object.assign(new Image(), { loaded: false });
crateImg.onload = () => crateImg.loaded = true;
crateImg.src = "assets/images/game/objects/crate.svg";
const crateResidueImg = Object.assign(new Image(), { loaded: false });
crateResidueImg.onload = () => crateResidueImg.loaded = true;
crateResidueImg.src = "assets/images/game/objects/residues/crate.svg";
class CrateSupplier {
    create(minObstacle) {
        return new Crate(minObstacle);
    }
}
class Crate extends obstacle_1.Obstacle {
    constructor() {
        super(...arguments);
        this.type = Crate.TYPE;
    }
    render(you, canvas, ctx, scale) {
        if (!crateImg.loaded || !crateResidueImg.loaded)
            return;
        const relative = this.position.addVec(you.position.inverse());
        const width = scale * this.hitbox.width * (this.despawn ? 0.5 : 1), height = width * crateImg.naturalWidth / crateImg.naturalHeight;
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        ctx.drawImage(this.despawn ? crateResidueImg : crateImg, -width / 2, -height / 2, width, height);
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.translate(this.position.x * scale, this.position.y * scale);
        ctx.fillStyle = "#683c05";
        ctx.fillRect(-2 * scale, -2 * scale, 4 * scale, 4 * scale);
        ctx.resetTransform();
    }
}
exports.default = Crate;
Crate.TYPE = "crate";
(() => {
    _1.OBSTACLE_SUPPLIERS.set(Crate.TYPE, new CrateSupplier());
})();

},{".":23,"../../types/obstacle":39}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const obstacle_1 = require("../../types/obstacle");
const grenadeCrateImg = Object.assign(new Image(), { loaded: false });
grenadeCrateImg.onload = () => grenadeCrateImg.loaded = true;
grenadeCrateImg.src = "assets/images/game/objects/grenade_crate.png";
const grenadeCrateResidueImg = Object.assign(new Image(), { loaded: false });
grenadeCrateResidueImg.onload = () => grenadeCrateResidueImg.loaded = true;
grenadeCrateResidueImg.src = "assets/images/game/objects/residues/crate.svg";
class GrenadeCrateSupplier {
    create(minObstacle) {
        return new GrenadeCrate(minObstacle);
    }
}
class GrenadeCrate extends obstacle_1.Obstacle {
    constructor() {
        super(...arguments);
        this.type = GrenadeCrate.TYPE;
    }
    render(you, canvas, ctx, scale) {
        if (!grenadeCrateImg.loaded || !grenadeCrateResidueImg.loaded)
            return;
        const relative = this.position.addVec(you.position.inverse());
        const width = scale * this.hitbox.width * (this.despawn ? 0.5 : 1), height = width * grenadeCrateImg.naturalWidth / grenadeCrateImg.naturalHeight;
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        ctx.drawImage(this.despawn ? grenadeCrateResidueImg : grenadeCrateImg, -width / 2, -height / 2, width, height);
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.translate(this.position.x * scale, this.position.y * scale);
        ctx.fillStyle = "#46502d";
        ctx.fillRect(-1.5 * scale, -1.5 * scale, 3 * scale, 3 * scale);
        ctx.resetTransform();
    }
}
exports.default = GrenadeCrate;
GrenadeCrate.TYPE = "grenade_crate";
(() => {
    _1.OBSTACLE_SUPPLIERS.set(GrenadeCrate.TYPE, new GrenadeCrateSupplier());
})();

},{".":23,"../../types/obstacle":39}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.castMinObstacle = exports.castCorrectObstacle = exports.AK47Stone = exports.Barrel = exports.AWMCrate = exports.GrenadeCrate = exports.SovietCrate = exports.Stone = exports.MosinTree = exports.Crate = exports.Bush = exports.Tree = exports.OBSTACLE_SUPPLIERS = void 0;
const math_1 = require("../../types/math");
const obstacle_1 = require("../../types/obstacle");
exports.OBSTACLE_SUPPLIERS = new Map();
var tree_1 = require("./tree");
Object.defineProperty(exports, "Tree", { enumerable: true, get: function () { return tree_1.default; } });
var bush_1 = require("./bush");
Object.defineProperty(exports, "Bush", { enumerable: true, get: function () { return bush_1.default; } });
var crate_1 = require("./crate");
Object.defineProperty(exports, "Crate", { enumerable: true, get: function () { return crate_1.default; } });
var mosin_tree_1 = require("./mosin_tree");
Object.defineProperty(exports, "MosinTree", { enumerable: true, get: function () { return mosin_tree_1.default; } });
var stone_1 = require("./stone");
Object.defineProperty(exports, "Stone", { enumerable: true, get: function () { return stone_1.default; } });
var soviet_crate_1 = require("./soviet_crate");
Object.defineProperty(exports, "SovietCrate", { enumerable: true, get: function () { return soviet_crate_1.default; } });
var grenade_crate_1 = require("./grenade_crate");
Object.defineProperty(exports, "GrenadeCrate", { enumerable: true, get: function () { return grenade_crate_1.default; } });
var awm_crate_1 = require("./awm_crate");
Object.defineProperty(exports, "AWMCrate", { enumerable: true, get: function () { return awm_crate_1.default; } });
var barrel_1 = require("./barrel");
Object.defineProperty(exports, "Barrel", { enumerable: true, get: function () { return barrel_1.default; } });
var ak47stone_1 = require("./ak47stone");
Object.defineProperty(exports, "AK47Stone", { enumerable: true, get: function () { return ak47stone_1.default; } });
function castCorrectObstacle(minObstacle) {
    var _a;
    return ((_a = exports.OBSTACLE_SUPPLIERS.get(minObstacle.type)) === null || _a === void 0 ? void 0 : _a.create(minObstacle)) || new obstacle_1.DummyObstacle(minObstacle);
}
exports.castCorrectObstacle = castCorrectObstacle;
function castMinObstacle(minMinObstacle) {
    const copy = minMinObstacle;
    return Object.assign(copy, { direction: math_1.Vec2.ONE, hitbox: new math_1.CircleHitbox(0), despawn: false, animations: [] });
}
exports.castMinObstacle = castMinObstacle;

},{"../../types/math":38,"../../types/obstacle":39,"./ak47stone":17,"./awm_crate":18,"./barrel":19,"./bush":20,"./crate":21,"./grenade_crate":22,"./mosin_tree":24,"./soviet_crate":25,"./stone":26,"./tree":27}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obstacle_1 = require("../../types/obstacle");
const utils_1 = require("../../utils");
const _1 = require(".");
const treeImg = Object.assign(new Image(), { loaded: false });
treeImg.onload = () => treeImg.loaded = true;
treeImg.src = "assets/images/game/objects/mosin_tree.png";
const treeResidueImg = Object.assign(new Image(), { loaded: false });
treeResidueImg.onload = () => treeResidueImg.loaded = true;
treeResidueImg.src = "assets/images/game/objects/residues/tree.svg";
class MosinTreeSupplier {
    create(minObstacle) {
        return new MosinTree(minObstacle);
    }
}
class MosinTree extends obstacle_1.Obstacle {
    constructor() {
        super(...arguments);
        this.type = MosinTree.TYPE;
        this.zIndex = 1000;
    }
    copy(minObstacle) {
        super.copy(minObstacle);
        if (this.despawn)
            this.zIndex = 0;
    }
    render(you, canvas, ctx, scale) {
        if (!treeImg.loaded || !treeResidueImg.loaded)
            return;
        const relative = this.position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        const img = this.despawn ? treeResidueImg : treeImg;
        const width = scale * this.hitbox.comparable * 2 * (this.despawn ? 1 : 3.6), height = width * img.naturalWidth / img.naturalHeight;
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.fillStyle = "#3e502e";
        (0, utils_1.circleFromCenter)(ctx, this.position.x * scale, this.position.y * scale, 1.5 * scale * 3.6);
    }
}
exports.default = MosinTree;
MosinTree.TYPE = "mosin_tree";
(() => {
    _1.OBSTACLE_SUPPLIERS.set(MosinTree.TYPE, new MosinTreeSupplier());
})();

},{".":23,"../../types/obstacle":39,"../../utils":43}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const obstacle_1 = require("../../types/obstacle");
const crateImg = Object.assign(new Image(), { loaded: false });
crateImg.onload = () => crateImg.loaded = true;
crateImg.src = "assets/images/game/objects/soviet_crate.png";
const crateResidueImg = Object.assign(new Image(), { loaded: false });
crateResidueImg.onload = () => crateResidueImg.loaded = true;
crateResidueImg.src = "assets/images/game/objects/residues/crate.svg";
class SovietCrateSupplier {
    create(minObstacle) {
        return new SovietCrate(minObstacle);
    }
}
class SovietCrate extends obstacle_1.Obstacle {
    constructor() {
        super(...arguments);
        this.type = SovietCrate.TYPE;
    }
    render(you, canvas, ctx, scale) {
        if (!crateImg.loaded || !crateResidueImg.loaded)
            return;
        const relative = this.position.addVec(you.position.inverse());
        const width = scale * this.hitbox.width * (this.despawn ? 0.5 : 1), height = width * crateImg.naturalWidth / crateImg.naturalHeight;
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        ctx.drawImage(this.despawn ? crateResidueImg : crateImg, -width / 2, -height / 2, width, height);
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.translate(this.position.x * scale, this.position.y * scale);
        ctx.fillStyle = "#683c05";
        ctx.fillRect(-2 * scale, -2 * scale, 4 * scale, 4 * scale);
        ctx.resetTransform();
    }
}
exports.default = SovietCrate;
SovietCrate.TYPE = "soviet_crate";
(() => {
    _1.OBSTACLE_SUPPLIERS.set(SovietCrate.TYPE, new SovietCrateSupplier());
})();

},{".":23,"../../types/obstacle":39}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const obstacle_1 = require("../../types/obstacle");
const utils_1 = require("../../utils");
const stoneImg = Object.assign(new Image(), { loaded: false });
stoneImg.onload = () => stoneImg.loaded = true;
stoneImg.src = "assets/images/game/objects/stone.svg";
class StoneSupplier {
    create(minObstacle) {
        return new Stone(minObstacle);
    }
}
class Stone extends obstacle_1.Obstacle {
    constructor() {
        super(...arguments);
        this.type = Stone.TYPE;
    }
    render(you, canvas, ctx, scale) {
        if (!stoneImg.loaded)
            return;
        const relative = this.position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        if (!this.despawn) {
            const width = scale * this.hitbox.comparable * 2, height = width * stoneImg.naturalWidth / stoneImg.naturalHeight;
            ctx.drawImage(stoneImg, -width / 2, -height / 2, width, height);
        }
        else {
            const radius = scale * this.hitbox.comparable / 2;
            ctx.fillStyle = "#000000";
            ctx.globalAlpha = 0.25;
            (0, utils_1.circleFromCenter)(ctx, 0, 0, radius);
            ctx.globalAlpha = 1;
        }
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.fillStyle = "#b3b3b3";
        (0, utils_1.circleFromCenter)(ctx, this.position.x * scale, this.position.y * scale, 2 * scale);
    }
}
exports.default = Stone;
Stone.TYPE = "stone";
(() => {
    _1.OBSTACLE_SUPPLIERS.set(Stone.TYPE, new StoneSupplier());
})();

},{".":23,"../../types/obstacle":39,"../../utils":43}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obstacle_1 = require("../../types/obstacle");
const utils_1 = require("../../utils");
const _1 = require(".");
const treeImg = Object.assign(new Image(), { loaded: false });
treeImg.onload = () => treeImg.loaded = true;
treeImg.src = "assets/images/game/objects/tree.svg";
const treeResidueImg = Object.assign(new Image(), { loaded: false });
treeResidueImg.onload = () => treeResidueImg.loaded = true;
treeResidueImg.src = "assets/images/game/objects/residues/tree.svg";
class TreeSupplier {
    create(minObstacle) {
        return new Tree(minObstacle);
    }
}
class Tree extends obstacle_1.Obstacle {
    constructor() {
        super(...arguments);
        this.type = Tree.TYPE;
        this.zIndex = 1000;
    }
    copy(minObstacle) {
        super.copy(minObstacle);
        if (this.despawn)
            this.zIndex = 0;
    }
    render(you, canvas, ctx, scale) {
        if (!treeImg.loaded || !treeResidueImg.loaded)
            return;
        const relative = this.position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        const img = this.despawn ? treeResidueImg : treeImg;
        const width = scale * this.hitbox.comparable * 2 * (this.despawn ? 1 : 3.6), height = width * img.naturalWidth / img.naturalHeight;
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.fillStyle = "#3e502e";
        (0, utils_1.circleFromCenter)(ctx, this.position.x * scale, this.position.y * scale, 1.5 * scale * 3.6);
    }
}
exports.default = Tree;
Tree.TYPE = "tree";
(() => {
    _1.OBSTACLE_SUPPLIERS.set(Tree.TYPE, new TreeSupplier());
})();

},{".":23,"../../types/obstacle":39,"../../utils":43}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.castCorrectTerrain = exports.Sea = exports.RiverSegment = exports.River = exports.Pond = exports.Plain = exports.TERRAIN_SUPPLIERS = void 0;
exports.TERRAIN_SUPPLIERS = new Map();
const plain_1 = require("./plain");
var plain_2 = require("./plain");
Object.defineProperty(exports, "Plain", { enumerable: true, get: function () { return plain_2.default; } });
var pond_1 = require("./pond");
Object.defineProperty(exports, "Pond", { enumerable: true, get: function () { return pond_1.default; } });
var river_1 = require("./river");
Object.defineProperty(exports, "River", { enumerable: true, get: function () { return river_1.default; } });
Object.defineProperty(exports, "RiverSegment", { enumerable: true, get: function () { return river_1.RiverSegment; } });
var sea_1 = require("./sea");
Object.defineProperty(exports, "Sea", { enumerable: true, get: function () { return sea_1.default; } });
function castCorrectTerrain(minTerrain) {
    var _a;
    return ((_a = exports.TERRAIN_SUPPLIERS.get(minTerrain.id)) === null || _a === void 0 ? void 0 : _a.create(minTerrain)) || new plain_1.default(minTerrain);
}
exports.castCorrectTerrain = castCorrectTerrain;

},{"./plain":29,"./pond":30,"./river":31,"./sea":32}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const terrain_1 = require("../../types/terrain");
class PlainSupplier {
    create(minTerrain) {
        return new Plain(minTerrain);
    }
}
class Plain extends terrain_1.Terrain {
    constructor(minTerrain) {
        super(minTerrain);
        this.id = Plain.ID;
        this.color = 0x80B251;
    }
    render(_you, _canvas, _ctx, _scale) { }
    renderMap(_canvas, _ctx, _scale) { }
}
exports.default = Plain;
Plain.ID = "plain";
(() => {
    _1.TERRAIN_SUPPLIERS.set(Plain.ID, new PlainSupplier());
})();

},{".":28,"../../types/terrain":41}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const terrain_1 = require("../../types/terrain");
const utils_1 = require("../../utils");
const _1 = require(".");
class PondSupplier {
    create(minTerrain) {
        return new Pond(minTerrain);
    }
}
class Pond extends terrain_1.DotTerrain {
    constructor(minTerrain) {
        super(minTerrain);
        this.id = Pond.ID;
        this.color = 0x3481ab;
        this.secondaryColor = 0x905e26;
    }
    renderLayerN1(you, canvas, ctx, scale) {
        const relative = this.position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.fillStyle = this.colorToHex(this.secondaryColor);
        (0, utils_1.circleFromCenter)(ctx, 0, 0, (this.radius + this.border) * scale);
        ctx.resetTransform();
    }
    renderMapLayerN1(_canvas, ctx, scale) {
        ctx.fillStyle = this.colorToHex(this.secondaryColor);
        (0, utils_1.circleFromCenter)(ctx, this.position.x * scale, this.position.y * scale, (this.radius + this.border) * scale);
    }
}
exports.default = Pond;
Pond.ID = "pond";
(() => {
    _1.TERRAIN_SUPPLIERS.set(Pond.ID, new PondSupplier());
})();

},{".":28,"../../types/terrain":41,"../../utils":43}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiverSegment = void 0;
const math_1 = require("../../types/math");
const terrain_1 = require("../../types/terrain");
const _1 = require(".");
class RiverSegmentSupplier {
    create(minTerrain) {
        return new RiverSegment(minTerrain);
    }
}
class RiverSupplier {
    create(minTerrain) {
        return new River(minTerrain);
    }
}
class RiverSegment extends terrain_1.LineTerrain {
    constructor() {
        super(...arguments);
        this.id = RiverSegment.ID;
        this.color = 0x3481ab;
        this.secondaryColor = 0x905e26;
    }
    renderLayerN1(you, canvas, ctx, scale) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-you.position.x, -you.position.y);
        const lines = this.line.toParallel(this.range + this.border, false);
        const start = new math_1.Line(this.line.a, this.boundary.start.addVec(this.line.a), false);
        const end = new math_1.Line(this.line.b, this.boundary.end.addVec(this.line.b), false);
        const a = lines[0].intersection(start);
        if (!a)
            return;
        const b = lines[0].intersection(end);
        if (!b)
            return;
        const c = lines[1].intersection(end);
        if (!c)
            return;
        const d = lines[1].intersection(start);
        if (!d)
            return;
        ctx.fillStyle = this.colorToHex(this.secondaryColor);
        ctx.beginPath();
        ctx.moveTo(a.x - 1 / scale, a.y - 1 / scale);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(d.x - 1 / scale, d.y - 1 / scale);
        ctx.closePath();
        ctx.fill();
        ctx.resetTransform();
    }
    renderMapLayerN1(_canvas, ctx, scale) {
        ctx.scale(scale, scale);
        const lines = this.line.toParallel(this.range + this.border, false);
        const start = new math_1.Line(this.line.a, this.boundary.start.addVec(this.line.a), false);
        const end = new math_1.Line(this.line.b, this.boundary.end.addVec(this.line.b), false);
        const a = lines[0].intersection(start);
        if (!a)
            return;
        const b = lines[0].intersection(end);
        if (!b)
            return;
        const c = lines[1].intersection(end);
        if (!c)
            return;
        const d = lines[1].intersection(start);
        if (!d)
            return;
        ctx.fillStyle = this.colorToHex(this.secondaryColor);
        ctx.beginPath();
        ctx.moveTo(a.x - 1 / scale, a.y - 1 / scale);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(d.x - 1 / scale, d.y - 1 / scale);
        ctx.closePath();
        ctx.fill();
        ctx.resetTransform();
    }
}
exports.RiverSegment = RiverSegment;
RiverSegment.ID = "river_segment";
(() => {
    _1.TERRAIN_SUPPLIERS.set(RiverSegment.ID, new RiverSegmentSupplier());
})();
class River extends terrain_1.PiecewiseTerrain {
    constructor(minTerrain) {
        super(minTerrain);
        this.id = River.ID;
        this.color = 0xFF3481ab;
        this.secondaryColor = 0xFF905e26;
    }
    renderLayerN1(you, canvas, ctx, scale) {
        this.lines.forEach(line => line.renderLayerN1(you, canvas, ctx, scale));
    }
    renderMapLayerN1(canvas, ctx, scale) {
        this.lines.forEach(line => line.renderMapLayerN1(canvas, ctx, scale));
    }
}
exports.default = River;
River.ID = "river";
(() => {
    _1.TERRAIN_SUPPLIERS.set(River.ID, new RiverSupplier());
})();

},{".":28,"../../types/math":38,"../../types/terrain":41}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const terrain_1 = require("../../types/terrain");
class SeaSupplier {
    create(minTerrain) {
        return new Sea(minTerrain);
    }
}
class Sea extends terrain_1.LineTerrain {
    constructor() {
        super(...arguments);
        this.id = Sea.ID;
        this.color = 0x3481ab;
    }
}
exports.default = Sea;
Sea.ID = "sea";
(() => {
    _1.TERRAIN_SUPPLIERS.set(Sea.ID, new SeaSupplier());
})();

},{".":28,"../../types/terrain":41}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const math_1 = require("../../../types/math");
const weapon_1 = require("../../../types/weapon");
const utils_1 = require("../../../utils");
class FragGrenadeSupplier {
    create() {
        return new FragGrenade();
    }
}
class FragGrenade extends weapon_1.GrenadeWeapon {
    constructor() {
        super(FragGrenade.ID, "Frag Grenade");
    }
    render(player, _canvas, ctx, scale) {
        const radius = scale * player.hitbox.comparable;
        const fistRadius = radius / 3;
        const fistPositions = [new math_1.Vec2(player.hitbox.comparable, 0.1), new math_1.Vec2(player.hitbox.comparable + 0.25, -0.1)];
        var offset = math_1.Vec2.ZERO;
        ctx.fillStyle = "#222";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 0.025 * scale;
        //ctx.fillRect(player.hitbox.comparable * scale, -0.15 * scale, 1.2 * scale, 0.3 * scale);
        (0, utils_1.roundRect)(ctx, player.hitbox.comparable * scale, -0.15 * scale, 0.5 * scale, 0.3 * scale, 0.15 * scale, true, true);
        ctx.fillStyle = "#F8C675";
        ctx.lineWidth = fistRadius / 3;
        ctx.strokeStyle = "#000000";
        for (const pos of fistPositions) {
            const fist = pos.addVec(offset).scaleAll(scale);
            (0, utils_1.circleFromCenter)(ctx, fist.x, fist.y, fistRadius, true, true);
        }
    }
}
exports.default = FragGrenade;
FragGrenade.ID = "frag_grenade";
(() => {
    __1.WEAPON_SUPPLIERS.set(FragGrenade.ID, new FragGrenadeSupplier());
})();

},{"..":34,"../../../types/math":38,"../../../types/weapon":42,"../../../utils":43}],34:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.castCorrectWeapon = exports.FragGrenade = exports.WEAPON_SUPPLIERS = void 0;
const constants_1 = require("../../constants");
const weapon_1 = require("../../types/weapon");
exports.WEAPON_SUPPLIERS = new Map();
var frag_grenade_1 = require("./grenades/frag_grenade");
Object.defineProperty(exports, "FragGrenade", { enumerable: true, get: function () { return frag_grenade_1.default; } });
function castCorrectWeapon(minWeapon, magazine = 0) {
    var _a;
    return ((_a = exports.WEAPON_SUPPLIERS.get(minWeapon.id)) === null || _a === void 0 ? void 0 : _a.create(magazine)) || exports.WEAPON_SUPPLIERS.get("fists").create();
}
exports.castCorrectWeapon = castCorrectWeapon;
class MeleeSupplier {
    constructor(id, data) {
        this.id = id;
        this.data = data;
    }
    create() {
        return new weapon_1.MeleeWeapon(this.id, this.data);
    }
}
class GunSupplier {
    constructor(id, data) {
        this.id = id;
        this.data = data;
    }
    create(magazine = 0) {
        return new weapon_1.GunWeapon(this.id, this.data, magazine);
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    for (const file of yield fetch(`${constants_1.OPENSURVIV_DATA}/data/weapons/melee/.list.json`).then(res => res.json())) {
        const data = yield fetch(`${constants_1.OPENSURVIV_DATA}/data/weapons/melee/${file}.json`).then(res => res.json());
        exports.WEAPON_SUPPLIERS.set(file, new MeleeSupplier(file, data));
    }
    for (const file of yield fetch(`${constants_1.OPENSURVIV_DATA}/data/weapons/guns/.list.json`).then(res => res.json())) {
        const data = yield fetch(`${constants_1.OPENSURVIV_DATA}/data/weapons/guns/${file}.json`).then(res => res.json());
        exports.WEAPON_SUPPLIERS.set(file, new GunSupplier(file, data));
    }
}))();

},{"../../constants":1,"../../types/weapon":42,"./grenades/frag_grenade":33}],35:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTracerColor = exports.getWeaponImage = void 0;
const constants_1 = require("./constants");
const weapons = new Map();
(() => __awaiter(void 0, void 0, void 0, function* () {
    for (const id of yield fetch(`${constants_1.OPENSURVIV_DATA}/data/weapons/guns/.list.json`).then(res => res.json())) {
        const img = Object.assign(new Image(), { loaded: false });
        img.onload = () => img.loaded = true;
        img.src = `assets/images/game/loots/weapons/${id}.png`;
        weapons.set(id, img);
    }
}))();
function getWeaponImage(id) {
    return weapons.get(id);
}
exports.getWeaponImage = getWeaponImage;
const tracerColors = new Map();
(() => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield fetch(`${constants_1.OPENSURVIV_DATA}/data/colors/tracers.json`).then(res => res.json());
    for (const id of Object.keys(data)) {
        tracerColors.set(id, data[id]);
    }
}))();
function getTracerColor(id) {
    return tracerColors.get(id);
}
exports.getTracerColor = getTracerColor;

},{"./constants":1}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefinedAnimation = void 0;
// Defined animation path
class DefinedAnimation {
    constructor(id, positions, rotations, keyframes, duration) {
        this.id = id;
        this.positions = positions;
        this.rotations = rotations;
        this.keyframes = keyframes;
        this.duration = duration;
    }
}
exports.DefinedAnimation = DefinedAnimation;

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyEntity = exports.Entity = exports.PartialInventory = exports.Inventory = void 0;
const weapons_1 = require("../store/weapons");
const math_1 = require("./math");
const constants_1 = require("../constants");
const animations_1 = require("../store/animations");
class Inventory {
    constructor(holding, slots, weapons, ammos, utilities) {
        this.holding = holding;
        this.slots = slots;
        this.weapons = weapons || Array(slots.reduce((a, b) => a + b));
        this.ammos = ammos || Array(Object.keys(constants_1.GunColor).length / 2).fill(0);
        this.utilities = utilities || new Map();
    }
    getWeapon(index = -1) {
        if (index < 0)
            index = this.holding;
        if (this.holding < this.weapons.length)
            return this.weapons[this.holding];
        const util = Object.keys(this.utilities)[this.holding - this.weapons.length];
        if (this.utilities.get(util))
            return weapons_1.WEAPON_SUPPLIERS.get(util).create();
        return undefined;
    }
}
exports.Inventory = Inventory;
// Inventory, mainly for players
class PartialInventory {
    constructor(minInv) {
        this.holding = (0, weapons_1.castCorrectWeapon)(minInv.holding);
    }
}
exports.PartialInventory = PartialInventory;
// An entity with position, velocity and hitbox
class Entity {
    constructor(minEntity) {
        this.animations = [];
        this.zIndex = 0;
        this.copy(minEntity);
    }
    copy(minEntity) {
        this.id = minEntity.id;
        this.type = minEntity.type;
        this.position = new math_1.Vec2(minEntity.position.x, minEntity.position.y);
        this.direction = new math_1.Vec2(minEntity.direction.x, minEntity.direction.y);
        if (minEntity.hitbox.type === "rect") {
            const rect = minEntity.hitbox;
            this.hitbox = new math_1.RectHitbox(rect.width, rect.height);
        }
        else {
            const circle = minEntity.hitbox;
            this.hitbox = new math_1.CircleHitbox(circle.radius);
        }
        this.health = this.maxHealth = 100;
        this.despawn = minEntity.despawn;
        for (const anim of minEntity.animations)
            if (animations_1.DEFINED_ANIMATIONS.has(anim)) {
                const duration = animations_1.DEFINED_ANIMATIONS.get(anim).duration;
                this.animations.push({ id: anim, duration: duration });
            }
    }
    renderTick(time) {
        const removable = [];
        for (let ii = 0; ii < this.animations.length; ii++) {
            this.animations[ii].duration -= time;
            if (this.animations[ii].duration <= 0)
                removable.push(ii);
        }
        for (let ii = removable.length - 1; ii >= 0; ii--)
            this.animations.splice(removable[ii], 1);
    }
}
exports.Entity = Entity;
class DummyEntity extends Entity {
    render(_you, _canvas, _ctx, _scale) { }
}
exports.DummyEntity = DummyEntity;

},{"../constants":1,"../store/animations":10,"../store/weapons":34,"./math":38}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementDirection = exports.CircleHitbox = exports.RectHitbox = exports.Line = exports.Vec2 = void 0;
// Linear algebra paid off! (2D vector)
class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static fromMinVec2(minVec2) {
        return new Vec2(minVec2.x, minVec2.y);
    }
    magnitudeSqr() {
        return this.x * this.x + this.y * this.y;
    }
    magnitude() {
        return Math.sqrt(this.magnitudeSqr());
    }
    inverse() {
        return new Vec2(-this.x, -this.y);
    }
    unit() {
        const mag = this.magnitude();
        if (mag === 0)
            return Vec2.ZERO;
        return new Vec2(this.x / mag, this.y / mag);
    }
    dot(vec) {
        return this.x * vec.x + this.y * vec.y;
    }
    angleBetween(vec) {
        return Math.acos(this.dot(vec) / (this.magnitude() * vec.magnitude()));
    }
    angle() {
        // Magnitude of unit vector is 1
        const angle = Math.acos((this.x) / (this.magnitude()));
        if (this.y > 0)
            return angle;
        else
            return -angle;
    }
    addAngle(radian) {
        const angle = this.angle() + radian;
        const mag = this.magnitude();
        return new Vec2(mag * Math.cos(angle), mag * Math.sin(angle));
    }
    addVec(vec) {
        return new Vec2(this.x + vec.x, this.y + vec.y);
    }
    addX(x) {
        return new Vec2(this.x + x, this.y);
    }
    addY(y) {
        return new Vec2(this.x, this.y + y);
    }
    scale(x, y) {
        return new Vec2(this.x * x, this.y * y);
    }
    scaleAll(ratio) {
        return this.scale(ratio, ratio);
    }
    projectTo(vec) {
        return vec.scaleAll(this.dot(vec) / vec.magnitudeSqr());
    }
    distanceSqrTo(vec) {
        return this.addVec(vec.inverse()).magnitudeSqr();
    }
    distanceTo(vec) {
        return Math.sqrt(this.distanceSqrTo(vec));
    }
    perpendicular() {
        return new Vec2(this.y, -this.x);
    }
    equals(vec) {
        return this.x === vec.x && this.y === vec.y;
    }
    // For debug purposes
    render(you, canvas, ctx, scale, position) {
        const relative = position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.x * scale, this.y * scale);
        ctx.stroke();
        ctx.resetTransform();
    }
    renderPoint(you, canvas, ctx, scale, position) {
        const relative = position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo((this.x - position.x) * scale, (this.y - position.y) * scale);
        ctx.stroke();
        ctx.resetTransform();
    }
}
exports.Vec2 = Vec2;
Vec2.ZERO = new Vec2(0, 0);
Vec2.ONE = new Vec2(1, 0);
class Line {
    constructor(a, b, segment) {
        // Making sure b is always right of a
        if (a.x < b.x) {
            this.a = a;
            this.b = b;
        }
        else {
            this.a = b;
            this.b = a;
        }
        if (segment === undefined)
            this.segment = true;
        else
            this.segment = segment;
    }
    static fromMinLine(minLine) {
        return new Line(Vec2.fromMinVec2(minLine.a), Vec2.fromMinVec2(minLine.b), minLine.segment);
    }
    static fromPointSlope(p, m) {
        const b = new Vec2(p.x + 1, (p.y + 1) * m);
        return new Line(p, b, false);
    }
    direction(point) {
        return (this.b.y - this.a.y) * (point.x - this.b.x) - (this.b.x - this.a.x) * (point.y - this.b.y);
    }
    distanceSqrTo(point) {
        const ab = this.toVec();
        const ae = point.addVec(this.a.inverse());
        if (this.segment) {
            const be = point.addVec(this.b.inverse());
            const abbe = ab.dot(be);
            const abae = ab.dot(ae);
            if (abbe > 0)
                return be.magnitude();
            if (abae < 0)
                return ae.magnitude();
            const a = this.b.y - this.a.y;
            const b = this.a.x - this.b.x;
            const c = (this.b.x - this.a.x) * this.a.y - (this.b.y - this.a.y) * this.a.x;
            return Math.pow(a * point.x + b * point.y + c, 2) / (a * a + b * b);
        }
        else
            return ae.projectTo(ab.perpendicular()).magnitudeSqr();
    }
    distanceTo(point) {
        return Math.sqrt(this.distanceSqrTo(point));
    }
    intersects(line) {
        const dir1 = line.direction(this.a);
        const dir2 = line.direction(this.b);
        const dir3 = this.direction(line.a);
        const dir4 = this.direction(line.b);
        if (dir1 != dir2 && dir3 != dir4)
            return true;
        if (dir1 == 0 && line.passthrough(this.a))
            return true;
        if (dir2 == 0 && line.passthrough(this.b))
            return true;
        if (dir3 == 0 && line.passthrough(line.a))
            return true;
        if (dir4 == 0 && line.passthrough(line.b))
            return true;
        return false;
    }
    passthrough(point) {
        const m = this.slope();
        // This is a vertical line
        if (m === undefined) {
            if (point.x != this.a.x)
                return false;
            if (this.segment && (point.y < Math.min(this.a.y, this.b.y) || point.y > Math.max(this.a.y, this.b.y)))
                return false;
            return true;
        }
        // y = mx + c
        const c = this.a.y - m * this.a.x;
        if (point.y != m * point.x + c)
            return false;
        if (this.segment && (point.x < this.a.x || point.x > this.b.x || point.y < Math.min(this.a.y, this.b.y) || point.y > Math.max(this.a.y, this.b.y)))
            return false;
        return true;
    }
    leftTo(point) {
        const m = this.slope();
        if (m === undefined)
            return point.x < this.a.x;
        // x = (y - c) / m
        const c = this.a.y - m * this.a.x;
        return point.x < (point.y - c) / m;
    }
    rightTo(point) {
        const m = this.slope();
        if (m === undefined)
            return point.x > this.a.x;
        // x = (y - c) / m
        const c = this.a.y - m * this.a.x;
        return point.x > (point.y - c) / m;
    }
    slope() {
        if (this.b.x - this.a.x == 0)
            return undefined;
        return (this.b.y - this.a.y) / (this.b.x - this.a.x);
    }
    yIntercept() {
        const m = this.slope();
        if (m === undefined)
            return undefined;
        return this.a.y - m * this.a.x;
    }
    toVec() {
        return this.b.addVec(this.a.inverse());
    }
    toParallel(distance, overrideSegment) {
        if (overrideSegment === undefined)
            overrideSegment = this.segment;
        var per = this.toVec().perpendicular().unit().scaleAll(distance);
        const line1 = new Line(this.a.addVec(per), this.b.addVec(per), overrideSegment);
        per = per.inverse();
        const line2 = new Line(this.a.addVec(per), this.b.addVec(per), overrideSegment);
        return [line1, line2];
    }
    intersection(line) {
        if (this.a.equals(line.a) && this.b.equals(line.b))
            return undefined;
        if (this.yIntercept() === undefined && line.yIntercept() === undefined)
            return undefined;
        else if (this.yIntercept() === undefined)
            return new Vec2(this.a.x, line.slope() * this.a.x + line.yIntercept());
        else if (line.yIntercept() === undefined)
            return new Vec2(line.a.x, this.slope() * line.a.x + this.yIntercept());
        const x = (line.yIntercept() - this.yIntercept()) / (this.slope() - line.slope());
        const point = new Vec2(x, this.slope() * x + this.yIntercept());
        if (this.segment && !this.passthrough(point) || line.segment && !line.passthrough(point))
            return undefined;
        return point;
    }
}
exports.Line = Line;
// Rectangle hitbox with a width and height
class RectHitbox {
    constructor(width, height) {
        this.type = "rect";
        this.width = width;
        this.height = height;
        this.comparable = Math.sqrt(Math.pow(this.width / 2, 2) + Math.pow(this.height / 2, 2));
    }
}
exports.RectHitbox = RectHitbox;
RectHitbox.ZERO = new RectHitbox(0, 0);
// Circular hitbox with a radius
class CircleHitbox {
    constructor(radius) {
        this.type = "circle";
        this.comparable = this.radius = radius;
    }
}
exports.CircleHitbox = CircleHitbox;
CircleHitbox.ZERO = new CircleHitbox(0);
var MovementDirection;
(function (MovementDirection) {
    MovementDirection[MovementDirection["RIGHT"] = 0] = "RIGHT";
    MovementDirection[MovementDirection["UP"] = 1] = "UP";
    MovementDirection[MovementDirection["LEFT"] = 2] = "LEFT";
    MovementDirection[MovementDirection["DOWN"] = 3] = "DOWN";
})(MovementDirection = exports.MovementDirection || (exports.MovementDirection = {}));

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyObstacle = exports.Obstacle = void 0;
const math_1 = require("./math");
const animations_1 = require("../store/animations");
// Obstacles inside the game
class Obstacle {
    constructor(minObstacle) {
        this.animations = [];
        this.zIndex = 0;
        this.copy(minObstacle);
    }
    copy(minObstacle) {
        this.id = minObstacle.id;
        this.type = minObstacle.type;
        this.position = new math_1.Vec2(minObstacle.position.x, minObstacle.position.y);
        this.direction = new math_1.Vec2(minObstacle.direction.x, minObstacle.direction.y);
        if (minObstacle.hitbox.type === "rect") {
            const rect = minObstacle.hitbox;
            this.hitbox = new math_1.RectHitbox(rect.width, rect.height);
        }
        else {
            const circle = minObstacle.hitbox;
            this.hitbox = new math_1.CircleHitbox(circle.radius);
        }
        this.despawn = minObstacle.despawn;
        for (const anim of minObstacle.animations)
            if (animations_1.DEFINED_ANIMATIONS.has(anim))
                this.animations.push({ id: anim, duration: animations_1.DEFINED_ANIMATIONS.get(anim).duration });
    }
    renderTick(time) {
        const removable = [];
        for (let ii = 0; ii < this.animations.length; ii++) {
            this.animations[ii].duration -= time;
            if (this.animations[ii].duration <= 0)
                removable.push(ii);
        }
        for (let ii = removable.length - 1; ii >= 0; ii--)
            this.animations.splice(removable[ii], 1);
    }
}
exports.Obstacle = Obstacle;
// Dummy obstacle for default casting
class DummyObstacle extends Obstacle {
    render(_you, _canvas, _ctx, _scale) { }
    renderMap(_canvas, _ctx, _scale) { }
}
exports.DummyObstacle = DummyObstacle;

},{"../store/animations":10,"./math":38}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapPacket = exports.GamePacket = exports.AckPacket = exports.ReloadWeaponPacket = exports.SwitchWeaponPacket = exports.InteractPacket = exports.MouseMovePacket = exports.MouseReleasePacket = exports.MousePressPacket = exports.MovementReleasePacket = exports.MovementPressPacket = exports.PingPacket = void 0;
// Packet to ping the server
class PingPacket {
    constructor() {
        this.type = "ping";
    }
}
exports.PingPacket = PingPacket;
// Packet to notify movement key press
class MovementPressPacket {
    constructor(direction) {
        this.type = "movementpress";
        this.direction = direction;
    }
}
exports.MovementPressPacket = MovementPressPacket;
// Packet to notify movement key release
class MovementReleasePacket {
    constructor(direction) {
        this.type = "movementrelease";
        this.direction = direction;
    }
}
exports.MovementReleasePacket = MovementReleasePacket;
// Packet to notify mouse button press
class MousePressPacket {
    constructor(button) {
        this.type = "mousepress";
        this.button = button;
    }
}
exports.MousePressPacket = MousePressPacket;
// Packet to notify mouse button release
class MouseReleasePacket {
    constructor(button) {
        this.type = "mouserelease";
        this.button = button;
    }
}
exports.MouseReleasePacket = MouseReleasePacket;
// Packet to notify mouse movement
class MouseMovePacket {
    constructor(x, y) {
        this.type = "mousemove";
        this.x = x;
        this.y = y;
    }
}
exports.MouseMovePacket = MouseMovePacket;
// Packet to notify interaction (e.g. pickup)
class InteractPacket {
    constructor() {
        this.type = "interact";
    }
}
exports.InteractPacket = InteractPacket;
// Packet to notify weapon switching
class SwitchWeaponPacket {
    constructor(delta) {
        this.type = "switchweapon";
        this.delta = delta;
    }
}
exports.SwitchWeaponPacket = SwitchWeaponPacket;
// Packet to notify weapon reloading
class ReloadWeaponPacket {
    constructor() {
        this.type = "reloadweapon";
    }
}
exports.ReloadWeaponPacket = ReloadWeaponPacket;
/// Packet from server acknowledgement
class AckPacket {
    constructor() {
        this.type = "ack";
    }
}
exports.AckPacket = AckPacket;
/// Packet from server containing game data
class GamePacket {
    constructor() {
        this.type = "game";
    }
}
exports.GamePacket = GamePacket;
/// Packet from server containing map data
class MapPacket {
    constructor() {
        this.type = "map";
    }
}
exports.MapPacket = MapPacket;

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PiecewiseTerrain = exports.LineTerrain = exports.DotTerrain = exports.Terrain = exports.World = void 0;
const entities_1 = require("../store/entities");
const terrains_1 = require("../store/terrains");
const math_1 = require("./math");
const utils_1 = require("../utils");
const obstacles_1 = require("../store/obstacles");
class World {
    constructor(size, defaultTerrain) {
        this.entities = [];
        this.obstacles = [];
        this.terrains = [];
        this.aliveCount = 0;
        if (!size)
            size = math_1.Vec2.ZERO;
        this.size = size;
        if (!defaultTerrain)
            defaultTerrain = new terrains_1.Plain({ id: "plain", border: 0 });
        this.defaultTerrain = defaultTerrain;
    }
    updateEntities(entities) {
        const pending = [];
        for (const entity of entities) {
            const existing = this.entities.find(e => e.id == entity.id);
            if (existing) {
                existing.copy(entity);
                pending.push(existing);
            }
            else
                pending.push((0, entities_1.castCorrectEntity)(entity));
        }
        this.entities = pending;
    }
    updateObstacles(obstacles) {
        const pending = [];
        for (const obstacle of obstacles) {
            const existing = this.obstacles.find(e => e.id == obstacle.id);
            if (existing) {
                existing.copy(obstacle);
                pending.push(existing);
            }
            else
                pending.push((0, obstacles_1.castCorrectObstacle)(obstacle));
        }
        this.obstacles = pending;
    }
    updateLiveCount(count) {
        this.aliveCount = count;
        document.getElementById("playercount").innerText = this.aliveCount.toString();
    }
}
exports.World = World;
class Terrain {
    constructor(minTerrain) {
        this.type = "generic";
        // Use RGB
        this.color = 0;
        this.id = minTerrain.id;
        this.border = minTerrain.border;
    }
    colorToHex(color) {
        if (!color)
            color = this.color;
        return "#" + color.toString(16);
    }
}
exports.Terrain = Terrain;
class DotTerrain extends Terrain {
    constructor(minTerrain) {
        super(minTerrain);
        this.type = "dot";
        this.position = new math_1.Vec2(minTerrain.position.x, minTerrain.position.y);
        this.radius = minTerrain.radius;
    }
    render(you, canvas, ctx, scale) {
        const relative = this.position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.fillStyle = this.colorToHex();
        (0, utils_1.circleFromCenter)(ctx, 0, 0, this.radius * scale);
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.fillStyle = this.colorToHex();
        (0, utils_1.circleFromCenter)(ctx, this.position.x * scale, this.position.y * scale, this.radius * scale);
    }
}
exports.DotTerrain = DotTerrain;
class LineTerrain extends Terrain {
    constructor(minTerrain) {
        super(minTerrain);
        this.type = "line";
        this.line = math_1.Line.fromMinLine(minTerrain.line);
        this.range = minTerrain.range;
        this.boundary = { start: math_1.Vec2.fromMinVec2(minTerrain.boundary[0]), end: math_1.Vec2.fromMinVec2(minTerrain.boundary[1]) };
    }
    render(you, canvas, ctx, scale) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-you.position.x, -you.position.y);
        const lines = this.line.toParallel(this.range, false);
        const start = new math_1.Line(this.line.a, this.boundary.start.addVec(this.line.a), false);
        const end = new math_1.Line(this.line.b, this.boundary.end.addVec(this.line.b), false);
        const a = lines[0].intersection(start);
        if (!a)
            return;
        const b = lines[0].intersection(end);
        if (!b)
            return;
        const c = lines[1].intersection(end);
        if (!c)
            return;
        const d = lines[1].intersection(start);
        if (!d)
            return;
        ctx.fillStyle = this.colorToHex();
        ctx.beginPath();
        ctx.moveTo(a.x - 1 / scale, a.y - 1 / scale);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(d.x - 1 / scale, d.y - 1 / scale);
        ctx.closePath();
        ctx.fill();
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.scale(scale, scale);
        const lines = this.line.toParallel(this.range, false);
        const start = new math_1.Line(this.line.a, this.boundary.start.addVec(this.line.a), false);
        const end = new math_1.Line(this.line.b, this.boundary.end.addVec(this.line.b), false);
        const a = lines[0].intersection(start);
        if (!a)
            return;
        const b = lines[0].intersection(end);
        if (!b)
            return;
        const c = lines[1].intersection(end);
        if (!c)
            return;
        const d = lines[1].intersection(start);
        if (!d)
            return;
        ctx.fillStyle = this.colorToHex();
        ctx.beginPath();
        ctx.moveTo(a.x - 1 / scale, a.y - 1 / scale);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(d.x - 1 / scale, d.y - 1 / scale);
        ctx.closePath();
        ctx.fill();
        ctx.resetTransform();
    }
}
exports.LineTerrain = LineTerrain;
class PiecewiseTerrain extends Terrain {
    constructor(minTerrain) {
        super(minTerrain);
        this.type = "piecewise";
        this.lines = [];
        for (const line of minTerrain.lines)
            this.lines.push((0, terrains_1.castCorrectTerrain)(line));
    }
    render(you, canvas, ctx, scale) {
        this.lines.forEach(line => line.render(you, canvas, ctx, scale));
    }
    renderMap(canvas, ctx, scale) {
        this.lines.forEach(line => line.renderMap(canvas, ctx, scale));
    }
}
exports.PiecewiseTerrain = PiecewiseTerrain;

},{"../store/entities":15,"../store/obstacles":23,"../store/terrains":28,"../utils":43,"./math":38}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyWeapon = exports.GrenadeWeapon = exports.GunWeapon = exports.MeleeWeapon = exports.Weapon = exports.WeaponType = void 0;
const utils_1 = require("../utils");
const math_1 = require("./math");
const constants_1 = require("../constants");
const animations_1 = require("../store/animations");
var WeaponType;
(function (WeaponType) {
    WeaponType["MELEE"] = "melee";
    WeaponType["GUN"] = "gun";
    WeaponType["GRENADE"] = "grenade";
})(WeaponType = exports.WeaponType || (exports.WeaponType = {}));
class Weapon {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}
exports.Weapon = Weapon;
class MeleeWeapon extends Weapon {
    constructor(id, data) {
        super(id, data.name);
        this.type = WeaponType.MELEE;
    }
    render(player, _canvas, ctx, scale) {
        const radius = scale * player.hitbox.radius;
        const fistScale = radius * 1.2 * constants_1.CommonNumber.SIN45;
        const fistExtend = math_1.Vec2.ONE.scaleAll(fistScale);
        const fists = [];
        if (!MeleeWeapon.FIST_ANIMATIONS.some(a => player.animations.find(aa => aa.id == a))) {
            fists.push(fistExtend.addVec(fistExtend.addAngle(constants_1.CommonAngle.PI_TWO)));
            fists.push(fistExtend.addVec(fistExtend.addAngle(-constants_1.CommonAngle.PI_TWO)));
        }
        else {
            for (const animation of player.animations) {
                const anim = animations_1.DEFINED_ANIMATIONS.get(animation.id);
                if (anim) {
                    const index = MeleeWeapon.FIST_ANIMATIONS.indexOf(animation.id);
                    const portion = (anim.duration - animation.duration) / anim.duration;
                    for (let ii = 0; ii < anim.keyframes.length - 1; ii++) {
                        if (portion >= anim.keyframes[ii] && portion <= anim.keyframes[ii + 1]) {
                            const position = anim.positions[ii].addVec(anim.positions[ii + 1].addVec(anim.positions[ii].inverse()).scaleAll((portion - anim.keyframes[ii]) / (anim.keyframes[ii + 1] - anim.keyframes[ii]))).scaleAll(fistScale);
                            // TODO: handle rotation
                            //const rotation = anim.rotations[ii]
                            fists.push(fistExtend.addVec(position));
                            break;
                        }
                    }
                    fists.push(fistExtend.addVec(fistExtend.addAngle(constants_1.CommonAngle.PI_TWO * (-index * 2 + 1))));
                }
            }
        }
        const fistRadius = radius / 3;
        ctx.fillStyle = "#F8C675";
        ctx.lineWidth = fistRadius / 3;
        ctx.strokeStyle = "#000000";
        for (const fist of fists)
            (0, utils_1.circleFromCenter)(ctx, fist.x, fist.y, fistRadius, true, true);
    }
}
exports.MeleeWeapon = MeleeWeapon;
MeleeWeapon.FIST_ANIMATIONS = ["left_fist", "right_fist"];
class GunWeapon extends Weapon {
    constructor(id, data, magazine = 0) {
        super(id, data.name);
        this.type = WeaponType.GUN;
        this.color = data.color;
        this.length = data.length;
        this.magazine = magazine;
    }
    render(player, _canvas, ctx, scale) {
        const radius = scale * player.hitbox.comparable;
        const fistRadius = radius / 3;
        const fistPositions = [new math_1.Vec2(player.hitbox.comparable, 0.1), new math_1.Vec2(player.hitbox.comparable + 0.25, -0.1)];
        var offset = math_1.Vec2.ZERO;
        ctx.fillStyle = "#222";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 0.025 * scale;
        //ctx.fillRect(player.hitbox.comparable * scale, -0.15 * scale, 1.2 * scale, 0.3 * scale);
        (0, utils_1.roundRect)(ctx, player.hitbox.comparable * scale, -0.15 * scale, this.length * scale, 0.3 * scale, 0.15 * scale, true, true);
        ctx.fillStyle = "#F8C675";
        ctx.lineWidth = fistRadius / 3;
        ctx.strokeStyle = "#000000";
        for (const pos of fistPositions) {
            const fist = pos.addVec(offset).scaleAll(scale);
            (0, utils_1.circleFromCenter)(ctx, fist.x, fist.y, fistRadius, true, true);
        }
    }
}
exports.GunWeapon = GunWeapon;
class GrenadeWeapon extends Weapon {
    constructor() {
        super(...arguments);
        this.type = WeaponType.GRENADE;
        //type!: "frag" | "mirv" | "smoke";
    }
}
exports.GrenadeWeapon = GrenadeWeapon;
// Dummy weapon
class DummyWeapon extends Weapon {
    render(_player, _canvas, _ctx, _scale) { }
}
exports.DummyWeapon = DummyWeapon;

},{"../constants":1,"../store/animations":10,"../utils":43,"./math":38}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDegrees = exports.roundRect = exports.lineBetween = exports.circleFromCenter = exports.clamp = exports.wait = void 0;
// Promisified setTimeout
function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
exports.wait = wait;
// Capping value with limits
function clamp(val, min, max) {
    if (val < min)
        return min;
    if (val > max)
        return max;
    return val;
}
exports.clamp = clamp;
// Draws circle with x, y center
function circleFromCenter(ctx, x, y, radius, fill = true, stroke = false) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.closePath();
    if (fill)
        ctx.fill();
    if (stroke)
        ctx.stroke();
}
exports.circleFromCenter = circleFromCenter;
// Strokes a line between (x1, y1) and (x2, y2)
function lineBetween(ctx, x1, y1, x2, y2, stroke = true) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    if (stroke)
        ctx.stroke();
}
exports.lineBetween = lineBetween;
// Draws a rounded rectangle
function roundRect(ctx, x, y, width, height, radius, fill = true, stroke = false) {
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    var tl, tr, bl, br;
    if (typeof radius === 'number')
        tl = tr = bl = br = radius;
    else {
        tl = radius.tl || 0;
        tr = radius.tr || 0;
        br = radius.br || 0;
        bl = radius.bl || 0;
    }
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + width - tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
    ctx.lineTo(x + width, y + height - br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
    ctx.lineTo(x + bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
    ctx.lineTo(x, y + tl);
    ctx.quadraticCurveTo(x, y, x + tl, y);
    ctx.closePath();
    if (fill)
        ctx.fill();
    if (stroke)
        ctx.stroke();
}
exports.roundRect = roundRect;
// Converts radian to degrees
function toDegrees(radian) {
    return radian * 180 / Math.PI;
}
exports.toDegrees = toDegrees;

},{}],44:[function(require,module,exports){
/* globals msgpack */
module.exports = msgpack;

},{}]},{},[2]);
