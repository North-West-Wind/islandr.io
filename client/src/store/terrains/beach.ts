import { TERRAIN_SUPPLIERS } from ".";
import { MinTerrain, MinLine, MinVec2 } from "../../types/minimized";
import { TerrainSupplier } from "../../types/supplier";
import { LineTerrain } from "../../types/terrain";

class BeachSupplier implements TerrainSupplier {
	create(minTerrain: MinTerrain & { line: MinLine, range: number, boundary: MinVec2[] }) {
		return new Beach(minTerrain);
	}
}

export default class Beach extends LineTerrain {
	static readonly ID = "beach";
	id = Beach.ID;
	color = 0xceb35c;

	static {
		TERRAIN_SUPPLIERS.set(Beach.ID, new BeachSupplier());
	}
}