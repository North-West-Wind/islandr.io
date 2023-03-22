import { encode, decode } from "msgpack-lite";
import { KeyBind, movementKeys, TIMEOUT } from "./constants";
import { animate, setRunning } from "./renderer";
import { initMap } from "./rendering/map";
import { addKeyPressed, addMousePressed, isKeyPressed, isMenuHidden, removeKeyPressed, removeMousePressed, toggleBigMap, toggleHud, toggleMap, toggleMenu, toggleMinimap } from "./states";
import { FullPlayer } from "./store/entities";
import { castCorrectObstacle, castMinObstacle } from "./store/obstacles";
import { castCorrectTerrain } from "./store/terrains";
import { Inventory } from "./types/entity";
import { Vec2 } from "./types/math";
import { PingPacket, MovementPressPacket, MovementReleasePacket, MouseMovePacket, MousePressPacket, MouseReleasePacket, GamePacket, MapPacket, AckPacket, InteractPacket, SwitchWeaponPacket, ReloadWeaponPacket } from "./types/packet";
import { World } from "./types/terrain";

export var world = new World();

var id: string | null;
var tps = 1; // Default should be 1, so even if no TPS detail from server, we will not be dividing by 0
var username: string | null;
var address: string | null;
var player: FullPlayer | null;

export function getId() { return id; }
export function getPlayer() { return player; }

var ws: WebSocket;
var connected = false;

async function init(address: string) {
	// Address for debugging
	ws = new WebSocket("ws://" + address);
	ws.binaryType = "arraybuffer";

	await new Promise((res, rej) => {
		const timer = setTimeout(() => {
			rej(new Error("WebSocket timeout"));
			ws.close();
		}, TIMEOUT);

		ws.onmessage = (event) => {
			const data = <AckPacket>decode(new Uint8Array(event.data));
			id = data.id;
			tps = data.tps;
			world = new World(new Vec2(data.size[0], data.size[1]), castCorrectTerrain(data.terrain));
			ws.send(encode({ username, id }).buffer);
			connected = true;
			clearTimeout(timer);
	
			// Start animating after connection established
			setRunning(true);
			animate(0);
			document.getElementById("menu")?.classList.add("hidden");
	
			const interval = setInterval(() => {
				if (connected) ws.send(encode(new PingPacket()).buffer);
				else clearInterval(interval);
			}, 1000);
	
			ws.onmessage = (event) => {
				const data = decode(new Uint8Array(event.data));
				switch (data.type) {
					case "game":
						const gamePkt = <GamePacket>data;
						world.updateEntities(gamePkt.entities);
						world.updateObstacles(gamePkt.obstacles);
						world.updateLiveCount(gamePkt.alivecount);
						if (!player) player = new FullPlayer(gamePkt.player);
						else player.copy(gamePkt.player);
						break;
					case "map":
						// This should happen once only normally
						const mapPkt = <MapPacket>data;
						world.terrains = mapPkt.terrains.map(ter => castCorrectTerrain(ter));
						initMap(mapPkt.obstacles.map(obs => castCorrectObstacle(castMinObstacle(obs))));
						//Show player count once game starts
						(document.querySelector("#playercountcontainer") as HTMLInputElement).style.display = "block";
						break;
				}
			}
		}
	
		// Reset everything when connection closes
		ws.onclose = () => {
			connected = false;
			setRunning(false);
			document.getElementById("menu")?.classList.remove("hidden");
			(document.querySelector("#playercountcontainer") as HTMLInputElement).style.display = "none";
			id = null;
			tps = 1;
			username = null;
			player = null;
			world = new World();
			res(undefined);
			//remove playercount
		}
	
		ws.onerror = (err) => {
			console.error(err);
			rej(new Error("WebSocket error"));
		};
	});
}

document.getElementById("connect")?.addEventListener("click", async () => {
	const errorText = <HTMLDivElement>document.getElementById("error-div");
	username = (<HTMLInputElement>document.getElementById("username")).value;
	address = (<HTMLInputElement>document.getElementById("address")).value;
	try {
		check(username, address);
		await init(address);
		errorText.style.display = "none";
	} catch (error: any) {
		errorText.innerHTML = error.message;
		errorText.style.display = "block";
		return;
	}
});

function check(username: string, address: string): Error | void {
	if (!username)
		throw new Error("Please provide a username.");
	else if (username.length > 50)
		throw new Error("Username too long! Try another username.");

	if (!address)
		throw new Error("Please provide an address.");
}

document.getElementById("disconnect")?.addEventListener("click", () => {
	ws.close();
	document.getElementById("settings")?.classList.add("hidden");
	toggleMenu();
});

window.onkeydown = (event) => {
	if (!connected || isKeyPressed(event.key)) return;
	event.stopPropagation();
	addKeyPressed(event.key);
	const settingsElem = document.getElementById("settings");
	if (event.key == KeyBind.MENU) {
		if (isMenuHidden()) settingsElem?.classList.remove("hidden");
		else settingsElem?.classList.add("hidden");
		toggleMenu();
	} else if (event.key == KeyBind.HIDE_HUD) toggleHud();
	else if (event.key == KeyBind.WORLD_MAP) toggleMap();
	else if (event.key == KeyBind.HIDE_MAP) toggleMinimap();
	else if (event.key == KeyBind.BIG_MAP) toggleBigMap();
	if (isMenuHidden()) {
		const index = movementKeys.indexOf(event.key);
		if (index >= 0)
			ws.send(encode(new MovementPressPacket(index)).buffer);
		else if (event.key == KeyBind.INTERACT)
			ws.send(encode(new InteractPacket()).buffer);
		else if (event.key == KeyBind.RELOAD)
			ws.send(encode(new ReloadWeaponPacket()).buffer);
		else if (!isNaN(parseInt(event.key)))
			ws.send(encode(new SwitchWeaponPacket(parseInt(event.key) + 1 - ((<Inventory>player?.inventory).holding || 0))));
	}
}

window.onkeyup = (event) => {
	if (!connected) return;
	event.stopPropagation();
	removeKeyPressed(event.key);
	const index = movementKeys.indexOf(event.key);
	if (index >= 0)
		ws.send(encode(new MovementReleasePacket(index)).buffer);
}

window.onmousemove = (event) => {
	if (!connected) return;
	event.stopPropagation();
	ws.send(encode(new MouseMovePacket(event.x - window.innerWidth / 2, event.y - window.innerHeight / 2)).buffer);
}

window.onmousedown = (event) => {
	if (!connected) return;
	event.stopPropagation();
	addMousePressed(event.button);
	ws.send(encode(new MousePressPacket(event.button)));
}

window.onmouseup = (event) => {
	if (!connected) return;
	event.stopPropagation();
	removeMousePressed(event.button);
	ws.send(encode(new MouseReleasePacket(event.button)));
}

window.onwheel = (event) => {
	if (!connected || !player) return;
	event.stopPropagation();
	const delta = event.deltaY < 0 ? -1 : 1;
	ws.send(encode(new SwitchWeaponPacket(delta)));
}
// /** @param {MouseEvent} event */
// window.oncontextmenu = (event) => {
// 	if (!connected) return;
// 	ws.send(encode(new PingPacket(event.button)))
// }