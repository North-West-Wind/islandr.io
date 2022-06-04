import * as ws from "ws";
import { encode, decode } from "msgpack-lite";
import { ID, wait } from "./utils";
import { PacketResolvable, MousePressPacket, MouseReleasePacket, MouseMovePacket, MovementPressPacket, MovementReleasePacket } from "./types/packets";
import { Entity, Player } from "./types/entities";
import { BASE_RADIUS, DIRECTION_VEC, ENTITY_EXCLUDE, MAP_SIZE, TICKS_PER_SECOND } from "./constants";
import { Vec2 } from "./types/maths";

const server = new ws.Server({ port: 8080 });
server.once("listening", () => console.log(`WebSocket Server listening at port ${server.options.port}`));

const sockets = new Map<string, ws.WebSocket>();
const entities: Entity[] = [];
const objects = [];

server.on("connection", async socket => {
	// Set the type for msgpack later.
	socket.binaryType = "arraybuffer";

	// Add socket to map with a generated ID.
	const id = await ID();
	sockets.set(id, socket);

	// Setup the close connection listener. Socket will be deleted from map.
	var connected = false;
	socket.on("close", () => {
		sockets.delete(id);
		connected = false;
	});

	// Communicate with the client by sending the ID and map size. The client should respond with { id: ID }, or else close the connection.
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

	// Create the new player and add it to the entity list.
	const player = new Player(id);
	entities.push(player);
	// If the client doesn't ping for 30 seconds, we assume it is a disconnection.
	const timeout = setTimeout(socket.close, 30000);

	// The 4 directions of movement
	const movements = [false, false, false, false];
	const buttons = new Map<number, boolean>();

	socket.on("message", (msg: ArrayBuffer) => {
		const decoded = <PacketResolvable>decode(new Uint8Array(msg));
		switch (decoded.type) {
			case "ping":
				timeout.refresh();
				break;
			case "movementpress":
				// Make the direction true
				const mvPPacket = <MovementPressPacket>decoded;
				movements[mvPPacket.direction] = true;
				// Add corresponding direction vector to a zero vector to determine the velocity and direction.
				var angleVec = Vec2.ZERO;
				for (let ii = 0; ii < movements.length; ii++) if (movements[ii]) angleVec = angleVec.addVec(DIRECTION_VEC[ii]);
				player.setVelocity(angleVec);
				break;
			case "movementrelease":
				// Make the direction false
				const mvRPacket = <MovementReleasePacket>decoded;
				movements[mvRPacket.direction] = false;
				// Same as movementpress
				var angleVec = Vec2.ZERO;
				for (let ii = 0; ii < movements.length; ii++) if (movements[ii]) angleVec = angleVec.addVec(DIRECTION_VEC[ii]);
				player.setVelocity(angleVec);
				break;
			// Very not-done. Will probably change to "attack" and "use" tracking.
			case "mousepress":
				buttons.set((<MousePressPacket>decoded).button, true);
				break;
			case "mousepress":
				buttons.set((<MouseReleasePacket>decoded).button, false);
				break;
			case "mousemove":
				const mMvPacket = <MouseMovePacket>decoded;
				// { x, y } will be x and y offset of the client from the centre of the screen.
				player.setDirection(new Vec2(mMvPacket.x, mMvPacket.y));
				break;
		}
	});

	// Send data if connected.
	while (connected) {
		socket.send(encode({
			// Filter out of range entities. (Early cheat prevention)
			entities: entities.filter(entity => (entity.type !== "player" || (<Player>entity).id !== id) && entity.position.addVec(player.position.inverse()).magnitudeSqr() < Math.pow(BASE_RADIUS * player.scope, 2)).map((entity: any) => {
				const obj: any = {};
				// Remove some properties before sending like velocity and hitbox.
				for (const prop in entity) if (!ENTITY_EXCLUDE.includes(prop) && typeof entity[prop] !== "function") obj[prop] = entity[prop];
				return obj;
			}),
			// Data of the player itself.
			player: { health: player.health, boost: player.boost, scope: player.scope, position: { x: player.position.x, y: player.position.y } }
		}).buffer);
	}
});

setInterval(() => {
	// Tick every single entity.
	entities.forEach(entity => entity.tick());
}, 1000 / TICKS_PER_SECOND);