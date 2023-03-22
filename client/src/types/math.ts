import { Player } from "../store/entities";
import { MinLine, MinVec2 } from "./minimized";

// Linear algebra paid off! (2D vector)
export class Vec2 {
	static ZERO = new Vec2(0, 0);
	static ONE = new Vec2(1, 0);

	static fromMinVec2(minVec2: MinVec2) {
		return new Vec2(minVec2.x, minVec2.y);
	}

	x: number;
	y: number;

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

	// For debug purposes
	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number, position: Vec2) {
		const relative = position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.strokeStyle = "#ff0000";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(this.x * scale, this.y * scale);
		ctx.stroke();
		ctx.resetTransform();
	}

	renderPoint(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number, position: Vec2) {
		const relative = position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.strokeStyle = "#ff0000";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo((this.x - position.x) * scale, (this.y - position.y) * scale);
		ctx.stroke();
		ctx.resetTransform();
	}
}
export class Line {
	static fromMinLine(minLine: MinLine) {
		return new Line(Vec2.fromMinVec2(minLine.a), Vec2.fromMinVec2(minLine.b), minLine.segment);
	}

	static fromPointSlope(p: Vec2, m: number) {
		const b = new Vec2(p.x + 1, (p.y + 1) * m);
		return new Line(p, b, false);
	}

	readonly a: Vec2;
	readonly b: Vec2;
	segment: boolean;

	constructor(a: Vec2, b: Vec2, segment?: boolean) {
		// Making sure b is always right of a
		if (a.x < b.x) {
			this.a = a;
			this.b = b;
		} else {
			this.a = b;
			this.b = a;
		}
		if (segment === undefined) this.segment = true;
		else this.segment = segment;
	}

	direction(point: Vec2) {
		return (this.b.y - this.a.y) * (point.x - this.b.x) - (this.b.x - this.a.x) * (point.y - this.b.y);
	}

	distanceSqrTo(point: Vec2) {
		const ab = this.toVec();
		const ae = point.addVec(this.a.inverse());
		if (this.segment) {
			const be = point.addVec(this.b.inverse());
	
			const abbe = ab.dot(be);
			const abae = ab.dot(ae);
			if (abbe > 0) return be.magnitude();
			if (abae < 0) return ae.magnitude();
	
			const a = this.b.y - this.a.y;
			const b = this.a.x - this.b.x;
			const c = (this.b.x - this.a.x) * this.a.y - (this.b.y - this.a.y) * this.a.x;
	
			return Math.pow(a * point.x + b * point.y + c, 2) / (a * a + b * b);
		} else return ae.projectTo(ab.perpendicular()).magnitudeSqr();
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

	passthrough(point: Vec2) {
		const m = this.slope();
		// This is a vertical line
		if (m === undefined) {
			if (point.x != this.a.x) return false;
			if (this.segment && (point.y < Math.min(this.a.y, this.b.y) || point.y > Math.max(this.a.y, this.b.y))) return false;
			return true;
		}
		// y = mx + c
		const c = this.a.y - m * this.a.x;
		if (point.y != m * point.x + c) return false;
		if (this.segment && (point.x < this.a.x || point.x > this.b.x || point.y < Math.min(this.a.y, this.b.y) || point.y > Math.max(this.a.y, this.b.y))) return false;
		return true;
	}

	leftTo(point: Vec2) {
		const m = this.slope();
		if (m === undefined)
			return point.x < this.a.x;
		// x = (y - c) / m
		const c = this.a.y - m * this.a.x;
		return point.x < (point.y - c) / m;
	}

	rightTo(point: Vec2) {
		const m = this.slope();
		if (m === undefined)
			return point.x > this.a.x;
		// x = (y - c) / m
		const c = this.a.y - m * this.a.x;
		return point.x > (point.y - c) / m;
	}

	slope(): number | undefined {
		if (this.b.x - this.a.x == 0) return undefined;
		return (this.b.y - this.a.y) / (this.b.x - this.a.x);
	}

	yIntercept() {
		const m = this.slope();
		if (m === undefined) return undefined;
		return this.a.y - m * this.a.x;
	}

	toVec() {
		return this.b.addVec(this.a.inverse());
	}

	toParallel(distance: number, overrideSegment?: boolean) {
		if (overrideSegment === undefined) overrideSegment = this.segment;
		var per = this.toVec().perpendicular().unit().scaleAll(distance);
		const line1 = new Line(this.a.addVec(per), this.b.addVec(per), overrideSegment);
		per = per.inverse();
		const line2 = new Line(this.a.addVec(per), this.b.addVec(per), overrideSegment);
		return [line1, line2];
	}

	intersection(line: Line) {
		if (this.a.equals(line.a) && this.b.equals(line.b)) return undefined;
		if (this.yIntercept() === undefined && line.yIntercept() === undefined) return undefined;
		else if (this.yIntercept() === undefined) return new Vec2(this.a.x, line.slope()! * this.a.x + line.yIntercept()!);
		else if (line.yIntercept() === undefined) return new Vec2(line.a.x, this.slope()! * line.a.x + this.yIntercept()!);
		const x = (line.yIntercept()! - this.yIntercept()!) / (this.slope()! - line.slope()!);
		const point = new Vec2(x, this.slope()! * x + this.yIntercept()!);
		if (this.segment && !this.passthrough(point) || line.segment && !line.passthrough(point)) return undefined;
		return point;
	}
}

// Rectangle hitbox with a width and height
export class RectHitbox {
	static ZERO = new RectHitbox(0, 0);

	type = "rect";
	width: number;
	height: number;
	comparable: number;

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.comparable = Math.sqrt(Math.pow(this.width / 2, 2) + Math.pow(this.height / 2, 2));
	}
}

// Circular hitbox with a radius
export class CircleHitbox {
	static ZERO = new CircleHitbox(0);

	type = "circle";
	radius: number;
	comparable: number;

	constructor(radius: number) {
		this.comparable = this.radius = radius;
	}
}

export type Hitbox = RectHitbox | CircleHitbox;

export enum MovementDirection {
	RIGHT = 0,
	UP = 1,
	LEFT = 2,
	DOWN = 3
}