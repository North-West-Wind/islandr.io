import * as ws from "ws";
import { encode, decode } from "msgpack-lite";
import { ID, wait } from "./utils";
import { PacketResolvable, PressPacket, ReleasePacket } from "./types/packets";

const server = new ws.Server({ port: 8080 });

const sockets = new Map<string, ws.WebSocket>();
const entities = [];
const objects = [];

server.on("connection", async socket => {
	socket.binaryType = "arraybuffer";

	const id = await ID();
	sockets.set(id, socket);
	
	var connected = false;
	await Promise.race([wait(10000), new Promise<void>(resolve => {
		socket.send(encode({ id }).buffer);
		socket.once("message", (msg: ArrayBuffer) => {
			const decoded = decode(new Uint8Array(msg));
			if (decoded.id == id) connected = true;
			else {
				socket.close();
				sockets.delete(id);
			}
			resolve();
		})
	})]);
	if (!connected) return;

	const timeout = setTimeout(() => {
		socket.close();
		sockets.delete(id);
		connected = false;
	}, 30000);

	const keys = new Map<number, boolean>()

	socket.on("message", (msg: ArrayBuffer) => {
		const decoded = <PacketResolvable> decode(new Uint8Array(msg));
		switch (decoded.type) {
			case "ping":
				timeout.refresh();
				break;
			case "press":
				keys.set((<PressPacket> decoded).keycode, true);
				break;
			case "release":
				keys.set((<ReleasePacket> decoded).keycode, false);
				break;
		}
	});


});