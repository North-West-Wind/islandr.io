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
//# sourceMappingURL=bullet.js.map