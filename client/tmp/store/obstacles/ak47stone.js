"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const obstacle_1 = require("../../types/obstacle");
const utils_1 = require("../../utils");
const ak47stoneImg = Object.assign(new Image(), { loaded: false });
ak47stoneImg.onload = () => ak47stoneImg.loaded = true;
ak47stoneImg.src = "assets/images/game/objects/ak47stone.png";
class AK47StoneSupplier {
    create(minObstacle) {
        return new AK47Stone(minObstacle);
    }
}
class AK47Stone extends obstacle_1.Obstacle {
    constructor() {
        super(...arguments);
        this.type = AK47Stone.TYPE;
    }
    render(you, canvas, ctx, scale) {
        if (!ak47stoneImg.loaded)
            return;
        const relative = this.position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        if (!this.despawn) {
            const width = scale * this.hitbox.comparable * 2, height = width * ak47stoneImg.naturalWidth / ak47stoneImg.naturalHeight;
            ctx.drawImage(ak47stoneImg, -width / 2, -height / 2, width, height);
        }
        else {
            const radius = scale * this.hitbox.comparable / 2;
            ctx.fillStyle = "#000000";
            ctx.globalAlpha = 0.25;
            (0, utils_1.circleFromCenter)(ctx, 0, 0, radius);
            ctx.globalAlpha = 1;
        }
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.fillStyle = "#b3b3b3";
        (0, utils_1.circleFromCenter)(ctx, this.position.x * scale, this.position.y * scale, 2 * scale);
    }
}
exports.default = AK47Stone;
AK47Stone.TYPE = "ak47-stone";
(() => {
    _1.OBSTACLE_SUPPLIERS.set(AK47Stone.TYPE, new AK47StoneSupplier());
})();
//# sourceMappingURL=ak47stone.js.map