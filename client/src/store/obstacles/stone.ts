import { OBSTACLE_SUPPLIERS } from ".";
import { MinObstacle } from "../../types/minimized";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";
import { circleFromCenter } from "../../utils";
import { Player } from "../entities";

const stoneImg: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
stoneImg.onload = () => stoneImg.loaded = true;
stoneImg.src = "assets/images/game/objects/stone.svg";

class StoneSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle) {
		return new Stone(minObstacle);
	}
}

export default class Stone extends Obstacle {
	static readonly TYPE = "stone";
	type = Stone.TYPE;

	static {
		OBSTACLE_SUPPLIERS.set(Stone.TYPE, new StoneSupplier());
	}
	
	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		if (!stoneImg.loaded) return;
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		if (!this.despawn) {
			const width = scale * this.hitbox.comparable * 2, height = width * stoneImg.naturalWidth / stoneImg.naturalHeight;
			ctx.drawImage(stoneImg, -width / 2, -height / 2, width, height);
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