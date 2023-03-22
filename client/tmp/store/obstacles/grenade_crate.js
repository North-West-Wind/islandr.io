"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const obstacle_1 = require("../../types/obstacle");
const grenadeCrateImg = Object.assign(new Image(), { loaded: false });
grenadeCrateImg.onload = () => grenadeCrateImg.loaded = true;
grenadeCrateImg.src = "assets/images/game/objects/grenade_crate.png";
const grenadeCrateResidueImg = Object.assign(new Image(), { loaded: false });
grenadeCrateResidueImg.onload = () => grenadeCrateResidueImg.loaded = true;
grenadeCrateResidueImg.src = "assets/images/game/objects/residues/crate.svg";
class GrenadeCrateSupplier {
    create(minObstacle) {
        return new GrenadeCrate(minObstacle);
    }
}
class GrenadeCrate extends obstacle_1.Obstacle {
    constructor() {
        super(...arguments);
        this.type = GrenadeCrate.TYPE;
    }
    render(you, canvas, ctx, scale) {
        if (!grenadeCrateImg.loaded || !grenadeCrateResidueImg.loaded)
            return;
        const relative = this.position.addVec(you.position.inverse());
        const width = scale * this.hitbox.width * (this.despawn ? 0.5 : 1), height = width * grenadeCrateImg.naturalWidth / grenadeCrateImg.naturalHeight;
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        ctx.drawImage(this.despawn ? grenadeCrateResidueImg : grenadeCrateImg, -width / 2, -height / 2, width, height);
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.translate(this.position.x * scale, this.position.y * scale);
        ctx.fillStyle = "#46502d";
        ctx.fillRect(-1.5 * scale, -1.5 * scale, 3 * scale, 3 * scale);
        ctx.resetTransform();
    }
}
exports.default = GrenadeCrate;
GrenadeCrate.TYPE = "grenade_crate";
(() => {
    _1.OBSTACLE_SUPPLIERS.set(GrenadeCrate.TYPE, new GrenadeCrateSupplier());
})();
//# sourceMappingURL=grenade_crate.js.map