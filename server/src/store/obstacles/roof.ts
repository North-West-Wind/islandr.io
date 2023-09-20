import { OBSTACLE_SUPPLIERS } from ".";
import { world } from "../..";
import { ObstacleData } from "../../types/data";
import { Hitbox, Vec2 } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";

class RoofSupplier extends ObstacleSupplier {
	make(data: ObstacleData) {
		return new Roof(Hitbox.fromNumber(data.hitbox), data.color, data.buildingId, data.texture);
	}
}

export default class Roof extends Obstacle {
	static readonly ID = "roof";
	type = Roof.ID;
	color: number;
	buildingId: string;
	texture?: { path: string, horizontalFill?: number };
	roofless = new Set<string>();

	constructor(hitbox: Hitbox, color: number, buildingId: string, texture?: { path: string, horizontalFill?: number }) {
		super(world, hitbox, hitbox, 1, 1);
		this.direction = Vec2.UNIT_X;
		this.color = color;
		this.texture = texture;
		this.buildingId = buildingId;
		this.vulnerable = false;
		this.noCollision = true;
	}

	static {
		OBSTACLE_SUPPLIERS.set(Roof.ID, new RoofSupplier());
	}

	// Handled from the building's zones
	addRoofless(entityId: string) {
		const roofless = new Set(this.roofless);
		roofless.add(entityId);
		if (this.roofless.size != roofless.size || ![...this.roofless].every(x => roofless.has(x))) {
			this.roofless = roofless;
			this.markDirty();
		}
	}

	delRoofless(entityId: string) {
		const roofless = new Set(this.roofless);
		roofless.delete(entityId);
		if (this.roofless.size != roofless.size || ![...this.roofless].every(x => roofless.has(x))) {
			this.roofless = roofless;
			this.markDirty();
		}
	}

	/*
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
	}*/

	minimize() {
		return Object.assign(super.minimize(), { color: this.color, texture: this.texture, roofless: [...this.roofless] });
	}
}