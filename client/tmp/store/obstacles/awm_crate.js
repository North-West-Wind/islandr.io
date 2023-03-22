"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const obstacle_1 = require("../../types/obstacle");
const awmCrateImg = Object.assign(new Image(), { loaded: false });
awmCrateImg.onload = () => awmCrateImg.loaded = true;
awmCrateImg.src = "assets/images/game/objects/awm_crate.png";
const awmCrateResidueImg = Object.assign(new Image(), { loaded: false });
awmCrateResidueImg.onload = () => awmCrateResidueImg.loaded = true;
awmCrateResidueImg.src = "assets/images/game/objects/residues/crate.svg";
class AWMCrateSupplier {
    create(minObstacle) {
        return new AWMCrate(minObstacle);
    }
}
class AWMCrate extends obstacle_1.Obstacle {
    constructor() {
        super(...arguments);
        this.type = AWMCrate.TYPE;
    }
    render(you, canvas, ctx, scale) {
        if (!awmCrateImg.loaded || !awmCrateResidueImg.loaded)
            return;
        const relative = this.position.addVec(you.position.inverse());
        const width = scale * this.hitbox.width * (this.despawn ? 0.5 : 1), height = width * awmCrateImg.naturalWidth / awmCrateImg.naturalHeight;
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        ctx.drawImage(this.despawn ? awmCrateResidueImg : awmCrateImg, -width / 2, -height / 2, width + 1, height + 0.5);
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.translate(this.position.x * scale, this.position.y * scale);
        ctx.fillStyle = "#683c05";
        ctx.fillRect(-2 * scale, -2 * scale, 5 * scale, 4 * scale);
        ctx.resetTransform();
    }
}
exports.default = AWMCrate;
AWMCrate.TYPE = "AWMCrate";
(() => {
    _1.OBSTACLE_SUPPLIERS.set(AWMCrate.TYPE, new AWMCrateSupplier());
})();
//# sourceMappingURL=awm_crate.js.map