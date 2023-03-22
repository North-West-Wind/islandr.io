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
//# sourceMappingURL=ammo.js.map