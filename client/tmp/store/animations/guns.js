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
//# sourceMappingURL=guns.js.map