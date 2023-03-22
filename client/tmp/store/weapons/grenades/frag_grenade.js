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
//# sourceMappingURL=frag_grenade.js.map