import { Player } from "../entities";
import { Obstacle } from "../../types/obstacle";
import { MinObstacle } from "../../types/minimized";
import { circleFromCenter } from "../../utils";
import { ObstacleSupplier } from "../../types/supplier";
import { OBSTACLE_SUPPLIERS } from ".";

const treeImg: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
treeImg.onload = () => treeImg.loaded = true;
treeImg.src = "assets/images/game/objects/mosin_tree.svg";

const treeResidueImg: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
treeResidueImg.onload = () => treeResidueImg.loaded = true;
treeResidueImg.src = "assets/images/game/objects/residues/tree.svg";

class MosinTreeSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle) {
		return new MosinTree(minObstacle);
	}
}

export default class MosinTree extends Obstacle {
	static readonly TYPE = "mosin_tree";
	type = MosinTree.TYPE;
	zIndex = 1000;

	static {
		OBSTACLE_SUPPLIERS.set(MosinTree.TYPE, new MosinTreeSupplier());
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		if (!treeImg.loaded || !treeResidueImg.loaded) return;
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		const img = this.despawn ? treeResidueImg : treeImg;
		const width = scale * this.hitbox.comparable * 2 * (this.despawn ? 1 : 3.6), height = width * img.naturalWidth / img.naturalHeight;
		ctx.drawImage(img, -width / 2, -height / 2, width, height);
		ctx.resetTransform();
	}

	renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		ctx.fillStyle = "#3e502e";
		circleFromCenter(ctx, this.position.x * scale, this.position.y * scale, 1.5 * scale * 3.6);
	}
}