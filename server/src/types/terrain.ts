import Building from "./building";
import { Entity } from "./entity";
import { Line, Vec2 } from "./math";
import { MinTerrain } from "./minimized";
import { Obstacle } from "./obstacle";
import { Particle } from "./particle";

export class World {
	ticks = 0;
	size: Vec2;
	entities: Entity[] = [];
	obstacles: Obstacle[] = [];
	buildings: Building[] = [];
	discardEntities: string[] = [];
	discardObstacles: string[] = [];
	dirtyEntities: Entity[] = [];
	dirtyObstacles: Obstacle[] = [];
	defaultTerrain: Terrain;
	terrains: Terrain[];
	lastSecond = 0;

	// These should be sent once only to the client
	particles: Particle[] = [];
	onceSounds: { path: string, position: Vec2 }[] = []; // Sent when stuff happens, e.g. effect sounds
	joinSounds: { path: string, position: Vec2 }[] = []; // Sent when player joins, e.g. music

	constructor(size: Vec2, defaultTerrain: Terrain, ...terrains: Terrain[]) {
		// Set the size of map
		this.size = size;

		// Set the terrains
		this.defaultTerrain = defaultTerrain;
		this.terrains = terrains;
	}

	terrainAtPos(position: Vec2) {
		// Loop from last to first
		for (let ii = this.terrains.length - 1; ii >= 0; ii--) {
			const terrain = this.terrains[ii];
			if (terrain.inside(position)) return terrain;
		}
		return this.defaultTerrain;
	}

	tick() {
		this.ticks++;
		// TPS observer
		/*if (!this.lastSecond) this.lastSecond = Date.now();
		else if (Date.now() - this.lastSecond >= 1000) {
			console.log("TPS:", this.ticks);
			this.lastSecond = Date.now();
			this.ticks = 0;
		}*/

		// Merge obstacles
		const allObstacles = this.obstacles.concat(...this.buildings.map(b => b.obstacles.map(o => o.obstacle)));

		// Tick every entity and obstacle.
		let ii: number;
		var removable: number[] = [];
		for (ii = 0; ii < this.entities.length; ii++) {
			const entity = this.entities[ii];
			entity.tick(this.entities, allObstacles);
			// Mark entity for removal
			if (entity.despawn && entity.discardable) {
				removable.push(ii);
				this.discardEntities.push(entity.id);
			} else if (entity.dirty) {
				entity.unmarkDirty();
				this.dirtyEntities.push(entity);
			}
		}
		// Remove all discardable entities
		for (ii = removable.length - 1; ii >= 0; ii--) this.entities.splice(removable[ii], 1);
	
		removable = [];
		for (ii = 0; ii < allObstacles.length; ii++) {
			const obstacle = allObstacles[ii];
			obstacle.tick(this.entities, allObstacles);
			// Mark obstacle for removal
			if (obstacle.despawn && obstacle.discardable) {
				removable.push(ii);
				this.discardObstacles.push(obstacle.id);
			} else if (obstacle.dirty) {
				obstacle.unmarkDirty();
				this.dirtyObstacles.push(obstacle);
			}
		}
		// Remove all discardable obstacles
		for (ii = removable.length - 1; ii >= 0; ii--) this.obstacles.splice(removable[ii], 1);
	}

	// Called after data are sent to clients
	postTick() {
		this.entities = this.entities.map(entity => {
			entity.animations = [];
			return entity;
		});
		this.obstacles = this.obstacles.map(obstacle => {
			obstacle.animations = [];
			return obstacle;
		});
		this.particles = [];
		this.onceSounds = [];
		this.discardEntities = [];
		this.discardObstacles = [];
		this.dirtyEntities = [];
		this.dirtyObstacles = [];
	}
}

export abstract class Terrain {
	id!: string;
	type = "generic";
	// Moving speed factor, 0 - 1
	speed: number;
	// Damage per interval
	damage: number;
	// Interval duration (in ticks)
	interval: number;

	constructor(speed: number, damage: number, interval: number) {
		this.speed = speed;
		this.damage = damage;
		this.interval = interval;
	}

	abstract inside(position: Vec2): boolean;

	minimize() {
		return <MinTerrain> { id: this.id };
	}
}

export class FullTerrain extends Terrain {
	type = "full";

	inside(_position: Vec2) {
		return true;
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

	inside(position: Vec2) {
		return position.distanceSqrTo(this.position) <= this.radius * this.radius;
	}

	minimize() {
		return Object.assign(super.minimize(), { position: this.position, radius: this.radius });
	}
}

export class LineTerrain extends Terrain {
	type = "line";
	// The line and its range
	line: Line;
	range: number;
	// The boundary lines. Position does not matter so Vec2 is enough.
	boundary: { start: Vec2, end: Vec2 };

	constructor(speed: number, damage: number, interval: number, line: Line, range: number) {
		super(speed, damage, interval);
		line.segment = false;
		this.line = line;
		this.range = range;

		// Default boundary: perpendicular to the line
		const pab = this.line.toVec().perpendicular();
		this.boundary = { start: pab, end: pab };
	}

	inside(position: Vec2) {
		if (this.line.distanceSqrTo(position) > this.range * this.range) return false;
		const startLine = new Line(this.line.a, this.line.a.addVec(this.boundary.start.inverse()));
		const endLine = new Line(this.line.b, this.line.b.addVec(this.boundary.end.inverse()));
		return startLine.rightTo(position) && endLine.leftTo(position);
	}

	minimize() {
		return Object.assign(super.minimize(), { line: this.line.minimize(), range: this.range, boundary: [this.boundary.start.minimize(), this.boundary.end.minimize()] });
	}
}

// Multiple lines
export class PiecewiseTerrain extends Terrain {
	type = "piecewise";
	// All the lines
	lines: LineTerrain[] = [];

	inside(position: Vec2) {
		for (const terrain of this.lines) {
			if (terrain.inside(position)) return true;
		}
		return false;
	}

	minimize() {
		return Object.assign(super.minimize(), { lines: this.lines.map(l => l.minimize()) });
	}
}