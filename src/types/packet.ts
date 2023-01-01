import { BASE_RADIUS } from "../constants";
import { Player } from "../store/entities";
import { Entity } from "./entity";
import { Vec2 } from "./math";
import { MinEntity, MinObstacle, MinParticle } from "./minimized";
import { MovementDirection } from "./misc";
import { Obstacle } from "./obstacle";
import { Particle } from "./particle";
import { Terrain } from "./terrain";

interface IPacket {
	type: string;
}

class PingPacket implements IPacket {
	type = "ping";
}

interface MovementPacket extends IPacket {
	type: string;
	direction: MovementDirection;
}

export class MovementPressPacket implements MovementPacket {
	type = "movementpress";
	direction!: MovementDirection;
}

export class MovementReleasePacket implements MovementPacket {
	type = "movementrelease";
	direction!: MovementDirection;
}

interface MousePacket extends IPacket {
	type: string;
	button: number;
}

export class MousePressPacket implements MousePacket {
	type = "mousepress";
	button!: number;
}

export class MouseReleasePacket implements MousePacket {
	type = "mouserelease";
	button!: number;
}

export class MouseMovePacket implements IPacket {
	type = "mousemove";
	x!: number;
	y!: number;
}

export type ClientPacketResolvable = PingPacket | MousePressPacket | MouseReleasePacket | MouseMovePacket | MovementPressPacket | MovementReleasePacket;

export class AckPacket implements IPacket {
	type = "ack";
	id: string;
	size: number[];
	terrain: string;

	constructor(id: string, size: Vec2, terrain: Terrain) {
		this.id = id;
		this.size = Object.values(size);
		this.terrain = terrain.id;
	}
}

export class GamePacket implements IPacket {
	type = "game";
	entities: MinEntity[];
	obstacles: MinObstacle[];
	player: Player;

	constructor(entities: Entity[], obstacles: Obstacle[], player: Player) {
		this.entities = entities.filter(entity => entity.position.addVec(player.position.inverse()).magnitudeSqr() < Math.pow(BASE_RADIUS * player.scope, 2)).map(entity => entity.minimize());
		this.obstacles = obstacles.filter(obstacle => obstacle.position.addVec(player.position.inverse()).magnitudeSqr() < Math.pow(BASE_RADIUS * player.scope, 2)).map(obstacle => obstacle.minimize());
		this.player = player;
	}
}

export class MapPacket implements IPacket {
	type = "map";
	obstacles: { type: string, position: Vec2 }[];

	constructor(obstacles: Obstacle[]) {
		this.obstacles = obstacles.map(obstacle => ({ type: obstacle.type, position: obstacle.position }));
	}
}

export class AnnouncePacket implements IPacket {
	type = "announce";
	announcement: string;

	constructor(announcement: string) {
		this.announcement = announcement;
	}
}

// Let the client handle particles
export class ParticlesPacket implements IPacket {
	type = "particles";
	particles: MinParticle[];

	constructor(particles: Particle[], player: Player) {
		this.particles = particles.filter(particle => particle.position.addVec(player.position.inverse()).magnitudeSqr() < Math.pow(BASE_RADIUS * player.scope, 2)).map(particle => particle.minimize());
	}
}