import { MovementDirection } from "./math";
import { MinEntity, MinObstacle, MinMinObstacle, MinTerrain } from "./minimized";

// Packet to ping the server
export class PingPacket {
	type = "ping";
}

// Packet to notify movement key press
export class MovementPressPacket {
	type = "movementpress";
	direction: MovementDirection;

	constructor(direction: MovementDirection) {
		this.direction = direction;
	}
}

// Packet to notify movement key release
export class MovementReleasePacket {
	type = "movementrelease";
	direction: MovementDirection;

	constructor(direction: MovementDirection) {
		this.direction = direction;
	}
}

// Packet to notify mouse button press
export class MousePressPacket {
	type = "mousepress";
	button: number;

	constructor(button: number) {
		this.button = button;
	}
}

// Packet to notify mouse button release
export class MouseReleasePacket {
	type = "mouserelease";
	button: number;

	constructor(button: number) {
		this.button = button;
	}
}

// Packet to notify mouse movement
export class MouseMovePacket {
	type = "mousemove";
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}

// Packet to notify interaction (e.g. pickup)
export class InteractPacket {
	type = "interact";
}

// Packet to notify weapon switching
export class SwitchWeaponPacket {
	type = "switchweapon";
	delta: number;

	constructor(delta: number) {
		this.delta = delta;
	}
}

// Packet to notify weapon reloading
export class ReloadWeaponPacket {
	type = "reloadweapon";
}

/// Packet from server acknowledgement
export class AckPacket {
	type = "ack";
	id!: string;
	tps!: number;
	size!: number[];
	terrain!: MinTerrain;
}

/// Packet from server containing game data
export class GamePacket {
	type = "game";
	entities!: MinEntity[];
	obstacles!: MinObstacle[];
	player!: any;
	alivecount!: number;
}

/// Packet from server containing map data
export class MapPacket {
	type = "map";
	obstacles!: MinMinObstacle[];
	terrains!: MinTerrain[];
}