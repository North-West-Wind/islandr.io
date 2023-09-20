import { OBSTACLE_SUPPLIERS } from ".";
import { getTexture } from "../../textures";
import { CircleHitbox, Hitbox, RectHitbox, Vec2 } from "../../types/math";
import { MinHitbox, MinObstacle, MinVec2 } from "../../types/minimized";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";
import { circleFromCenter, numToRGBA } from "../../utils";
import { Player } from "../entities";

interface AdditionalObstacle {
	color: number;
	texture?: { path: string, horizontalFill?: number };
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
	texture?: { path: string, horizontalFill?: number };
	zIndex = 1000;
	opacity = 1;

	static {
		OBSTACLE_SUPPLIERS.set(Roof.ID, new RoofSupplier());
	}

	copy(minObstacle: MinObstacle & AdditionalObstacle) {
		super.copy(minObstacle);
		this.color = minObstacle.color;
		this.roofless = new Set(minObstacle.roofless);
		this.texture = minObstacle.texture;
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		// We should actually care about fps, but I'm too lazy
		if (this.roofless.has(you.id)) {
			if (this.opacity > 0) this.opacity -= 0.05;
			else this.opacity = 0;
		} else {
			if (this.opacity < 1) this.opacity += 0.05;
			else this.opacity = 1;
		}
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.scale(scale, scale);
		ctx.rotate(-this.direction.angle());
		ctx.globalAlpha = this.opacity;
		if (this.texture?.path) {
			const img = getTexture("assets/images/game/textures/" + this.texture.path);
			if (!img?.complete) this.defaultRender(ctx);
			else if (this.texture.path.startsWith("fixed")) {
				if (this.hitbox.type === "circle") {
					const radius = (<CircleHitbox>this.hitbox).radius;
					ctx.drawImage(img, -radius, -radius, radius * 2, radius * 2);
				} else {
					const rect = <RectHitbox>this.hitbox;
					ctx.drawImage(img, -rect.width / 2, -rect.height / 2, rect.width, rect.height);
				}
			}
		} else this.defaultRender(ctx);
		ctx.globalAlpha = 1;
		ctx.resetTransform();
	}

	defaultRender(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = numToRGBA(this.color);
		if (this.hitbox.type === "circle")
			circleFromCenter(ctx, 0, 0, this.hitbox.comparable);
		else {
			const rect = <RectHitbox>this.hitbox;
			ctx.fillRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
		}
	}

	// buildings will handle it
	renderMap(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number) { }
}