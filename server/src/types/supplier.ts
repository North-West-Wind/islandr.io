import { castCorrectObstacle } from "../store/obstacles";
import Building from "./building";
import { BuildingData, ObstacleData } from "./data";
import { CommonAngles, Hitbox, Vec2 } from "./math";
import { Obstacle } from "./obstacle";
import { Weapon } from "./weapon";

export interface Supplier<T> {
	create(...arg: any[]): T;
}

export interface WeaponSupplier extends Supplier<Weapon> {
	create(): Weapon;
}

export abstract class ObstacleSupplier implements Supplier<Obstacle> {
	abstract make(data: ObstacleData): Obstacle;

	create(data: ObstacleData) {
		const obstacle = this.make(data);
		if (!data.direction) obstacle.direction = Vec2.UNIT_X;
		else if (Array.isArray(data.direction)) obstacle.direction = Vec2.fromArray(data.direction);
		else obstacle.direction = Vec2.UNIT_X.addAngle(Math.random() * CommonAngles.TWO_PI);
		return obstacle;
	}
}

export class BuildingSupplier implements Supplier<Building> {
	id: string;
	data: BuildingData;

	constructor(id: string, data: BuildingData) {
		this.id = id;
		this.data = data;
	}

	create() {
		const building = new Building();
		for (const ob of this.data.obstacles) {
			const obstacle = castCorrectObstacle(ob);
			if (!obstacle) continue;
			building.addObstacle(Vec2.fromArray(ob.position), obstacle);
		}
		if (this.data.zones)
			for (const zone of this.data.zones)
				building.addZone(Vec2.fromArray(zone.position), Hitbox.fromNumber(zone.hitbox));
		building.color = this.data.mapColor;
		return building;
	}
}