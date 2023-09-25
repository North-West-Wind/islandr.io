import { Line, Vec2 } from "./math";
import { MinTerrain } from "./minimized";

export abstract class Terrain {
	id!: string;
	type = "generic";
	// Moving speed factor, 0 - 1
	speed: number;
	// Damage per interval
	damage: number;
	// Interval duration (in ticks)
	interval: number;

	constructor(speed: number, damage: number, interval: number) {
		this.speed = speed;
		this.damage = damage;
		this.interval = interval;
	}

	abstract inside(position: Vec2): boolean;

	abstract setPosition(position: Vec2): void;
	abstract setDirection(direction: Vec2): void;

	minimize() {
		return <MinTerrain> { id: this.id };
	}
}

export class DummyTerrain extends Terrain {
	type = "dummy";

	constructor() {
		super(0, 0, 0);
	}

	inside(_position: Vec2) {
		return false;
	}

	setPosition(_position: Vec2) { }
	setDirection(_direction: Vec2) { }
}

export class FullTerrain extends Terrain {
	type = "full";

	inside(_position: Vec2) {
		return true;
	}

	setPosition(_position: Vec2) { }
	setDirection(_direction: Vec2) { }
}

export class DotTerrain extends Terrain {
	type = "dot";
	// Position of it on the map
	position: Vec2;
	radius: number;

	constructor(speed: number, damage: number, interval: number, position: Vec2, radius: number) {
		super(speed, damage, interval);
		this.position = position;
		this.radius = radius;
	}

	inside(position: Vec2) {
		return position.distanceSqrTo(this.position) <= this.radius * this.radius;
	}

	setPosition(position: Vec2) {
		this.position = position;
	}

	setDirection(direction: Vec2) { }

	minimize() {
		return Object.assign(super.minimize(), { position: this.position, radius: this.radius });
	}
}

export class LineTerrain extends Terrain {
	type = "line";
	// The line and its range
	line: Line;
	range: number;
	// The boundary lines. Position does not matter so Vec2 is enough.
	boundary: { start: Vec2, end: Vec2 };

	constructor(speed: number, damage: number, interval: number, line: Line, range: number, boundary?: { start?: Vec2, end?: Vec2 }) {
		super(speed, damage, interval);
		line.segment = false;
		this.line = line;
		this.range = range;

		// Default boundary: perpendicular to the line
		const pab = this.line.toVec().perpendicular();
		this.boundary = { start: boundary?.start || pab, end: boundary?.end || pab };
	}

	inside(position: Vec2) {
		if (this.line.distanceSqrTo(position) > this.range * this.range) return false;
		const startLine = new Line(this.line.a, this.line.a.addVec(this.boundary.start.inverse()));
		const endLine = new Line(this.line.b, this.line.b.addVec(this.boundary.end.inverse()));
		return startLine.rightTo(position) && endLine.leftTo(position);
	}

	setPosition(position: Vec2) {
		position = position.addVec(this.line.toVec().scaleAll(-0.5));
		const line = new Line(position, position.addVec(this.line.toVec()));
		line.segment = false;
		this.line = line;
	}

	setDirection(direction: Vec2) {
		const vec = this.line.toVec();
		const delta = vec.angleBetween(direction);
		this.line = Line.fromPointVec(this.line.a, vec.addAngle(-delta));
		this.boundary = { start: this.boundary.start.addAngle(-delta), end: this.boundary.end.addAngle(-delta) };
	}

	minimize() {
		return Object.assign(super.minimize(), { line: this.line.minimize(), range: this.range, boundary: [this.boundary.start.minimize(), this.boundary.end.minimize()] });
	}
}

// Multiple lines
export class PiecewiseTerrain extends Terrain {
	type = "piecewise";
	// All the lines
	lines: LineTerrain[] = [];

	inside(position: Vec2) {
		for (const terrain of this.lines) {
			if (terrain.inside(position)) return true;
		}
		return false;
	}

	setPosition(_position: Vec2) { }
	setDirection(_direction: Vec2) { }

	minimize() {
		return Object.assign(super.minimize(), { lines: this.lines.map(l => l.minimize()) });
	}
}