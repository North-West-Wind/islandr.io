import * as ws from "ws";
import { encode, decode } from "msgpack-lite";
import { ID, wait } from "./utils";
import { PacketResolvable, KeyPressPacket, KeyReleasePacket, MousePressPacket, MouseReleasePacket } from "./types/packets";
import { Entity, Player } from "./types/entities";
import { BASE_RADIUS, ENTITY_EXCLUDE, TICKS_PER_SECOND } from "./constants";

const server = new ws.Server({ port: 8080 });

const sockets = new Map<string, ws.WebSocket>();
const entities: Entity[] = [];
const objects = [];

server.on("connection", async socket => {
	socket.binaryType = "arraybuffer";

	const id = await ID();
	sockets.set(id, socket);

	var connected = false;
	socket.on("close", () => {
		sockets.delete(id);
		connected = false;
	})

	await Promise.race([wait(10000), new Promise<void>(resolve => {
		socket.send(encode({ id }).buffer);
		socket.once("message", (msg: ArrayBuffer) => {
			const decoded = decode(new Uint8Array(msg));
			if (decoded.id == id) connected = true;
			else socket.close();
			resolve();
		})
	})]);
	if (!connected) return;

	const player = new Player(id);
	entities.push(player);
	const timeout = setTimeout(socket.close, 30000);

	const keys = new Map<number, boolean>();
	const buttons = new Map<number, boolean>();

	socket.on("message", (msg: ArrayBuffer) => {
		const decoded = <PacketResolvable>decode(new Uint8Array(msg));
		switch (decoded.type) {
			case "ping":
				timeout.refresh();
				break;
			case "keypress":
				keys.set((<KeyPressPacket>decoded).keycode, true);
				break;
			case "keyrelease":
				keys.set((<KeyReleasePacket>decoded).keycode, false);
				break;
			case "mousepress":
				buttons.set((<MousePressPacket>decoded).button, true);
				break;
			case "mousepress":
				buttons.set((<MouseReleasePacket>decoded).button, false);
				break;
		}
	});

	var canTryPickup = true;
	while (connected) {
		socket.send(encode({
			entities: entities.filter(entity => (entity.type !== "player" || (<Player> entity).id !== id) && entity.position.add(player.position.inverse()).magnitudeSqr() < Math.pow(BASE_RADIUS * player.scope, 2)).map((entity: any) => {
				const obj: any = {};
				for (const prop in entity) if (!ENTITY_EXCLUDE.includes(prop) && typeof entity[prop] !== "function") obj[prop] = entity[prop];
				obj.position = { x: entity.position.x, y: entity.position.y };
				return obj;
			}),
			player: { health: player.health, boost: player.boost, scope: player.scope, position: { x: player.position.x, y: player.position.y } }
		}).buffer)
	}
});

setInterval(() => {

}, 1000 / TICKS_PER_SECOND);