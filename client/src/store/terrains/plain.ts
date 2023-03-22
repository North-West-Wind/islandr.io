import { TERRAIN_SUPPLIERS } from ".";
import { MinTerrain } from "../../types/minimized";
import { TerrainSupplier } from "../../types/supplier";
import { Terrain } from "../../types/terrain";
import { Player } from "../entities";

class PlainSupplier implements TerrainSupplier {
	create(minTerrain: MinTerrain) {
		return new Plain(minTerrain);
	}
}

export default class Plain extends Terrain {
	static readonly ID = "plain";
	id = Plain.ID;
	color = 0x80B251;

	constructor(minTerrain: MinTerrain) {
		super(minTerrain);
	}

	static {
		TERRAIN_SUPPLIERS.set(Plain.ID, new PlainSupplier());
	}

	render(_you: Player, _canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number) { }
	renderMap(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number) { }
}