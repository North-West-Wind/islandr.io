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
//# sourceMappingURL=prompt.js.map