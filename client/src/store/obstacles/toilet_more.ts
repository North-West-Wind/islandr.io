import { Player } from "../entities";
import { Obstacle } from "../../types/obstacle";
import { MinObstacle } from "../../types/minimized";
import { circleFromCenter } from "../../utils";
import { ObstacleSupplier } from "../../types/supplier";
import { OBSTACLE_SUPPLIERS } from ".";
import { getMode } from "../../homepage";

class ToiletMoreSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle) {
		return new ToiletMore(minObstacle);
	}
}

// ToiletMore
export default class ToiletMore extends Obstacle {
	static readonly TYPE = "toilet_more";
	type = ToiletMore.TYPE;
	zIndex = 9;
	static toiletMoreImg = new Image();
	static toiletMResidueImg = new Image();

	static {
		OBSTACLE_SUPPLIERS.set(ToiletMore.TYPE, new ToiletMoreSupplier());
	}

	static updateAssets() {
		this.toiletMoreImg.src = "assets/" + getMode() + "/images/game/objects/toilet_more.svg";
		this.toiletMResidueImg.src = "assets/" + getMode() + "/images/game/objects/residues/toilet.svg";
	}


	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void {
		if (!ToiletMore.toiletMoreImg.complete || !ToiletMore.toiletMResidueImg.complete) return;
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		const img = this.despawn ? ToiletMore.toiletMResidueImg : ToiletMore.toiletMoreImg;
		// Times 2 because radius * 2 = diameter
		const width = scale * this.hitbox.comparable * 2, height = width * img.naturalWidth / img.naturalHeight;
		ctx.drawImage(img, -width / 2, -height / 2, width, height);
		ctx.resetTransform();
	}

	renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		ctx.fillStyle = "#005f00";
		circleFromCenter(ctx, this.position.x * scale, this.position.y * scale, 2 * scale);
	}
}