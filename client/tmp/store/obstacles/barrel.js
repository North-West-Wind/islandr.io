"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obstacle_1 = require("../../types/obstacle");
const utils_1 = require("../../utils");
const _1 = require(".");
const barrelImg = Object.assign(new Image(), { loaded: false });
barrelImg.onload = () => barrelImg.loaded = true;
barrelImg.src = "assets/images/game/objects/barrel.png";
const barrelResidueImg = Object.assign(new Image(), { loaded: false });
barrelResidueImg.onload = () => barrelResidueImg.loaded = true;
barrelResidueImg.src = "assets/images/game/objects/residues/barrel.png";
class BarrelSupplier {
    create(minObstacle) {
        return new Barrel(minObstacle);
    }
}
// Barrel
class Barrel extends obstacle_1.Obstacle {
    constructor() {
        super(...arguments);
        this.type = Barrel.TYPE;
        this.zIndex = 0;
    }
    render(you, canvas, ctx, scale) {
        if (!barrelImg.loaded || !barrelResidueImg.loaded)
            return;
        const relative = this.position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        const img = this.despawn ? barrelResidueImg : barrelImg;
        // Times 2 because radius * 2 = diameter
        const width = scale * this.hitbox.comparable * 2 * (this.despawn ? 0.5 : 1), height = width * img.naturalWidth / img.naturalHeight;
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.fillStyle = "#005f00";
        (0, utils_1.circleFromCenter)(ctx, this.position.x * scale, this.position.y * scale, 2 * scale);
    }
}
exports.default = Barrel;
Barrel.TYPE = "barrel";
(() => {
    _1.OBSTACLE_SUPPLIERS.set(Barrel.TYPE, new BarrelSupplier());
})();
//# sourceMappingURL=barrel.js.map