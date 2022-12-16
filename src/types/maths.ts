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

	distanceSqrTo(vec: Vec2) {
		return this.addVec(vec.inverse()).magnitudeSqr();
	}

	distanceTo(vec: Vec2) {
		return Math.sqrt(this.distanceSqrTo(vec));
	}

	perpendicular() {
		return new Vec2(this.y, -this.x);
	}

	equals(vec: Vec2) {
		return this.x === vec.x && this.y === vec.y;
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

	distanceSqrTo(point: Vec2) {
		const ab = this.b.addVec(this.a.inverse());
		const be = point.addVec(this.b.inverse());
		const ae = point.addVec(this.a.inverse());

		const abbe = ab.dot(be);
		const abae = ab.dot(ae);
		if (abbe > 0) return be.magnitude();
		if (abae < 0) return ae.magnitude();

		const a = this.b.y - this.a.y;
		const b = this.a.x - this.b.x;
		const c = (this.b.x - this.a.x) * this.a.y - (this.b.y - this.a.y) * this.a.x;

		return Math.pow(a * point.x + b * point.y + c, 2) / (a * a + b * b);
	}

	distanceTo(point: Vec2) {
		return Math.sqrt(this.distanceSqrTo(point));
	}

	intersects(line: Line) {
		const dir1 = line.direction(this.a);
		const dir2 = line.direction(this.b);
		const dir3 = this.direction(line.a);
		const dir4 = this.direction(line.b);

		if (dir1 != dir2 && dir3 != dir4) return true;
		if (dir1 == 0 && line.passthrough(this.a)) return true;
		if (dir2 == 0 && line.passthrough(this.b)) return true;
		if (dir3 == 0 && line.passthrough(line.a)) return true;
		if (dir4 == 0 && line.passthrough(line.b)) return true;

		return false;
	}
}

export interface Hitbox {
	type: "rect" | "circle";
	comparable: number;

	scaleAll(ratio: number): Hitbox;
	lineIntersects(line: Line, position: Vec2, direction: Vec2): boolean;
	minimize(): MinHitbox;
}

// Rectangle hitbox with a width and height
export class RectHitbox implements Hitbox {
	static readonly ZERO = new RectHitbox(0, 0);

	type: "rect" | "circle";
	width: number;
	height: number;
	comparable: number;

	constructor(width: number, height: number) {
		this.type = "rect";
		this.width = width;
		this.height = height;
		this.comparable = Math.sqrt(Math.pow(this.width / 2, 2) + Math.pow(this.height / 2, 2));
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

		for (let ii = 0; ii < points.length; ii++)
			if (line.intersects(new Line(points[ii], points[(ii + 1) % points.length])))
				return true;

		return false;
	}

	minimize() {
		return <MinRectHitbox>{ type: this.type, width: this.width, height: this.height };
	}
}

// Circle hitbox with a radius
export class CircleHitbox implements Hitbox {
	static readonly ZERO = new RectHitbox(0, 0);

	type: "rect" | "circle";
	radius: number;
	comparable: number;

	constructor(radius: number) {
		this.type = "circle";
		this.comparable = this.radius = radius;
	}

	scaleAll(ratio: number) {
		return new CircleHitbox(this.radius * ratio);
	}

	lineIntersects(line: Line, center: Vec2) {
		return line.distanceSqrTo(center) < Math.pow(this.radius, 2);
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