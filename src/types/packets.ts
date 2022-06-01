interface IPacket {
	type: string;
}

class PingPacket implements IPacket {
	type = "ping";
}

interface KeyPacket extends IPacket {
	type: string;
	keycode: number;
}

export abstract class PressPacket implements KeyPacket {
	type = "press";
	keycode!: number;
}

export abstract class ReleasePacket implements KeyPacket {
	type = "release";
	keycode!: number;
}

export type PacketResolvable = PingPacket | PressPacket | ReleasePacket;