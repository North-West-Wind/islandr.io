import { Player } from "../store/entities";
import { circleFromCenter, clamp } from "../utils";
import { CommonAngles, Vec2 } from "./math";
import { MinParticle } from "./minimized";

export abstract class Particle {
	type = "generic";
	position: Vec2;
	size: number;
	ended = false;

	constructor(minParticle: MinParticle) {
		this.position = Vec2.fromMinVec2(minParticle.position);
		this.size = minParticle.size;
	}

	abstract clientTick(): void;
	abstract render(you: Player, ctx: CanvasRenderingContext2D, scale: number): void;
}

export class DummyParticle extends Particle {
	static readonly TYPE = "dummy";
	type = DummyParticle.TYPE;

	clientTick() { }
	render() { }
}

export abstract class FadeParticle extends Particle {
	type = "fade";
	duration: number; // In ticks

	constructor(minParticle: MinParticle & { duration: number }) {
		super(minParticle);
		this.duration = minParticle.duration;
	}

	// Follows server TPS
	clientTick() {
		this.duration--;
		if (this.duration <= 0) this.ended = true;
	}

	render(you: Player, ctx: CanvasRenderingContext2D, scale: number) {
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(ctx.canvas.width / 2 + relative.x * scale, ctx.canvas.height / 2 + relative.y * scale);
		ctx.scale(scale, scale);
		ctx.globalAlpha = clamp(this.duration, 0, 60) / 60;
		this.actualRender(ctx);
		ctx.globalAlpha = 1;
		ctx.resetTransform();
	}

	abstract actualRender(ctx: CanvasRenderingContext2D): void;
}

export class TextureFadeParticle extends FadeParticle {
	texture?: string;
	direction: Vec2;
	angle: number;

	constructor(minParticle: MinParticle & { duration: number }) {
		super(minParticle);
		this.direction = Vec2.UNIT_X.addAngle(Math.random() * CommonAngles.TWO_PI);
		this.angle = Math.random() * CommonAngles.TWO_PI;
	}

	clientTick() {
		super.clientTick();
		this.angle += 0.01;
	}

	actualRender(ctx: CanvasRenderingContext2D) {
		if (!this.texture) return;
		ctx.rotate(this.angle);
	}
}

export class GrowFadeParticle extends FadeParticle {
	type = "grow_fade";
	color: number;
	growSpeed: number; // units per tick

	constructor(minParticle: MinParticle & { duration: number, color: number, growSpeed: number }) {
		super(minParticle);
		this.color = minParticle.color;
		this.growSpeed = minParticle.growSpeed;
	}

	colorToHex(color?: number) {
		if (!color) color = this.color;
		return "#" + color.toString(16);
	}

	clientTick() {
		super.clientTick();
		this.size += this.growSpeed;
	}

	actualRender(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = this.colorToHex();
		circleFromCenter(ctx, 0, 0, this.size)
	}
}