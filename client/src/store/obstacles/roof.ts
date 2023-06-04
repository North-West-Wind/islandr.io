import { OBSTACLE_SUPPLIERS } from ".";
import { Hitbox, RectHitbox, Vec2 } from "../../types/math";
import { MinHitbox, MinObstacle, MinVec2 } from "../../types/minimized";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";
import { circleFromCenter, numToRGBA } from "../../utils";
import { Player } from "../entities";

interface AdditionalObstacle {
	color: number;
	roofless: string[];
}

class RoofSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle & AdditionalObstacle) {
		return new Roof(minObstacle);
	}
}

export default class Roof extends Obstacle {
	static readonly ID = "roof";
	type = Roof.ID;
	color!: number;
	roofless!: Set<string>;
	zIndex = 1000;

	static {
		OBSTACLE_SUPPLIERS.set(Roof.ID, new RoofSupplier());
	}

	copy(minObstacle: MinObstacle & AdditionalObstacle) {
		super.copy(minObstacle);
		this.color = minObstacle.color;
		this.roofless = new Set(minObstacle.roofless);
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		if (this.roofless.has(you.id)) return;
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.scale(scale, scale);
		ctx.rotate(this.direction.angle());
		ctx.fillStyle = numToRGBA(this.color);
		if (this.hitbox.type === "circle")
			circleFromCenter(ctx, 0, 0, this.hitbox.comparable);
		else {
			const rect = <RectHitbox>this.hitbox;
			ctx.fillRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
		}
		ctx.resetTransform();
	}

	// buildings will handle it
	renderMap(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number) { }
}