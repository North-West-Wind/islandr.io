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
//# sourceMappingURL=fists.js.map