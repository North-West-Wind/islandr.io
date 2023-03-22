import { TERRAIN_SUPPLIERS } from ".";
import { MinLine, MinTerrain, MinVec2 } from "../../types/minimized";
import { TerrainSupplier } from "../../types/supplier";
import { LineTerrain } from "../../types/terrain";

class SeaSupplier implements TerrainSupplier {
	create(minTerrain: MinTerrain & { line: MinLine, range: number, boundary: MinVec2[] }) {
		return new Sea(minTerrain);
	}
}

export default class Sea extends LineTerrain {
	static readonly ID = "sea";
	id = Sea.ID;
	color = 0x3481ab;

	static {
		TERRAIN_SUPPLIERS.set(Sea.ID, new SeaSupplier());
	}
}