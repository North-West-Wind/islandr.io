import { MAP_TERRAIN_SUPPLIERS } from ".";
import { world } from "../..";
import { MapTerrainData } from "../../types/data";
import { Vec2, Line } from "../../types/math";
import { MapTerrainSupplier } from "../../types/supplier";
import { LineTerrain } from "../../types/terrain";

class BeachMapSupplier extends MapTerrainSupplier {
	make(data: MapTerrainData) {
		return new Beach(data.args![0], data.args![1]);
	}
}

export default class Beach extends LineTerrain {
	static readonly ID = "beach";
	id = Beach.ID;
	border = 0;

	// 0-3: top, right, bottom, left
	constructor(side: number, range: number) {
		const points = [Vec2.ZERO, new Vec2(world.size.x, 0), new Vec2(world.size.x, world.size.y), new Vec2(0, world.size.y)];
		super(1, 0, 0, new Line(points[side], points[(side + 1) % points.length]), range);
	}

	static {
		MAP_TERRAIN_SUPPLIERS.set(Beach.ID, new BeachMapSupplier());
	}
}