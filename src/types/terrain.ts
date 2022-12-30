import { Tree, Bush, Crate } from "../store/obstacles";
import { Entity } from "./entity";
import { Vec2 } from "./math";
import { Obstacle } from "./obstacle";
import { MapPacket } from "./packet";

export class World {
	ticks = 0;
	size: Vec2;
	entities: Entity[] = [];
	obstacles: Obstacle[] = [];

	constructor(size: Vec2) {
		// Set the size of map
		this.size = size;

		// Add random obstacles
		for (let ii = 0; ii < 50; ii++) this.obstacles.push(new Tree(this));
		for (let ii = 0; ii < 50; ii++) this.obstacles.push(new Bush(this));
		for (let ii = 0; ii < 50; ii++) this.obstacles.push(new Crate(this));
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

	packetize() {
		return new MapPacket(this.obstacles);
	}
}