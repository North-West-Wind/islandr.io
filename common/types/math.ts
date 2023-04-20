import { MinCircleHitbox, MinHitbox, MinLine, MinRectHitbox, MinVec2 } from "./minimized";

// Linear algebra paid off! (2D vector)
export class Vec2 {
	static readonly ZERO = new Vec2(0, 0);
	static readonly UNIT_X = new Vec2(1, 0);
	static readonly UNIT_Y = new Vec2(0, 1);

	static fromMinVec2(minVec2: MinVec2) {
		return new Vec2(minVec2.x, minVec2.y);
	}

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
		return !!this.intersection(line);
	}

	on(p: Vec2) {
		if (p.x <= Math.max(this.a.x, this.b.x) && p.x <= Math.min(this.a.x, this.b.x) &&
			(p.y <= Math.max(this.a.y, this.b.y) && p.y <= Math.min(this.a.y, this.b.y)))
			return true;
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
		if (m == 0)
			return true;
		// x = (y - c) / m
		const c = this.a.y - m * this.a.x;
		return point.x < (point.y - c) / m;
	}

	rightTo(point: Vec2) {
		const m = this.slope();
		if (m === undefined)
			return point.x > this.a.x;
		if (m == 0)
			return true;
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

	minimize() {
		return <MinLine>{ a: this.a.minimize(), b: this.b.minimize(), segment: this.segment };
	}
}

export interface Hitbox {
	type: "rect" | "circle";
	comparable: number;

	scaleAll(ratio: number): Hitbox;
	lineIntersects(line: Line, position: Vec2, direction: Vec2): boolean;
	inside(point: Vec2, position: Vec2, direction: Vec2): boolean;
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

	inside(point: Vec2, position: Vec2, direction: Vec2) {
		const startingPoint = position.addVec(new Vec2(-this.width / 2, -this.height / 2));
		const points = [
			startingPoint,
			startingPoint.addX(this.width),
			startingPoint.addY(this.height),
			startingPoint.addX(this.width).addY(this.height)
		].map(point => point.addAngle(direction.angle()));

		return new Polygon(points).inside(point);
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

	inside(point: Vec2, position: Vec2, direction: Vec2) {
		return position.addVec(point.inverse()).magnitudeSqr() < this.radius * this.radius;
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

export class Polygon {
	points: Vec2[];

	constructor(points: Vec2[], position = Vec2.ZERO) {
		if (points.length < 3) throw new Error("Polygon must have at least 3 points");
		this.points = points.map(p => p.addVec(position));
	}

	inside(p: Vec2) {
		const n = this.points.length;
		const exline = new Line(p, new Vec2(9999, p.y)); // Create a point at infinity, y is same as point p
		var count = 0;
		var i = 0;
		do {
			const side = new Line(this.points[i], this.points[(i + 1) % n]); // Forming a line from two consecutive points of poly
			if (side.intersects(exline)) {
				// If side is intersects exline
				if (new Line(side.a, p).direction(side.b) == 0)
					return side.on(p);
				count++;
			}
			i = (i + 1) % n;
		} while (i != 0);
		return !!(count & 1); // When count is odd
	}
}