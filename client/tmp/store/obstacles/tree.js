"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obstacle_1 = require("../../types/obstacle");
const utils_1 = require("../../utils");
const _1 = require(".");
const treeImg = Object.assign(new Image(), { loaded: false });
treeImg.onload = () => treeImg.loaded = true;
treeImg.src = "assets/images/game/objects/tree.svg";
const treeResidueImg = Object.assign(new Image(), { loaded: false });
treeResidueImg.onload = () => treeResidueImg.loaded = true;
treeResidueImg.src = "assets/images/game/objects/residues/tree.svg";
class TreeSupplier {
    create(minObstacle) {
        return new Tree(minObstacle);
    }
}
class Tree extends obstacle_1.Obstacle {
    constructor() {
        super(...arguments);
        this.type = Tree.TYPE;
        this.zIndex = 1000;
    }
    copy(minObstacle) {
        super.copy(minObstacle);
        if (this.despawn)
            this.zIndex = 0;
    }
    render(you, canvas, ctx, scale) {
        if (!treeImg.loaded || !treeResidueImg.loaded)
            return;
        const relative = this.position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.rotate(-this.direction.angle());
        const img = this.despawn ? treeResidueImg : treeImg;
        const width = scale * this.hitbox.comparable * 2 * (this.despawn ? 1 : 3.6), height = width * img.naturalWidth / img.naturalHeight;
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.resetTransform();
    }
    renderMap(_canvas, ctx, scale) {
        ctx.fillStyle = "#3e502e";
        (0, utils_1.circleFromCenter)(ctx, this.position.x * scale, this.position.y * scale, 1.5 * scale * 3.6);
    }
}
exports.default = Tree;
Tree.TYPE = "tree";
(() => {
    _1.OBSTACLE_SUPPLIERS.set(Tree.TYPE, new TreeSupplier());
})();
//# sourceMappingURL=tree.js.map