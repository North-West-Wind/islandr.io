import { TERRAIN_SUPPLIERS } from ".";
import { TerrainData, TextureData } from "../../types/data";
import { Line, Vec2 } from "../../types/math";
import { TerrainSupplier } from "../../types/supplier";
import { LineTerrain } from "../../types/terrain";

class FloorSupplier implements TerrainSupplier {
	create(data: TerrainData) {
		const dim = Vec2.fromArray(data.size);
		return new Floor(dim.scale(-0.5, -0.5), dim, data.direction ? Vec2.fromArray(data.direction) : Vec2.UNIT_X, data.texture);
	}
}

export default class Floor extends LineTerrain {
	static readonly ID = "floor";
	id = Floor.ID;
	texture: TextureData;

	constructor(start: Vec2, dimension: Vec2, direction: Vec2, texture: TextureData) {
		const line = new Line(start, start.addX(dimension.x).addAngle(direction.angle()));
		super(1, 0, 0, line, dimension.y * 0.5);
		this.texture = texture;
	}

	static {
		TERRAIN_SUPPLIERS.set(Floor.ID, new FloorSupplier());
	}

	minimize() {
		return Object.assign(super.minimize(), { texture: this.texture })
	}
}