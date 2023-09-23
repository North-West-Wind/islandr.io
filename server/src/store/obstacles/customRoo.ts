import { OBSTACLE_SUPPLIERS } from ".";
import { world } from "../..";
import { ObstacleData } from "../../types/data";
import { Entity } from "../../types/entity";
import { Hitbox, Vec2 } from "../../types/math";
import { MinObstacle } from "../../types/minimized";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";

class CustomRoofSupplier extends ObstacleSupplier {
	make(data: ObstacleData) {
		return new CustomRoof(Hitbox.fromNumber(data.hitbox), data.imagePath);
	}
}

export default class CustomRoof extends Obstacle {
	static readonly ID = "customRoof";
	type = CustomRoof.ID;
	imagePath: string;
	zones: { position: Vec2, hitbox: Hitbox }[] = [];
	CustomRoofless = new Set<string>();

	constructor(hitbox: Hitbox, imagePath: string) {
		super(world, hitbox, hitbox, 1, 1);
		this.direction = Vec2.UNIT_X;
		this.imagePath = imagePath;
		this.vulnerable = false;
		this.noCollision = true;
	}

	static {
		OBSTACLE_SUPPLIERS.set(CustomRoof.ID, new CustomRoofSupplier());
	}

	addZone(position: Vec2, hitbox: Hitbox) {
		this.zones.push({ position, hitbox });
	}

	tick(entities: Entity[], _obstacles: Obstacle[]) {
		const CustomRoofless = new Set(this.CustomRoofless);
		for (const player of entities.filter(ent => ent.type === "player")) {
			if (this.collided(player)) CustomRoofless.add(player.id);
			else CustomRoofless.delete(player.id);
		}
		if (this.CustomRoofless.size != CustomRoofless.size || ![...this.CustomRoofless].every(x => CustomRoofless.has(x))) {
			this.CustomRoofless = CustomRoofless;
			this.markDirty();
		}
	}

	minimize() {
		return Object.assign(super.minimize(), { imagePath: this.imagePath, CustomRoofless: [...this.CustomRoofless] });
	}
}