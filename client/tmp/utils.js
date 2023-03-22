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
//# sourceMappingURL=utils.js.map