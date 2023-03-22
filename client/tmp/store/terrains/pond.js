"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const terrain_1 = require("../../types/terrain");
const utils_1 = require("../../utils");
const _1 = require(".");
class PondSupplier {
    create(minTerrain) {
        return new Pond(minTerrain);
    }
}
class Pond extends terrain_1.DotTerrain {
    constructor(minTerrain) {
        super(minTerrain);
        this.id = Pond.ID;
        this.color = 0x3481ab;
        this.secondaryColor = 0x905e26;
    }
    renderLayerN1(you, canvas, ctx, scale) {
        const relative = this.position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.fillStyle = this.colorToHex(this.secondaryColor);
        (0, utils_1.circleFromCenter)(ctx, 0, 0, (this.radius + this.border) * scale);
        ctx.resetTransform();
    }
    renderMapLayerN1(_canvas, ctx, scale) {
        ctx.fillStyle = this.colorToHex(this.secondaryColor);
        (0, utils_1.circleFromCenter)(ctx, this.position.x * scale, this.position.y * scale, (this.radius + this.border) * scale);
    }
}
exports.default = Pond;
Pond.ID = "pond";
(() => {
    _1.TERRAIN_SUPPLIERS.set(Pond.ID, new PondSupplier());
})();
//# sourceMappingURL=pond.js.map