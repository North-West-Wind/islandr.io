import * as ws from "ws";
import { encode, decode } from "msgpack-lite";
import { ID, randomSelect, wait } from "./utils";
import { ClientPacketResolvable, MousePressPacket, MouseReleasePacket, MouseMovePacket, MovementPressPacket, MovementReleasePacket, GamePacket } from "./types/packets";
import { Entity, Player } from "./types/entities";
import { ATTACKS, DIRECTION_VEC, MAP_SIZE, TICKS_PER_SECOND } from "./constants";
import { Vec2 } from "./types/maths";
import { GameObject, Tree } from "./types/objects";

export var ticksElapsed = 0;

const server = new ws.Server({ port: 8080 });
server.once("listening", () => console.log(`WebSocket Server listening at port ${server.options.port}`));

const sockets = new Map<string, ws.WebSocket>();
const entities: Entity[] = [];
const objects: GameObject[] = [];

// Initialize the map
for (let ii = 0; ii < 1000; ii++) objects.push(new Tree(objects));

server.on("connection", async socket => {
	console.log("Received a connection request");
	// Set the type for msgpack later.
	socket.binaryType = "arraybuffer";

	// Add socket to map with a generated ID.
	const id = await ID();
	sockets.set(id, socket);

	// Setup the close connection listener. Socket will be deleted from map.
	var connected = false;
	socket.on("close", () => {
		console.log("Connection closed");
		sockets.delete(id);
		connected = false;
	});

	// Communicate with the client by sending the ID and map size. The client should respond with { id: ID }, or else close the connection.
	await Promise.race([wait(10000), new Promise<void>(resolve => {
		socket.send(encode({ id, size: MAP_SIZE }).buffer);
		socket.once("message", (msg: ArrayBuffer) => {
			const decoded = decode(new Uint8Array(msg));
			if (decoded.id == id) connected = true;
			else try { socket.close(); } catch (err) { };
			resolve();
		})
	})]);
	if (!connected) return;
	console.log(`A new player with ID ${id} connected!`);

	// Create the new player and add it to the entity list.
	const player = new Player(id);
	entities.push(player);

	// Send the player the entire map


	// If the client doesn't ping for 30 seconds, we assume it is a disconnection.
	const timeout = setTimeout(() => {
		try { socket.close(); } catch (err) { }
	}, 30000);

	// The 4 directions of movement
	const movements = [false, false, false, false];
	const buttons = new Map<number, boolean>();

	socket.on("message", (msg: ArrayBuffer) => {
		const decoded = <ClientPacketResolvable>decode(new Uint8Array(msg));
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
				player.setVelocity(angleVec.unit().scaleAll(0.1));
				break;
			case "movementrelease":
				// Make the direction false
				const mvRPacket = <MovementReleasePacket>decoded;
				movements[mvRPacket.direction] = false;
				// Same as movementpress
				var angleVec = Vec2.ZERO;
				for (let ii = 0; ii < movements.length; ii++) if (movements[ii]) angleVec = angleVec.addVec(DIRECTION_VEC[ii]);
				player.setVelocity(angleVec.unit().scaleAll(0.1));
				break;
			// Very not-done. Will probably change to "attack" and "use" tracking.
			case "mousepress":
				buttons.set((<MousePressPacket>decoded).button, true);
				if (buttons.get(0)) player.tryAttacking = true;
				break;
			case "mouserelease":
				buttons.set((<MouseReleasePacket>decoded).button, false);
				if (buttons.get(0)) player.tryAttacking = false;
				break;
			case "mousemove":
				const mMvPacket = <MouseMovePacket>decoded;
				// { x, y } will be x and y offset of the client from the centre of the screen.
				player.setDirection(new Vec2(mMvPacket.x, mMvPacket.y));
				break;
		}
	});
});

setInterval(() => {
	ticksElapsed++;
	// Tick every single entity.
	entities.forEach(entity => entity.tick(entities, objects));
	// Filter players from entities and send them packets
	const players = <Player[]>entities.filter(entity => entity.type === "player");
	players.forEach(player => {
		if (player.tryAttacking && player.attack.duration <= 0) {
			const weapon = player.inventory.weapons[player.inventory.holding];
			if (weapon) {
				player.attack.name = randomSelect(weapon.attacks);
				player.attack.duration = ATTACKS[player.attack.name];
				if (!weapon.continuous) player.tryAttacking = false;
			}
		}
		sockets.get(player.id)?.send(encode(new GamePacket(entities, objects, player)).buffer)
	});
}, 1000 / TICKS_PER_SECOND);