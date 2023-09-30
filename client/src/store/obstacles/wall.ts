import { OBSTACLE_SUPPLIERS } from ".";
import { RenderableLayerN1 } from "../../types/extenstions";
import { RectHitbox } from "../../types/math";
import { MinObstacle } from "../../types/minimized";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";
import { numToRGBA } from "../../utils";
import { Player } from "../entities";

interface AdditionalObstacle {
	color: number;
}

class WallSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle & AdditionalObstacle) {
		return new Wall(minObstacle);
	}
}

export default class Wall extends Obstacle implements RenderableLayerN1 {
	static readonly TYPE = "wall";
	type = Wall.TYPE;
	color!: number;
	zIndex = 1;

	static {
		OBSTACLE_SUPPLIERS.set(Wall.TYPE, new WallSupplier());
	}

	copy(minObstacle: MinObstacle & AdditionalObstacle) {
		super.copy(minObstacle);
		this.color = minObstacle.color;
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void {
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		ctx.scale(scale, scale);
		let width = (<RectHitbox>this.hitbox).width;
		let height = (<RectHitbox>this.hitbox).height;
		if (this.despawn) {
			width += 0.5;
			height += 0.5;
			ctx.globalAlpha = 0.4;
		}
		ctx.fillStyle = numToRGBA(this.color);
		ctx.fillRect(-width / 2, -height / 2, width, height);
		ctx.globalAlpha = 1;
		ctx.resetTransform();
	}

	renderLayerN1(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		if (this.despawn) return;
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		ctx.scale(scale, scale);
		const width = (<RectHitbox>this.hitbox).width + 0.5;
		const height = (<RectHitbox>this.hitbox).height + 0.5;
		ctx.fillStyle = "#333";
		ctx.fillRect(-width / 2, -height / 2, width, height);
		ctx.resetTransform();
	}

	// Don't draw anything on map as buildings will handle it
	renderMap(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number) { }
}