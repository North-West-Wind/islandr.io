"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const obstacle_1 = require("../../types/obstacle");
const utils_1 = require("../../utils");
const stoneImg = Object.assign(new Image(), { loaded: false });
stoneImg.onload = () => stoneImg.loaded = true;
stoneImg.src = "assets/images/game/objects/stone.svg";
class StoneSupplier {
    create(minObstacle) {
        return new Stone(minObstacle);
    }
}
class Stone extends obstacle_1.Obstacle {
    constructor() {
        super(...arguments);
        this.type = Stone.TYPE;
    }
    render(you, canvas, ctx, scale) {
        if (!stoneImg.loaded)
            return;
        const relative = this.position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        if (!this.despawn) {
            const width = scale * this.hitbox.comparable * 2, height = width * stoneImg.naturalWidth / stoneImg.naturalHeight;
            ctx.drawImage(stoneImg, -width / 2, -height / 2, width, height);
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
exports.default = Stone;
Stone.TYPE = "stone";
(() => {
    _1.OBSTACLE_SUPPLIERS.set(Stone.TYPE, new StoneSupplier());
})();
//# sourceMappingURL=stone.js.map