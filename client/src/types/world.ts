import { castEntity, FullPlayer } from "../store/entities";
import { Entity } from "./entity";
import { CircleHitbox, Vec2 } from "./math";
import { MinCircleHitbox, MinEntity, MinObstacle, MinParticle, MinVec2 } from "./minimized";
import { Obstacle } from "./obstacle";
import { castObstacle } from "../store/obstacles";
import { Howl } from "howler";
import Building from "./building";
import { Terrain } from "./terrain";
import { DummyParticle, Particle } from "./particle";
import { castParticle } from "../store/particles";

export class World {
	size: Vec2;
	entities: Entity[] = [];
	obstacles: Obstacle[] = [];
	buildings: Building[] = [];
	particles: Particle[] = [];
	defaultTerrain: Terrain;
	terrains: Terrain[] = [];
	aliveCount: Number = 0;
	sounds: Map<number, { howl: Howl; pos: Vec2; }> = new Map();
	safeZone: { hitbox: CircleHitbox; position: Vec2; };
	nextSafeZone: { hitbox: CircleHitbox; position: Vec2; };

	constructor(size: Vec2, defaultTerrain: Terrain) {
		this.size = size;
		this.defaultTerrain = defaultTerrain;
		this.safeZone = this.nextSafeZone = { hitbox: new CircleHitbox(this.size.magnitude() * 0.5), position: this.size.scaleAll(0.5) };
	}

	clientTick(player: FullPlayer) {
		for (const sound of this.sounds.values()) {
			const relative = sound.pos.addVec(player.position.inverse()).scaleAll(1 / 60);
			sound.howl.pos(relative.x, relative.y);
		}
		this.particles = this.particles.filter(p => !p.ended);
	}

	updateEntities(entities: MinEntity[], discardEntities: string[] = []) {
		const pending: Entity[] = [];
		for (const entity of this.entities) {
			if (discardEntities.includes(entity.id)) continue;
			const newData = entities.find(e => e.id == entity.id);
			if (newData) entity.copy(newData);
			pending.push(entity);
		}
		for (const entity of entities) {
			const existing = this.entities.find(e => e.id == entity.id);
			if (!existing) pending.push(castEntity(entity));
		}
		this.entities = pending;
	}

	updateObstacles(obstacles: MinObstacle[], discardObstacles: string[] = []) {
		const pending: Obstacle[] = [];
		for (const obstacle of this.obstacles) {
			if (discardObstacles.includes(obstacle.id)) continue;
			const newData = obstacles.find(o => o.id == obstacle.id);
			if (newData) obstacle.copy(newData);
			pending.push(obstacle);
		}
		for (const obstacle of obstacles) {
			const existing = this.obstacles.find(o => o.id == obstacle.id);
			if (!existing) pending.push(castObstacle(obstacle));
		}
		this.obstacles = pending;
	}

	updateLiveCount(count: Number) {
		this.aliveCount = count;
		(document.getElementById("playercount") as HTMLInputElement).innerText = this.aliveCount.toString();
	}

	updateSafeZone(safeZone: { hitbox: MinCircleHitbox; position: MinVec2; }) {
		this.safeZone.hitbox = CircleHitbox.fromMinCircleHitbox(safeZone.hitbox);
		this.safeZone.position = Vec2.fromMinVec2(safeZone.position);
	}

	updateNextSafeZone(nextSafeZone: { hitbox: MinCircleHitbox; position: MinVec2; }) {
		this.nextSafeZone.hitbox = CircleHitbox.fromMinCircleHitbox(nextSafeZone.hitbox);
		this.nextSafeZone.position = Vec2.fromMinVec2(nextSafeZone.position);
	}

	addParticles(minParticles: MinParticle[]) {
		this.particles.push(...minParticles.map(p => castParticle(p)).filter(p => p.id !== DummyParticle.TYPE));
	}
}
