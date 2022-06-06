import { MovementDirection } from "./maths";

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

export type PacketResolvable = PingPacket | MousePressPacket | MouseReleasePacket | MouseMovePacket | MovementPressPacket | MovementReleasePacket;