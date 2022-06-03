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

export abstract class KeyPressPacket implements KeyPacket {
	type = "keypress";
	keycode!: number;
}

export abstract class KeyReleasePacket implements KeyPacket {
	type = "keyrelease";
	keycode!: number;
}

interface MousePacket extends IPacket {
	type: string;
	button: number;
}

export abstract class MousePressPacket implements MousePacket {
	type = "mousepress";
	button!: number;
}

export abstract class MouseReleasePacket implements MousePacket {
	type = "mouserelease";
	button!: number;
}

export type PacketResolvable = PingPacket | KeyPressPacket | KeyReleasePacket | MousePressPacket | MouseReleasePacket;