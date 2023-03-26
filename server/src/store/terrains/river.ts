import { world } from "../..";
import { BorderedTerrain } from "../../types/extensions";
import { Line, Vec2 } from "../../types/math";
import { LineTerrain, PiecewiseTerrain } from "../../types/terrain";
import { randomBetween, randomBoolean, toRadians } from "../../utils";

class RiverSegment extends LineTerrain implements BorderedTerrain {
	id = "river_segment";
	border = 2;

	minimize() {
		return Object.assign(super.minimize(), { border: this.border });
	}
}

export default class River extends PiecewiseTerrain implements BorderedTerrain {
	id = "river";
	border = 2;

	constructor() {
		super(0.6, 0, 0);

		// For testing purposes
		const vertical = randomBoolean();
		var slope: number, length: number;
		while (this.lines.length == 0 || this.lines[this.lines.length - 1].line.b.x < world.size.x && this.lines[this.lines.length - 1].line.b.y < world.size.y) {
			// Remember, y-axis is downwards!
			slope = Math.tan(toRadians(randomBetween(20, 70)));
			length = randomBetween(15, 25);
			var a: Vec2;
			if (this.lines.length == 0) {
				if (vertical)
					a = new Vec2(randomBetween(5 + this.border, world.size.x / 10), 0);
				else
					a = new Vec2(0, randomBetween(5 + this.border, world.size.y / 10));
			} else a = this.lines[this.lines.length - 1].line.b;
			const b = a.addVec(Line.fromPointSlope(a, slope).toVec().unit().scaleAll(length));
			this.addLine(new Line(a, b, true), 5);
		}

		/*const line = this.lines.pop()!;
		if (line.line.b.x > world.size.x) line.line = new Line(line.line.a, new Vec2(world.size.x, line.line.b.y));
		if (line.line.b.y > world.size.y) line.line = new Line(line.line.a, new Vec2(line.line.b.x, world.size.y));
		this.lines.push(line);*/
	}

	addLine(line: Line, range: number) {
		const terrain = new RiverSegment(this.speed, this.damage, this.interval, line, range);
		if (this.lines.length == 0) {
			const a = terrain.line.a;
			if (a.y < a.x) terrain.boundary.start = Vec2.UNIT_X;
			else terrain.boundary.start = Vec2.UNIT_Y;
		} else {
			const last = this.lines.pop()!;
			const lastVec = last.line.a.addVec(last.line.b.inverse());
			const thisVec = line.toVec();
			const bound = lastVec.unit().addVec(thisVec.unit());
			last.boundary.end = bound;
			terrain.boundary.start = bound;
			this.lines.push(last);
		}

		const b = terrain.line.b;
		if (world.size.y - b.y < world.size.x - b.x) terrain.boundary.end = Vec2.UNIT_X;
		else terrain.boundary.end = Vec2.UNIT_Y;

		this.lines.push(terrain);
	}

	minimize() {
		return Object.assign(super.minimize(), { border: this.border });
	}
}