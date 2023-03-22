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
//# sourceMappingURL=hud.js.map