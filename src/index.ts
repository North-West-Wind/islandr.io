import * as ws from "ws";
import { encode, decode } from "msgpack-lite";
import { ID, wait } from "./utils";
import { PacketResolvable, MousePressPacket, MouseReleasePacket, MouseMovePacket, MovementPressPacket, MovementReleasePacket } from "./types/packets";
import { Entity, Player } from "./types/entities";
import { BASE_RADIUS, DIRECTION_VEC, ENTITY_EXCLUDE, MAP_SIZE, TICKS_PER_SECOND } from "./constants";
import { Vec2 } from "./types/maths";

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
		socket.send(encode({ id, size: MAP_SIZE }).buffer);
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

	const movements = [false, false, false, false];
	const buttons = new Map<number, boolean>();

	socket.on("message", (msg: ArrayBuffer) => {
		const decoded = <PacketResolvable>decode(new Uint8Array(msg));
		switch (decoded.type) {
			case "ping":
				timeout.refresh();
				break;
			case "movementpress":
				const mvPPacket = <MovementPressPacket>decoded;
				movements[mvPPacket.direction] = true;
				var angleVec = Vec2.ZERO;
				for (let ii = 0; ii < movements.length; ii++) if (movements[ii]) angleVec = angleVec.addVec(DIRECTION_VEC[ii]);
				player.setVelocity(angleVec);
			case "movementrelease":
				const mvRPacket = <MovementReleasePacket>decoded;
				movements[mvRPacket.direction] = false;
				var angleVec = Vec2.ZERO;
				for (let ii = 0; ii < movements.length; ii++) if (movements[ii]) angleVec = angleVec.addVec(DIRECTION_VEC[ii]);
				player.setVelocity(angleVec);
			case "mousepress":
				buttons.set((<MousePressPacket>decoded).button, true);
				break;
			case "mousepress":
				buttons.set((<MouseReleasePacket>decoded).button, false);
				break;
			case "mousemove":
				const mMvPacket = <MouseMovePacket>decoded;
				player.setDirection(new Vec2(mMvPacket.x, mMvPacket.y));
				break;
		}
	});

	while (connected) {
		socket.send(encode({
			entities: entities.filter(entity => (entity.type !== "player" || (<Player>entity).id !== id) && entity.position.addVec(player.position.inverse()).magnitudeSqr() < Math.pow(BASE_RADIUS * player.scope, 2)).map((entity: any) => {
				const obj: any = {};
				for (const prop in entity) if (!ENTITY_EXCLUDE.includes(prop) && typeof entity[prop] !== "function") obj[prop] = entity[prop];
				obj.position = { x: entity.position.x, y: entity.position.y };
				return obj;
			}),
			player: { health: player.health, boost: player.boost, scope: player.scope, position: { x: player.position.x, y: player.position.y } }
		}).buffer);
	}
});

setInterval(() => {
	entities.forEach(entity => entity.tick());
}, 1000 / TICKS_PER_SECOND);