import { MinCircleHitbox, MinHitbox, MinRectHitbox, MinVec2 } from "./minimized";

// Calculus paid off!
export class Vec2 {
	static readonly ZERO = new Vec2(0, 0);
	static readonly ONE = new Vec2(1, 0);

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

	unit() {
		const mag = this.magnitude();
		if (mag === 0) return Vec2.ZERO;
		return new Vec2(this.x / mag, this.y / mag);
	}

	dot(vec: Vec2) {
		return this.x * vec.x + this.y * vec.y;
	}

	angleBetween(vec: Vec2) {
		return Math.acos(this.dot(vec) / (this.magnitude() * vec.magnitude()));
	}

	angle() {
		// Magnitude of unit vector is 1
		const angle = Math.acos((this.x) / (this.magnitude()));
		if (this.y > 0) return angle;
		else return -angle;
	}

	addAngle(radian: number) {
		const angle = this.angle() + radian;
		const mag = this.magnitude();
		return new Vec2(mag * Math.cos(angle), mag * Math.sin(angle));
	}

	addVec(vec: Vec2) {
		return new Vec2(this.x + vec.x, this.y + vec.y);
	}

	addX(x: number) {
		return new Vec2(this.x + x, this.y);
	}

	addY(y: number) {
		return new Vec2(this.x, this.y + y);
	}

	scale(x: number, y: number) {
		return new Vec2(this.x * x, this.y * y);
	}

	scaleAll(ratio: number) {
		return this.scale(ratio, ratio);
	}

	projectTo(vec: Vec2) {
		return vec.scaleAll(this.dot(vec) / vec.magnitudeSqr());
	}

	minimize() {
		return <MinVec2> { x: this.x, y: this.y };
	}
}

export interface Hitbox {
	type: "rect" | "circle";

	comparable(): number;
	scaleAll(ratio: number): Hitbox;
	minimize(): MinHitbox;
}

// Rectangle hitbox with a width and height
export class RectHitbox implements Hitbox {
	static readonly ZERO = new RectHitbox(0, 0);

	type: "rect" = "rect";
	width: number;
	height: number;

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

	comparable() {
		return this.width;
	}

	scaleAll(ratio: number) {
		return new RectHitbox(this.width * ratio, this.height * ratio);
	}

	minimize() {
		return <MinRectHitbox> { type: this.type, width: this.width, height: this.height };
	}
}

// Circle hitbox with a radius
export class CircleHitbox implements Hitbox {
	static readonly ZERO = new RectHitbox(0, 0);

	type: "circle" = "circle";
	radius: number;

	constructor(radius: number) {
		this.radius = radius;
	}

	comparable() {
		return this.radius;
	}

	scaleAll(ratio: number) {
		return new CircleHitbox(this.radius * ratio);
	}

	minimize() {
		return <MinCircleHitbox> { type: this.type, radius: this.radius };
	}
}

// The 4 movement directions
export enum MovementDirection {
	RIGHT = 0,
	UP = 1,
	LEFT = 2,
	DOWN = 3
}

export enum CommonAngles {
	PI_FOUR = Math.PI / 4,
	PI_TWO = Math.PI / 2,
	TWO_PI = Math.PI * 2
}