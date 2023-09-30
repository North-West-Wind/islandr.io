import { OBSTACLE_SUPPLIERS } from ".";
import { RenderableLayerN1 } from "../../types/extenstions";
import { RectHitbox } from "../../types/math";
import { MinObstacle } from "../../types/minimized";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";
import { Player } from "../entities";

class DoorSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle) {
		return new Door(minObstacle);
	}
}

export default class Door extends Obstacle implements RenderableLayerN1 {
	static readonly TYPE = "door";
	type = Door.TYPE;
	
	static {
		OBSTACLE_SUPPLIERS.set(Door.TYPE, new DoorSupplier());
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void {
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		ctx.scale(scale, scale);
		const width = (<RectHitbox>this.hitbox).width;
		const height = (<RectHitbox>this.hitbox).height;
		ctx.fillStyle = "#cccccc";
		ctx.fillRect(-width / 2, -height / 2, width, height);
		ctx.resetTransform();
	}

	renderLayerN1(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void {
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		ctx.scale(scale, scale);
		const width = (<RectHitbox>this.hitbox).width + 0.25;
		const height = (<RectHitbox>this.hitbox).height + 0.25;
		ctx.fillStyle = "#333";
		ctx.fillRect(-width / 2, -height / 2, width, height);
		ctx.resetTransform();
	}

	// Don't draw anything on map as buildings will handle it
	renderMap(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number) { }
}