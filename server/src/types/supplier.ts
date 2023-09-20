import { Roof, castCorrectObstacle } from "../store/obstacles";
import Building from "./building";
import { BuildingData, ObstacleData, TerrainData } from "./data";
import { CommonAngles, Hitbox, Vec2 } from "./math";
import { Obstacle } from "./obstacle";
import { Terrain } from "./terrain";
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

	create(direction = Vec2.UNIT_X) {
		const angle = direction.angle();
		const building = new Building();
		building.direction = direction;
		for (const ob of this.data.obstacles) {
			const obstacle = castCorrectObstacle(ob);
			if (!obstacle) continue;
			building.addObstacle(Vec2.fromArray(ob.position).addAngle(angle), obstacle);
		}
		const zones = this.data.zones?.map(zone => ({ position: Vec2.fromArray(zone.position).addAngle(angle), hitbox: Hitbox.fromNumber(zone.hitbox), map: !!zone.map })) || [];
		if (this.data.zones)
			for (const zone of zones)
				building.addZone(zone.position, zone.hitbox, zone.map);
		if (this.data.roofs)
			for (const ob of this.data.roofs) {
				const roof = new Roof(Hitbox.fromNumber(ob.hitbox), ob.color, ob.texture, building.id);
				building.addObstacle(Vec2.fromArray(ob.position).addAngle(angle), roof);
			}
		building.setDirection(direction);
		building.color = this.data.mapColor;
		return building;
	}
}

export class TerrainSupplier implements Supplier<Terrain> {
	id: string;
	data: TerrainData;

	constructor(id: string, data: TerrainData) {
		this.id = id;
		this.data = data;
	}

	create() {
		return Terrain.fromTerrainData(this.data);
	}
}