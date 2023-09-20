import { MinCircleHitbox, MinHitbox, MinLine, MinRectHitbox, MinVec2 } from "./minimized";
import { CollisionType } from "./misc";

// Linear algebra paid off! (2D vector)
export class Vec2 {
	static readonly ZERO = new Vec2(0, 0);
	static readonly UNIT_X = new Vec2(1, 0);
	static readonly UNIT_Y = new Vec2(0, 1);

	static fromMinVec2(minVec2: MinVec2) {
		return new Vec2(minVec2.x, minVec2.y);
	}

	static fromArray(array: number[]) {
		return new Vec2(array[0], array[1]);
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
		return vec.angle() - this.angle();
	}

	angle() {
		// Magnitude of unit vector is 1
		const angle = Math.acos((this.x) / (this.magnitude()));
		if (this.y > 0) return angle;
		else return -angle;
	}

	addAngle(radian: number) {
		const angle = this.angle();
		if (isNaN(angle)) return new Vec2(this.x, this.y);
		const newAngle = angle + radian;
		const mag = this.magnitude();
		return new Vec2(mag * Math.cos(newAngle), mag * Math.sin(newAngle));
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
		const c = p.y - p.x * m;
		const b = new Vec2(p.x + 1, (p.x + 1) * m + c);
		return new Line(p, b, false);
	}

	static fromArrays(arr: number[][]) {
		return new Line(Vec2.fromArray(arr[0]), Vec2.fromArray(arr[1]));
	}

