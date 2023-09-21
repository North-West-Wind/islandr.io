import { Player } from "../store/entities";
import { getParticleImagePath } from "../textures";
import { circleFromCenter, clamp } from "../utils";
import { CommonAngles, Vec2 } from "./math";
import { MinParticle } from "./minimized";

export abstract class Particle {
	id!: string;
	type = "generic";
	position: Vec2;
	size: number;
	ended = false;
	zIndex = 0;

	constructor(minParticle: MinParticle) {
		this.position = Vec2.fromMinVec2(minParticle.position);
		this.size = minParticle.size;
	}

	abstract renderTick(time: number): void;
	abstract render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}

export class DummyParticle extends Particle {
	static readonly TYPE = "dummy";
	type = DummyParticle.TYPE;

	renderTick() { }
	render() { }
}

export abstract class FadeParticle extends Particle {
	type = "fade";
	duration: number; // In milliseconds
	fadeStart: number;

	constructor(minParticle: MinParticle & { duration: number, fadeStart: number }) {
		super(minParticle);
		this.duration = minParticle.duration;
		this.fadeStart = minParticle.fadeStart;
	}

	// Follows server TPS
	renderTick(time: number) {
		this.duration -= time;
		if (this.duration <= 0) this.ended = true;
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.scale(scale, scale);
		ctx.globalAlpha = clamp(this.duration, 0, this.fadeStart) / this.fadeStart;
		this.actualRender(ctx);
		ctx.globalAlpha = 1;
		ctx.resetTransform();
	}

	abstract actualRender(ctx: CanvasRenderingContext2D): void;
}

export class TextureFadeParticle extends FadeParticle {
	static readonly particleImages = new Map<string, HTMLImageElement>();
	type = "texture_fade";
	texture?: string;
	direction: Vec2;
	angle: number;

	constructor(minParticle: MinParticle & { duration: number, fadeStart: number }) {
		super(minParticle);
		this.direction = Vec2.UNIT_X.addAngle(Math.random() * CommonAngles.TWO_PI);
		this.angle = Math.random() * CommonAngles.TWO_PI;
	}

	renderTick(time: number) {
		super.renderTick(time);
		this.position = this.position.addVec(this.direction.scaleAll(time / 1000));
		this.angle += 0.01;
	}

	actualRender(ctx: CanvasRenderingContext2D) {
		if (!this.texture) return;
		ctx.rotate(this.angle);
		const img = TextureFadeParticle.particleImages.get(this.texture);
		if (!img) {
			const newImg = new Image();
			newImg.src = getParticleImagePath(this.texture);
			TextureFadeParticle.particleImages.set(this.texture, newImg);
		} else if (img.complete) ctx.drawImage(img, -this.size * 0.5, -this.size * 0.5, this.size, this.size);
	}
}

export class GrowFadeParticle extends FadeParticle {
	type = "grow_fade";
	color: number;
	growSpeed: number; // units per second

	constructor(minParticle: MinParticle & { duration: number, fadeStart: number, color: number, growSpeed: number }) {
		super(minParticle);
		this.color = minParticle.color;
		this.growSpeed = minParticle.growSpeed;
	}

	colorToHex(color?: number) {
		if (!color) color = this.color;
		return "#" + color.toString(16);
	}

	renderTick(time: number) {
		super.renderTick(time);
		this.size += this.growSpeed * time / 1000;
	}

	actualRender(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = this.colorToHex();
		circleFromCenter(ctx, 0, 0, this.size);
	}
}