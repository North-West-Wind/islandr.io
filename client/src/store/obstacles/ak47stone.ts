import { OBSTACLE_SUPPLIERS } from ".";
import { MinObstacle } from "../../types/minimized";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";
import { circleFromCenter } from "../../utils";
import { Player } from "../entities";

const ak47stoneImg: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
ak47stoneImg.onload = () => ak47stoneImg.loaded = true;
ak47stoneImg.src = "assets/images/game/objects/ak47_stone.svg";

class AK47StoneSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle) {
		return new AK47Stone(minObstacle);
	}
}

export default class AK47Stone extends Obstacle {
	static readonly TYPE = "ak47-stone";
	type = AK47Stone.TYPE;

	static {
		OBSTACLE_SUPPLIERS.set(AK47Stone.TYPE, new AK47StoneSupplier());
	}
	
	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		if (!ak47stoneImg.loaded) return;
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		if (!this.despawn) {
			const width = scale * this.hitbox.comparable * 2, height = width * ak47stoneImg.naturalWidth / ak47stoneImg.naturalHeight;
			ctx.drawImage(ak47stoneImg, -width / 2, -height / 2, width, height);
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