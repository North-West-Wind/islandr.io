import { Vec2 } from "../../types/math";
import { RectTerrain } from "../../types/terrain";

export default class Floor extends RectTerrain {
	constructor(start: Vec2, dimension: Vec2, direction: Vec2) {
		super(1, 0, 0, start, dimension, direction);
	}
}