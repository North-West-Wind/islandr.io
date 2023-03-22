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
//# sourceMappingURL=renderer.js.map