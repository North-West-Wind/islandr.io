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
//# sourceMappingURL=gun.js.map