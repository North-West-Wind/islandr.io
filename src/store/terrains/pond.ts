import { world } from "../..";
import { Vec2 } from "../../types/math";
import { DotTerrain } from "../../types/terrain";
import { randomBetween } from "../../utils";

export default class Pond extends DotTerrain {
	id = "pond";

	constructor() {
		const radius = randomBetween(10, 20);
		super(0.6, 0, 0, new Vec2(randomBetween(radius, world.size.x - radius), randomBetween(radius, world.size.y - radius)), radius * 0.8);
	}
}