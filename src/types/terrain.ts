import { Tree, Bush, Crate } from "../store/obstacles";
import { Entity } from "./entity";
import { Vec2 } from "./math";
import { Obstacle } from "./obstacle";

export class World {
	ticks = 0;
	size: Vec2;
	entities: Entity[] = [];
	obstacles: Obstacle[] = [];
	defaultTerrain: Terrain;
	terrains: Terrain[] = [];

	constructor(size: Vec2, defaultTerrain: Terrain, ...terrains: Terrain[]) {
		// Set the size of map
		this.size = size;

		// Set the terrains
		this.defaultTerrain = defaultTerrain;
		this.terrains = terrains;

		// Add random obstacles
		for (let ii = 0; ii < 50; ii++) this.obstacles.push(new Tree(this));
		for (let ii = 0; ii < 50; ii++) this.obstacles.push(new Bush(this));
		for (let ii = 0; ii < 50; ii++) this.obstacles.push(new Crate(this));
	}

	terrainAtPos(position: Vec2) {
		// Loop from last to first
		for (let ii = this.terrains.length - 1; ii >= 0; ii--) {
			const terrain = this.terrains[ii];
			switch (terrain.type) {
				case "dot":
					if (position.distanceSqrTo((<DotTerrain> terrain).position) <= Math.pow((<DotTerrain> terrain).radius, 2))
						return terrain;
					break;
			}
		}
		return this.defaultTerrain;
	}

	tick() {
		this.ticks++;
		// Tick every entity and obstacle.
		let ii: number;
		var removable: number[] = [];
		for (ii = 0; ii < this.entities.length; ii++) {
			const entity = this.entities[ii];
			entity.tick(this.entities, this.obstacles);
			// Mark entity for removal
			if (entity.despawn && entity.discardable) removable.push(ii);
		}
		// Remove all discardable entities
		for (ii = removable.length - 1; ii >= 0; ii--) this.entities.splice(removable[ii], 1);
	
		removable = [];
		for (ii = 0; ii < this.obstacles.length; ii++) {
			const obstacle = this.obstacles[ii];
			obstacle.tick(this.entities, this.obstacles);
			// Mark obstacle for removal
			if (obstacle.despawn && obstacle.discardable) removable.push(ii);
		}
		// Remove all discardable obstacles
		for (ii = removable.length - 1; ii >= 0; ii--) this.obstacles.splice(removable[ii], 1);
	}
}

export class Terrain {
	id!: string;
	type = "generic";
	// Moving speed factor, 0 - 1
	speed: number;
	// Damage per interval
	damage: number;
	// Interval duration (in ticks)
	interval: number;
	// If the terrain fills the map
	full = false;

	constructor(speed: number, damage: number, interval: number) {
		this.speed = speed;
		this.damage = damage;
		this.interval = interval;
	}
}

export class DotTerrain extends Terrain {
	type = "dot";
	// Position of it on the map
	position: Vec2;
	radius: number;

	constructor(speed: number, damage: number, interval: number, position: Vec2, radius: number) {
		super(speed, damage, interval);
		this.position = position;
		this.radius = radius;
	}
}