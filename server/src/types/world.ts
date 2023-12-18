import * as fs from "fs";
import Building from "./building";
import { RedZoneDataEntry } from "./data";
import { Entity } from "./entity";
import { CircleHitbox, Vec2 } from "./math";
import { Obstacle } from "./obstacle";
import { Particle } from "./particle";
import { PLAYER_THRESHOLD, TICKS_PER_SECOND } from "../constants";
import { Player } from "../store/entities";
import { Terrain } from "./terrain";
import { reset } from "..";

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
	terrains: Terrain[] = [];
	lastSecond = 0;
	playerCount = 0;

	// Red zone stuff
	private zoneActive = false;
	private zoneData: RedZoneDataEntry[];
	private zoneStep = 0;
	zoneMoving = false;
	private zoneTick: number;
	zoneDamage: number;
	nextSafeZone: { hitbox: CircleHitbox; position: Vec2; };
	safeZone: { hitbox: CircleHitbox; oHitbox: CircleHitbox; position: Vec2; oPosition: Vec2; };

	// These should be sent once only to the client
	particles: Particle[] = [];
	onceSounds: { path: string; position: Vec2; }[] = []; // Sent when stuff happens, e.g. effect sounds
	joinSounds: { path: string; position: Vec2; }[] = []; // Sent when player joins, e.g. music

	//Kill feed storage
	killFeeds:string[] = [];
	constructor(size: Vec2, defaultTerrain: Terrain) {
		// Set the size of map
		this.size = size;

		// Set the terrains
		this.defaultTerrain = defaultTerrain;

		// Red zone init
		this.zoneData = <RedZoneDataEntry[]>JSON.parse(fs.readFileSync("../data/config/red_zone.json", { encoding: "utf8" }));
		this.zoneTick = this.zoneData[this.zoneStep].wait * TICKS_PER_SECOND;
		this.zoneDamage = this.zoneData[this.zoneStep].damage;

		this.safeZone = {
			hitbox: new CircleHitbox(this.size.magnitude() * 0.5),
			oHitbox: new CircleHitbox(this.size.magnitude() * 0.5),
			position: this.size.scaleAll(0.5),
			oPosition: this.size.scaleAll(0.5)
		};
		this.nextSafeZone = this.safeZone;
	}

	addPlayer(player: Player) {
		this.playerCount++;
		this.entities.push(player);
		if (!this.zoneActive && this.playerCount >= PLAYER_THRESHOLD) {
			this.zoneActive = true;
			console.log("Red zone is now active");
		}
	}

	playerDied() {
		this.playerCount = this.entities.filter(entity => entity.type === "player" && !entity.despawn).length;
		if (this.zoneActive || this.zoneTick > 0) return;
		if (!this.playerCount) {
			console.log("All players have died. Resetting game...");
			reset();
		}
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

		// Tick red zone
		if (this.zoneActive) {
			this.zoneTick--;
			if (!this.zoneTick) {
				this.zoneMoving = !this.zoneMoving;
				if (this.zoneMoving) this.zoneTick = this.zoneData[this.zoneStep].move * TICKS_PER_SECOND;
				else {
					this.zoneStep++;
					if (!this.zoneData[this.zoneStep]) {
						this.zoneActive = false;
						this.zoneTick = 0;
						this.playerDied();
					} else {
						this.safeZone.oPosition = this.safeZone.position;
						this.safeZone.oHitbox = this.safeZone.hitbox;
						const positions = this.entities.filter(entity => entity.type === "player" && !entity.despawn).map(entity => entity.position);
						this.nextSafeZone = {
							hitbox: new CircleHitbox(Math.sqrt(this.size.scaleAll(0.5).magnitudeSqr() * this.zoneData[this.zoneStep].area)),
							position: positions.length ? positions.reduce((a, b) => a.addVec(b)).scaleAll(1 / positions.length) : this.nextSafeZone.position
						};
						this.zoneTick = this.zoneData[this.zoneStep].wait * TICKS_PER_SECOND;
					}
				}
			}
			if (this.zoneMoving) {
				const vec = this.nextSafeZone.position.addVec(this.safeZone.oPosition.inverse());
				this.safeZone.position = this.safeZone.oPosition.addVec(vec.scaleAll((this.zoneData[this.zoneStep].move * TICKS_PER_SECOND - this.zoneTick) / (this.zoneData[this.zoneStep].move * TICKS_PER_SECOND)));
				this.safeZone.hitbox = new CircleHitbox((this.safeZone.oHitbox.radius - this.nextSafeZone.hitbox.radius) * this.zoneTick / (this.zoneData[this.zoneStep].move * TICKS_PER_SECOND) + this.nextSafeZone.hitbox.radius);
			}
		}
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
		this.killFeeds = [];
		this.discardEntities = [];
		this.discardObstacles = [];
		this.dirtyEntities = [];
		this.dirtyObstacles = [];
	}
}
