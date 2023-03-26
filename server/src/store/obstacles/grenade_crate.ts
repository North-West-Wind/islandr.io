import { world } from "../..";
import { LOOT_TABLES } from "../../types/loot_table";
import { RectHitbox, Vec2 } from "../../types/math";
import { Obstacle } from "../../types/obstacle";

export default class GrenadeCrate extends Obstacle {
	static readonly LOOT_TABLE = "crate_grenade";
	type = "grenade_crate";

	constructor() {
		const hitbox = new RectHitbox(3, 3);
		super(world, hitbox, hitbox.scaleAll(0.75), 100, 100);
		this.direction = Vec2.UNIT_X;
		while (world.terrainAtPos(this.position).id != "plain" || world.obstacles.find(obstacle => obstacle.collided(this))) this.position = world.size.scale(Math.random(), Math.random());
	}

	die() {
		super.die();
		const entities = LOOT_TABLES.get(GrenadeCrate.LOOT_TABLE)?.roll();
		if (entities) {
			world.entities.push(...entities.map(e => {
				e.position = this.position;
				return e;
			}));
		}
	}
}