import { MAP_TERRAIN_SUPPLIERS } from ".";
import { world } from "../..";
import { MapTerrainData } from "../../types/data";
import { Line, Vec2 } from "../../types/math";
import { MapTerrainSupplier } from "../../types/supplier";
import { LineTerrain } from "../../types/terrain";

class SeaMapTerrainSupplier extends MapTerrainSupplier {
	make(data: MapTerrainData) {
		return new Sea(data.args![0]);
	}
}

export default class Sea extends LineTerrain {
	static readonly ID = "sea";
	id = Sea.ID;
	border = 0;

	// 0-3: top, right, bottom, left
	constructor(side: number) {
		const points = [Vec2.ZERO, new Vec2(world.size.x, 0), new Vec2(world.size.x, world.size.y), new Vec2(0, world.size.y)];
		super(0.8, 0, 0, new Line(points[side], points[(side + 1) % points.length]), 20);
	}

	static {
		MAP_TERRAIN_SUPPLIERS.set(Sea.ID, new SeaMapTerrainSupplier());
	}
}