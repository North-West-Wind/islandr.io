import { BASE_RADIUS, ENTITY_EXCLUDE, OBJECT_EXCLUDE } from "../constants";
import { Player } from "../store/entities";
import { Entity } from "./entities";
import { MovementDirection, Vec2 } from "./maths";
import { GameObject } from "./objects";

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

export class GamePacket implements IPacket {
	type = "game";
	entities: Entity[];
	objects: GameObject[];
	player: Player;

	constructor(entities: Entity[], objects: GameObject[], player: Player) {
		this.entities = entities.filter(entity => entity.position.addVec(player.position.inverse()).magnitudeSqr() < Math.pow(BASE_RADIUS * player.scope, 2));
		this.objects = objects.filter(object => object.position.addVec(player.position.inverse()).magnitudeSqr() < Math.pow(BASE_RADIUS * player.scope, 2));
		this.player = player;
	}
}

export class MapPacket implements IPacket {
	type = "map";
	objects: { type: string, position: Vec2 }[];

	constructor(objects: GameObject[]) {
		this.objects = objects.map(object => ({ type: object.type, position: object.position }));
	}
}