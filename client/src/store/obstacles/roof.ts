import { OBSTACLE_SUPPLIERS } from ".";
import { getTexture } from "../../textures";
import { TextureData } from "../../types/data";
import { CircleHitbox, RectHitbox, Vec2 } from "../../types/math";
import { MinObstacle } from "../../types/minimized";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";
import { circleFromCenter, numToRGBA } from "../../utils";
import { Player } from "../entities";

interface AdditionalObstacle {
	color: number;
	texture?: TextureData;
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
	texture?: TextureData;
	textureCache?: HTMLCanvasElement;
	zIndex = 999;
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
			if (this.opacity < 0) this.opacity = 0;
		} else {
			if (this.opacity < 1) this.opacity += 0.05;
			if (this.opacity > 1) this.opacity = 1;
		}
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.scale(scale, scale);
		ctx.rotate(-this.direction.angle());
		ctx.globalAlpha = this.opacity;
		if (this.texture?.path) {
			const img = getTexture("assets/images/game/textures/" + this.texture.path);
			let dim: Vec2;
			if (this.hitbox.type === "circle") {
				const radius = (<CircleHitbox>this.hitbox).radius;
				dim = new Vec2(radius * 2, radius * 2);
			} else {
				const rect = <RectHitbox>this.hitbox;
				dim = new Vec2(rect.width, rect.height);
			}
			if (!img?.complete) this.defaultRender(ctx);
			else if (this.texture.path.startsWith("fixed")) ctx.drawImage(img, -dim.x * 0.5, -dim.y * 0.5, dim.x, dim.y);
			else {
				if (!this.textureCache) {
					this.textureCache = document.createElement("canvas");
					this.textureCache.width = canvas.height * dim.x / dim.y;
					this.textureCache.height = canvas.height;
					const tCtx = this.textureCache.getContext("2d")!;
					const fill = Math.round(this.texture.horizontalFill || 1);
					const width = this.textureCache.width / fill;
					const height = width * img.height / img.width;
					for (let ii = 0; ii < Math.ceil(this.textureCache.height / height); ii++)
						for (let jj = 0; jj < fill; jj++)
							tCtx.drawImage(img, width * jj, height * ii, width, height);
				}
				ctx.drawImage(this.textureCache, -dim.x * 0.5, -dim.y * 0.5, dim.x, dim.y);
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