import { MAP_OBSTACLE_SUPPLIERS, OBSTACLE_SUPPLIERS } from ".";
import { world } from "../..";
import { MapObstacleData, ObstacleData } from "../../types/data";
import { LOOT_TABLES } from "../../types/loot_table";
import { CircleHitbox } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { MapObstacleSupplier, ObstacleSupplier } from "../../types/supplier";

class SpawnerSupplier extends ObstacleSupplier {
	make(data: ObstacleData) {
		return new Spawner(data.lootTable);
	}
}

class SpawnerMapSupplier extends MapObstacleSupplier {
	make(data: MapObstacleData) {
		return new Spawner(data.args ? data.args[0] : "");
	}
}

export default class Spawner extends Obstacle {
	static readonly TYPE = "spawner";
	type = Spawner.TYPE;
	lootTable: string;

	constructor(lootTable: string) {
		super(world, new CircleHitbox(0), new CircleHitbox(0), 0, 0);
		this.discardable = true;
		this.lootTable = lootTable;
	}

	static {
		OBSTACLE_SUPPLIERS.set(Spawner.TYPE, new SpawnerSupplier());
		MAP_OBSTACLE_SUPPLIERS.set(Spawner.TYPE, new SpawnerMapSupplier());
	}

	die() {
		super.die();
		const entities = LOOT_TABLES.get(this.lootTable)?.roll();
		if (entities) {
			world.entities.push(...entities.map(e => {
				e.position = this.position;
				return e;
			}));
		}
	}
}