	static fromPointVec(p: Vec2, vec: Vec2) {
		return new Line(p, p.addVec(vec));
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

export abstract class Hitbox {
	type: "rect" | "circle";
	comparable: number;

	static fromMinHitbox(minHitbox: MinHitbox) {
		if (minHitbox.type === "rect") return RectHitbox.fromMinRectHitbox(<MinRectHitbox>minHitbox);
		else return CircleHitbox.fromMinCircleHitbox(<MinCircleHitbox>minHitbox);
	}

	static fromNumber(args: number[] | number) {
		if (Array.isArray(args)) return new RectHitbox(args[0], args[1]);
		else return new CircleHitbox(args);
	}

	constructor(type: "rect" | "circle", comparable: number) {
		this.type = type;
		this.comparable = comparable;
	}

	abstract scaleAll(ratio: number): Hitbox;
	abstract lineIntersects(line: Line, position: Vec2, direction: Vec2): boolean;
	abstract inside(point: Vec2, position: Vec2, direction: Vec2): boolean;

	abstract collideRect(position: Vec2, direction: Vec2, hitbox: RectHitbox, position1: Vec2, direction1: Vec2): CollisionType;
	abstract collideCircle(position: Vec2, direction: Vec2, hitbox: CircleHitbox, position1: Vec2, direction1: Vec2): CollisionType;

	abstract minimize(): MinHitbox;
}

// Rectangle hitbox with a width and height
export class RectHitbox extends Hitbox {
	static readonly ZERO = new RectHitbox(0, 0);

	static fromMinRectHitbox(minRectHitbox: MinRectHitbox) {
		return new RectHitbox(minRectHitbox.width, minRectHitbox.height);
	}

	static fromArray(array: number[]) {
		return new RectHitbox(array[0], array[1]);
	}

	width: number;
	height: number;

	constructor(width: number, height: number) {
		super("rect", Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2)));
		this.width = width;
		this.height = height;
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

	collideRect(position: Vec2, direction: Vec2, hitbox: RectHitbox, position1: Vec2, direction1: Vec2) {
		// https://math.stackexchange.com/questions/1278665/how-to-check-if-two-rectangles-intersect-rectangles-can-be-rotated
		// Using the last answer
		const thisStartingPoint = position.addVec(new Vec2(-this.width / 2, -this.height / 2).addAngle(direction.angle()));
		const thingStartingPoint = position1.addVec(new Vec2(-hitbox.width / 2, -hitbox.height / 2).addAngle(direction1.angle()));
		const thisPoints = [
			thisStartingPoint,
			thisStartingPoint.addVec(new Vec2(this.width, 0).addAngle(direction.angle())),
			thisStartingPoint.addVec(new Vec2(0, this.height).addAngle(direction.angle())),
			thisStartingPoint.addVec(new Vec2(this.width, this.height).addAngle(direction.angle()))
		];
		const thingPoints = [
			thingStartingPoint,
			thingStartingPoint.addVec(new Vec2(hitbox.width, 0).addAngle(direction1.angle())),
			thingStartingPoint.addVec(new Vec2(0, hitbox.height).addAngle(direction1.angle())),
			thingStartingPoint.addVec(new Vec2(hitbox.width, hitbox.height).addAngle(direction1.angle()))
		];
		var results: boolean[] = Array(4);
		var ii: number;

		const thisVecs = [
			new Vec2(this.width, 0).addAngle(direction.angle()),
			new Vec2(0, this.height).addAngle(direction.angle())
		];

		const thingVecs = [
			new Vec2(hitbox.width, 0).addAngle(direction1.angle()),
			new Vec2(0, hitbox.height).addAngle(direction1.angle())
		];

		for (const mainVec of thisVecs) {
			const mainMagSqr = mainVec.magnitudeSqr();
			for (ii = 0; ii < thingPoints.length; ii++)
				results[ii] = thingPoints[ii].addVec(thisStartingPoint.inverse()).dot(mainVec) < 0 || thingPoints[ii].addVec(thisStartingPoint.inverse()).projectTo(mainVec).magnitudeSqr() > mainMagSqr;
			if (results.every(x => x)) return CollisionType.NONE;
		}

		for (const mainVec of thingVecs) {
			const mainMagSqr = mainVec.magnitudeSqr();
			for (ii = 0; ii < thisPoints.length; ii++)
				results[ii] = thisPoints[ii].addVec(thisStartingPoint.inverse()).dot(mainVec) < 0 || thisPoints[ii].addVec(thisStartingPoint.inverse()).projectTo(mainVec).magnitudeSqr() > mainMagSqr;
			if (results.every(x => x)) return CollisionType.NONE;
		}

		return CollisionType.RECT_RECT;
	}

	collideCircle(position: Vec2, direction: Vec2, hitbox: CircleHitbox, position1: Vec2, _direction1: Vec2) {
		const rectStartingPoint = position.addVec(new Vec2(-this.width / 2, -this.height / 2).addAngle(direction.angle()));

		const rectPoints = [
			rectStartingPoint,
			rectStartingPoint.addVec(new Vec2(this.width, 0).addAngle(direction.angle())),
			rectStartingPoint.addVec(new Vec2(this.width, this.height).addAngle(direction.angle())),
			rectStartingPoint.addVec(new Vec2(0, this.height).addAngle(direction.angle()))
		];

		if (this.pointInRect(rectPoints[0], rectPoints[1], rectPoints[2], rectPoints[3], position1)) return CollisionType.CIRCLE_RECT_CENTER_INSIDE;

		for (let ii = 0; ii < rectPoints.length; ii++)
			if (rectPoints[ii].addVec(position1.inverse()).magnitudeSqr() < Math.pow(hitbox.radius, 2))
				return CollisionType.CIRCLE_RECT_POINT_INSIDE;

		for (let ii = 0; ii < rectPoints.length; ii++)
			if (hitbox.lineIntersects(new Line(rectPoints[ii], rectPoints[(ii + 1) % rectPoints.length]), position1))
				return CollisionType.CIRCLE_RECT_LINE_INSIDE;
		
		return CollisionType.NONE;
	}

	minimize() {
		return <MinRectHitbox>{ type: this.type, width: this.width, height: this.height };
	}

	private isLeft(a: Vec2, b: Vec2, c: Vec2) {
		return ((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y));
	}

	private pointInRect(a: Vec2, b: Vec2, c: Vec2, d: Vec2, p: Vec2) {
		return (this.isLeft(a, b, p) > 0 && this.isLeft(b, c, p) > 0 && this.isLeft(c, d, p) > 0 && this.isLeft(d, a, p) > 0);
	}
}

// Circle hitbox with a radius
export class CircleHitbox extends Hitbox {
	static readonly ZERO = new RectHitbox(0, 0);

	static fromMinCircleHitbox(minCircleHitbox: MinCircleHitbox) {
		return new CircleHitbox(minCircleHitbox.radius);
	}

	radius: number;

	constructor(radius: number) {
		super("circle", radius);
		this.radius = radius;
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

	collideRect(position: Vec2, direction: Vec2, hitbox: RectHitbox, position1: Vec2, direction1: Vec2) {
		return hitbox.collideCircle(position1, direction1, this, position, direction);
	}

	collideCircle(position: Vec2, _direction: Vec2, hitbox: CircleHitbox, position1: Vec2, _direction1: Vec2) {
		return position.distanceTo(position1) > this.comparable + hitbox.comparable ? CollisionType.NONE : CollisionType.CIRCLE_CIRCLE;
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