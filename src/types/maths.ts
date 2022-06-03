export class Vec2 {
	static readonly ZERO = new Vec2(0, 0);

	readonly x: number;
	readonly y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	magnitudeSqr() {
		return this.x * this.x + this.y * this.y;
	}

	magnitude() {
		return Math.sqrt(this.magnitudeSqr());
	}

	inverse() {
		return new Vec2(-this.x, -this.y);
	}

	add(vec: Vec2) {
		return new Vec2(this.x + vec.x, this.y + vec.y);
	}

	addX(x: number) {
		return new Vec2(this.x + x, this.y);
	}

	addY(y: number) {
		return new Vec2(this.x, this.y + y);
	}
}

export interface Hitbox {
	type: "rect" | "circle";
}

export class RectHitbox implements Hitbox {
	static readonly ZERO = new RectHitbox(0, 0);

	type: "rect" = "rect";
	width: number;
	height: number;

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
	}
}

export class CircleHitbox implements Hitbox {
	static readonly ZERO = new RectHitbox(0, 0);

	type: "circle" = "circle";
	radius: number;

	constructor(radius: number) {
		this.radius = radius;
	}
}