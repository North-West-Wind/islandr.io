import { OBSTACLE_SUPPLIERS } from ".";
import { world } from "../..";
import { ObstacleData } from "../../types/data";
import { CommonAngles, RectHitbox, Vec2 } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";

class DoorSupplier extends ObstacleSupplier {
	make(data: ObstacleData) {
		return new Door(RectHitbox.fromArray(data.hitbox), data.health || 1, Vec2.fromArray(data.pivot));
	}
}

export default class Door extends Obstacle {
	static readonly TYPE = "door";
	type = Door.TYPE;
	// Pivot is relative to the center of 
	pivot: Vec2;
	discardable = true;
	interactable = true;
	opened = false;

	// We may add a metal type later
	constructor(hitbox: RectHitbox, health: number, pivot: Vec2) {
		super(world, hitbox, hitbox, health, health);
		this.pivot = pivot;
	}

	static {
		OBSTACLE_SUPPLIERS.set(Door.TYPE, new DoorSupplier());
	}

	interact() {
		if (this.opened) {
			this.position = this.position.addVec(this.pivot).addVec(this.pivot.inverse().addAngle(-CommonAngles.PI_TWO));
			this.direction = this.direction.addAngle(-CommonAngles.PI_TWO);
			this.pivot = this.pivot.addAngle(-CommonAngles.PI_TWO);
			this.opened = false;
		} else {
			this.position = this.position.addVec(this.pivot).addVec(this.pivot.inverse().addAngle(CommonAngles.PI_TWO));
			this.direction = this.direction.addAngle(CommonAngles.PI_TWO);
			this.pivot = this.pivot.addAngle(CommonAngles.PI_TWO);
			this.opened = true;
		}
		this.markDirty();
	}

	interactionKey() {
		return `prompt.interact.door.${this.opened ? "close" : "open"}`;
	}
}