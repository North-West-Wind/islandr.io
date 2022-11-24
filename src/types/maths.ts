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
		return <MinVec2>{ x: this.x, y: this.y };
	}
}

export class Line {
	readonly a: Vec2;
	readonly b: Vec2;

	constructor(a: Vec2, b: Vec2) {
		this.a = a;
		this.b = b;
	}

	passthrough(point: Vec2) {
		return point.x <= Math.max(this.a.x, this.b.x)
		&& point.x <= Math.min(this.a.x, this.b.x)
		&& (point.y <= Math.max(this.a.y, this.b.y)
		&& point.y <= Math.min(this.a.y, this.b.y));
	}

	direction(point: Vec2) {
		return (this.b.y - this.a.y) * (point.x - this.b.x) - (this.b.x - this.a.x) * (point.y - this.b.y);
	}
}

export interface Hitbox {
	type: "rect" | "circle";

	comparable(): number;
	scaleAll(ratio: number): Hitbox;
	lineIntersects(line: Line, position: Vec2, direction: Vec2): boolean;
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

	// Don't ask me how this work
	// https://www.tutorialspoint.com/Check-if-two-line-segments-intersect
	lineIntersects(line: Line, position: Vec2, direction: Vec2) {
		const startingPoint = position.addVec(new Vec2(-this.width / 2, -this.height / 2));
		const points = [
			startingPoint,
			startingPoint.addX(this.width),
			startingPoint.addY(this.height),
			startingPoint.addX(this.width).addY(this.height)
		].map(point => point.addAngle(direction.angle()));

		for (let ii = 0; ii < points.length; ii++) {
			const point1 = points[ii], point2 = points[ii + 1 % points.length];
			const rectLine = new Line(point1, point2);
			const dir1 = rectLine.direction(line.a);
		  const dir2 = rectLine.direction(line.b);
		  const dir3 = line.direction(point1);
		  const dir4 = line.direction(point2);

			if (dir1 != dir2 && dir3 != dir4) return true;
			if (dir1 == 0 && rectLine.passthrough(line.a)) return true;
			if (dir2 == 0 && rectLine.passthrough(line.b)) return true;
			if (dir3 == 0 && line.passthrough(point1)) return true;
			if (dir4 == 0 && line.passthrough(point2)) return true;
		}

		return false;
	}

	minimize() {
		return <MinRectHitbox>{ type: this.type, width: this.width, height: this.height };
	}

	// 0 is collinear, negative is anti-clockwise, positive is clockwise
	private orientation(a: Vec2, b: Vec2, c: Vec2) {
		return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
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

	lineIntersects(line: Line, center: Vec2) {
		const a = Math.pow(line.a.x - line.b.x, 2) + Math.pow(line.a.y - line.b.y, 2);
		const b = 2 * ((line.a.x - line.b.x) * (line.b.x - center.x) + (line.a.y - line.b.y) * (line.b.y - center.y));
		const c = Math.pow(line.b.x - center.x, 2) + Math.pow(line.b.y - center.y, 2) - this.radius * this.radius;

		return b * b - 4 * a * c >= 0;
	}

	minimize() {
		return <MinCircleHitbox>{ type: this.type, radius: this.radius };
	}
}

export enum CommonAngles {
	PI_FOUR = Math.PI / 4,
	PI_TWO = Math.PI / 2,
	TWO_PI = Math.PI * 2
}