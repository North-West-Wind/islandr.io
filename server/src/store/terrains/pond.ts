import { MAP_TERRAIN_SUPPLIERS } from ".";
import { world } from "../..";
import { Vec2 } from "../../types/math";
import { MapTerrainSupplier } from "../../types/supplier";
import { DotTerrain } from "../../types/terrain";
import { randomBetween } from "../../utils";

class PondMapSupplier extends MapTerrainSupplier {
	make() {
		return new Pond();
	}
}

export default class Pond extends DotTerrain {
	static readonly ID = "pond";
	id = Pond.ID;
	border = 2;

	constructor() {
		const radius = randomBetween(10, 20);
		super(0.8, 0, 0, new Vec2(randomBetween(radius + 2, world.size.x - radius), randomBetween(radius + 2, world.size.y - radius)), radius);
	}

	static {
		MAP_TERRAIN_SUPPLIERS.set(Pond.ID, new PondMapSupplier());
	}

	minimize() {
		return Object.assign(super.minimize(), { border: this.border });
	}
}