import { OBSTACLE_SUPPLIERS } from ".";
import { getMode } from "../../homepage";
import { MinObstacle } from "../../types/minimized";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";
import { circleFromCenter } from "../../utils";
import { Player } from "../entities";

interface AdditionObstacle {
	special: "normal" | "ak47";
}

class StoneSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle & AdditionObstacle) {
		return new Stone(minObstacle);
	}
}

export default class Stone extends Obstacle {
	static readonly TYPE = "stone";
	type = Stone.TYPE;
	special!: "normal" | "ak47";
	static stoneImg = new Image();
	static ak47stoneImg = new Image();

	static {
		OBSTACLE_SUPPLIERS.set(Stone.TYPE, new StoneSupplier());
	}
	static updateAssets() {
		this.stoneImg.src = "assets/" + getMode() + "/images/game/objects/stone.svg";
		this.ak47stoneImg.src = "assets/" + getMode() + "/images/game/objects/ak47_stone.svg";
	}

	copy(minObstacle: MinObstacle & AdditionObstacle) {
		super.copy(minObstacle);
		this.special = minObstacle.special;
	}
	
	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		var img: HTMLImageElement;
		switch (this.special) {
			case "ak47":
				img = Stone.ak47stoneImg;
				break;
			default:
				img = Stone.stoneImg;
				break;
		}
		if (!img.complete) return;
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		if (!this.despawn) {
			const width = scale * this.hitbox.comparable * 2, height = width * Stone.stoneImg.naturalWidth / Stone.stoneImg.naturalHeight;
			ctx.drawImage(img, -width / 2, -height / 2, width, height);
		} else {
			const radius = scale * this.hitbox.comparable / 2;
			ctx.fillStyle = "#000000";
			ctx.globalAlpha = 0.25;
			circleFromCenter(ctx, 0, 0, radius);
			ctx.globalAlpha = 1;
		}
		ctx.resetTransform();
	}

	renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		ctx.fillStyle = "#b3b3b3";
		circleFromCenter(ctx, this.position.x * scale, this.position.y * scale, 2 * scale);
	}
}