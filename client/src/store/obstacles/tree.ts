import { Player } from "../entities";
import { Obstacle } from "../../types/obstacle";
import { MinObstacle } from "../../types/minimized";
import { circleFromCenter } from "../../utils";
import { ObstacleSupplier } from "../../types/supplier";
import { OBSTACLE_SUPPLIERS } from ".";
import { getMode } from "../../homepage";

interface AdditionalObstacle {
	special: "normal" | "mosin";
}

class TreeSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle) {
		return new Tree(minObstacle);
	}
}

export default class Tree extends Obstacle {
	static readonly TYPE = "tree";
	type = Tree.TYPE;
	zIndex = 1000;
	static treeImg = new Image();
	static mosinTreeImg = new Image();
	static treeResidueImg = new Image();

	special!: "normal" | "mosin";

	static {
		OBSTACLE_SUPPLIERS.set(Tree.TYPE, new TreeSupplier());
	}

	static updateAssets() {
		this.treeImg.src = "assets/" + getMode() + "/images/game/objects/tree.svg";
		this.mosinTreeImg.src = "assets/" + getMode() + "/images/game/objects/mosin_tree.svg";
		this.treeResidueImg.src = "assets/" + getMode() + "/images/game/objects/residues/tree.svg";
	}

	copy(minObstacle: MinObstacle & AdditionalObstacle) {
		super.copy(minObstacle);
		this.special = minObstacle.special;
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		var img: HTMLImageElement;
		var renderScale = 1;
		if (this.despawn) img = Tree.treeResidueImg;
		else switch (this.special) {
			case "mosin":
				img = Tree.mosinTreeImg;
				renderScale = 3.6;
				break;
			default:
				img = Tree.treeImg;
				renderScale = 5;
		}
		if (!img.complete || !Tree.treeResidueImg.complete) return;
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		const width = scale * this.hitbox.comparable * 2 * renderScale, height = width * img.naturalWidth / img.naturalHeight;
		ctx.drawImage(img, -width / 2, -height / 2, width, height);
		ctx.resetTransform();
	}

	renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		ctx.fillStyle = "#3e502e";
		circleFromCenter(ctx, this.position.x * scale, this.position.y * scale, 1.5 * scale * 3.6);
	}
}