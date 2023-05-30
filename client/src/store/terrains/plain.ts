import { TERRAIN_SUPPLIERS } from ".";
import { MinTerrain } from "../../types/minimized";
import { TerrainSupplier } from "../../types/supplier";
import { FullTerrain, Terrain } from "../../types/terrain";

class PlainSupplier implements TerrainSupplier {
	create(minTerrain: MinTerrain) {
		return new Plain(minTerrain);
	}
}

export default class Plain extends FullTerrain {
	static readonly ID = "plain";
	id = Plain.ID;
	color = 0x80B251;

	constructor(minTerrain: MinTerrain) {
		super(minTerrain);
	}

	static {
		TERRAIN_SUPPLIERS.set(Plain.ID, new PlainSupplier());
	}
}