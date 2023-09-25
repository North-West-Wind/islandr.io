import { MAP_TERRAIN_SUPPLIERS } from ".";
import { MapTerrainSupplier } from "../../types/supplier";
import { FullTerrain } from "../../types/terrain";

class PlainMapTerrainSupplier extends MapTerrainSupplier {
	make() {
		return new Plain();
	}
}

export default class Plain extends FullTerrain {
	static readonly ID = "plain";
	id = Plain.ID;

	constructor() {
		super(1, 0, 0);
	}

	static {
		MAP_TERRAIN_SUPPLIERS.set(Plain.ID, new PlainMapTerrainSupplier());
	}
}