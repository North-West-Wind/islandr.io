import * as ws from "ws";
import { encode, decode } from "msgpack-lite";
import { ID, wait } from "./utils";
import { ClientPacketResolvable, MousePressPacket, MouseReleasePacket, MouseMovePacket, MovementPressPacket, MovementReleasePacket, GamePacket, ParticlesPacket, MapPacket, AckPacket } from "./types/packet";
import { DIRECTION_VEC, MAP_SIZE, TICKS_PER_SECOND } from "./constants";
import { Vec2 } from "./types/math";
import { Player } from "./store/entities";
import { Particle } from "./types/particle";
import { World } from "./types/terrain";
import { Plain, Pond, River, Sea } from "./store/terrains";
import { Tree, Bush, Crate, Stone, MosinTree, SovietCrate } from "./store/obstacles";

export var ticksElapsed = 0;

const server = new ws.Server({ port: 80 });
server.once("listening", () => console.log(`WebSocket Server listening at port ${server.options.port}`));

const sockets = new Map<string, ws.WebSocket>();

// Initialize the map
export const world = new World(new Vec2(MAP_SIZE[0], MAP_SIZE[1]), new Plain());

// Start of testing section

// Let's add some ponds
for (let ii = 0; ii < 5; ii++) world.terrains.push(new Pond());
// And a river
world.terrains.push(new River());
// And the sea ring
for (let ii = 0; ii < 4; ii++) world.terrains.push(new Sea(ii));

// Add random obstacles
for (let ii = 0; ii < 46; ii++) world.obstacles.push(new Tree());
for (let ii = 0; ii < 16; ii++) world.obstacles.push(new MosinTree());
for (let ii = 0; ii < 16; ii++) world.obstacles.push(new SovietCrate());
for (let ii = 0; ii < 50; ii++) world.obstacles.push(new Bush());
for (let ii = 0; ii < 50; ii++) world.obstacles.push(new Crate());
for (let ii = 0; ii < 50; ii++) world.obstacles.push(new Stone());

// End of testing section

server.on("connection", async socket => {
	console.log("Received a connection request");
	// Set the type for msgpack later.
	socket.binaryType = "arraybuffer";

	// Add socket to map with a generated ID.
	const id = ID();
	sockets.set(id, socket);

	// Setup the close connection listener. Socket will be deleted from map.
	var connected = false;
	socket.on("close", () => {
		console.log("Connection closed");
		sockets.delete(id);
		connected = false;
	});

	var username = "";
	// Communicate with the client by sending the ID and map size. The client should respond with ID and username, or else close the connection.
	await Promise.race([wait(10000), new Promise<void>(resolve => {
		socket.send(encode(new AckPacket(id, world.size, world.defaultTerrain)).buffer);
		socket.once("message", (msg: ArrayBuffer) => {
			const decoded = decode(new Uint8Array(msg));
			if (decoded.id == id && decoded.username) {
				connected = true;
				username = decoded.username;
			} else try { socket.close(); } catch (err) { }
			resolve();
		})
	})]);
	if (!connected) return;
	console.log(`A new player with ID ${id} connected!`);

	// Create the new player and add it to the entity list.
	const player = new Player(id, username);
	world.entities.push(player);

	// Send the player the entire map
	socket.send(encode(new MapPacket(world.obstacles, world.terrains)).buffer);

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
			case "interact":
				player.tryInteracting = true;
		}
	});
});

var pendingParticles: Particle[] = [];
export function addParticles(...particles: Particle[]) {
	pendingParticles.push(...particles);
}

setInterval(() => {
	world.tick();
	// Filter players from entities and send them packets
	const players = <Player[]>world.entities.filter(entity => entity.type === "player");
	players.forEach(player => {
		const socket = sockets.get(player.id);
		if (!socket) return;
		socket.send(encode(new GamePacket(world.entities, world.obstacles, player)).buffer);
		if (pendingParticles.length) socket.send(encode(new ParticlesPacket(pendingParticles, player)).buffer);
	});
	pendingParticles = [];
}, 1000 / TICKS_PER_SECOND);
