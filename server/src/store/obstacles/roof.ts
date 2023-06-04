import { OBSTACLE_SUPPLIERS } from ".";
import { world } from "../..";
import { ObstacleData } from "../../types/data";
import { Entity } from "../../types/entity";
import { Hitbox, Vec2 } from "../../types/math";
import { MinObstacle } from "../../types/minimized";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";

class RoofSupplier extends ObstacleSupplier {
	make(data: ObstacleData) {
		return new Roof(Hitbox.fromNumber(data.hitbox), data.color);
	}
}

export default class Roof extends Obstacle {
	static readonly ID = "roof";
	type = Roof.ID;
	color: number;
	zones: { position: Vec2, hitbox: Hitbox }[] = [];
	roofless = new Set<string>();

	constructor(hitbox: Hitbox, color: number) {
		super(world, hitbox, hitbox, 1, 1);
		this.direction = Vec2.UNIT_X;
		this.color = color;
		this.vulnerable = false;
		this.noCollision = true;
	}

	static {
		OBSTACLE_SUPPLIERS.set(Roof.ID, new RoofSupplier());
	}

	addZone(position: Vec2, hitbox: Hitbox) {
		this.zones.push({ position, hitbox });
	}

	tick(entities: Entity[], _obstacles: Obstacle[]) {
		const roofless = new Set(this.roofless);
		for (const player of entities.filter(ent => ent.type === "player")) {
			if (this.collided(player)) roofless.add(player.id);
			else roofless.delete(player.id);
		}
		if (this.roofless.size != roofless.size || ![...this.roofless].every(x => roofless.has(x))) {
			this.roofless = roofless;
			this.markDirty();
		}
	}

	minimize() {
		return Object.assign(super.minimize(), { color: this.color, roofless: [...this.roofless] });
	}
}