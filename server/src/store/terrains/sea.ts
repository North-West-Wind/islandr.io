import { world } from "../..";
import { Line, Vec2 } from "../../types/math";
import { LineTerrain } from "../../types/terrain";

export default class Sea extends LineTerrain {
	id = "sea";
	border = 0;

	// 0-3: top, right, bottom, left
	constructor(side: number) {
		const points = [Vec2.ZERO, new Vec2(world.size.x, 0), new Vec2(world.size.x, world.size.y), new Vec2(0, world.size.y)];
		super(0.8, 0, 0, new Line(points[side], points[(side + 1) % points.length]), 20);
	}
}