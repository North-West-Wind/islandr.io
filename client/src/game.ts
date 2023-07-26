import { Howl, Howler } from "howler";
import { KeyBind, movementKeys, TIMEOUT } from "./constants";
import { start, stop } from "./renderer";
import { initMap } from "./rendering/map";
import { addKeyPressed, addMousePressed, isKeyPressed, isMenuHidden, isMouseDisabled, removeKeyPressed, removeMousePressed, toggleBigMap, toggleHud, toggleMap, toggleMenu, toggleMinimap, toggleMouseDisabled } from "./states";
import { FullPlayer, Healing } from "./store/entities";
import { castCorrectObstacle, castMinObstacle } from "./store/obstacles";
import { castCorrectTerrain } from "./store/terrains";
import { Vec2 } from "./types/math";
import { PingPacket, MovementPressPacket, MovementReleasePacket, MouseMovePacket, MousePressPacket, MouseReleasePacket, GamePacket, MapPacket, AckPacket, InteractPacket, SwitchWeaponPacket, ReloadWeaponPacket, UseHealingPacket, ResponsePacket, SoundPacket } from "./types/packet";
import { World } from "./types/world";
import { receive, send } from "./utils";
import Building from "./types/building";

//handle users that tried to go to old domain name, or direct ip
var urlargs = new URLSearchParams(window.location.search);
if(urlargs.get("from")){
	alert("We have moved from " + urlargs.get("from") + " to islandr.io!")
}

export var world: World;

var id: string | null;
var tps = 1; // Default should be 1, so even if no TPS detail from server, we will not be dividing by 0
var username: string | null;
var address: string | null;
var skin: string | null = localStorage.getItem("playerSkin");
if (!localStorage.getItem("playerDeathImg")) localStorage.setItem("playerDeathImg", "default")

var deathImg: string | null = localStorage.getItem("playerDeathImg");

console.log(skin)
console.log(deathImg)
var player: FullPlayer | null;

export function getId() { return id; }
export function getPlayer() { return player; }
export function getTPS() { return tps; }

var ws: WebSocket;
var connected = false;

async function init(address: string) {
	// Initialize the websocket
	var protocol = "ws";
	// if ((<HTMLInputElement>document.getElementById("wss")).checked) protocol += "s";
	ws = new WebSocket(`${protocol}://${address}`);
	ws.binaryType = "arraybuffer";

	await new Promise((res, rej) => {
		const timer = setTimeout(() => {
			rej(new Error("Failed finding game"));
			ws.close();
		}, TIMEOUT);

		ws.onmessage = async (event) => {
			const data = <AckPacket>receive(event.data);
			id = data.id;
			tps = data.tps;
			world = new World(new Vec2(data.size[0], data.size[1]), castCorrectTerrain(data.terrain));
	
			// Call renderer start to setup
			await start();
			var currentCursor = localStorage.getItem("selectedCursor")
			if (!currentCursor){localStorage.setItem("selectedCursor", "default"); currentCursor = localStorage.getItem("selectedCursor")}
			if (currentCursor) {document.documentElement.style.cursor = currentCursor}
			console.log("from game.ts client skin! > " + skin! + " and death img > " + deathImg!)
			send(ws, new ResponsePacket(id, username!, skin!, deathImg!));
			connected = true;
			clearTimeout(timer);
			
			// Setup healing items click events
			for (const element of document.getElementsByClassName("healing-panel")) {
				const el = <HTMLElement> element;
				console.log("Adding events for", el.id);
				const ii = parseInt(<string>el.id.split("-").pop());
				el.onmouseenter = el.onmouseleave = () => toggleMouseDisabled();
				el.onclick = () => {
					if (!el.classList.contains("enabled")) return;
					send(ws, new UseHealingPacket(Healing.mapping[ii]));
				}
			}
	
			const interval = setInterval(() => {
				if (connected) send(ws, new PingPacket());
				else clearInterval(interval);
			}, 1000);
	
			ws.onmessage = (event) => {
				const data = receive(event.data);
				switch (data.type) {
					case "game": {
						const gamePkt = <GamePacket>data;
						world.updateEntities(gamePkt.entities, gamePkt.discardEntities);
						world.updateObstacles(gamePkt.obstacles, gamePkt.discardObstacles);
						world.updateLiveCount(gamePkt.alivecount);
						if (gamePkt.safeZone) world.updateSafeZone(gamePkt.safeZone);
						if (gamePkt.nextSafeZone) world.updateNextSafeZone(gamePkt.nextSafeZone);
						if (!player) player = new FullPlayer(gamePkt.player);
						else player.copy(gamePkt.player);
						break;
					}
					case "map": {
						// This should happen once only normally
						const mapPkt = <MapPacket>data;
						world.terrains = mapPkt.terrains.map(ter => castCorrectTerrain(ter));
						world.obstacles = mapPkt.obstacles.map(obs => castCorrectObstacle(castMinObstacle(obs)));
						world.buildings = mapPkt.buildings.map(bui => new Building(bui));
						initMap();
						//Show player count once game starts
						(document.querySelector("#playercountcontainer") as HTMLInputElement).style.display = "block";
						break;
					}
					case "sound": {
						if (!player) break;
						const soundPkt = <SoundPacket>data;
						const howl = new Howl({
							src: `assets/sounds/${soundPkt.path}`
						});
						const pos = Vec2.fromMinVec2(soundPkt.position);
						const relative = pos.addVec(player.position.inverse()).scaleAll(1/60);
						howl.pos(relative.x, relative.y);
						const id = howl.play();
						world.sounds.set(id, { howl, pos });
						howl.on("end", () => world.sounds.delete(id));
						break;
					}
				}
			}
		}
	
		// Reset everything when connection closes
		ws.onclose = () => {
			connected = false;
			stop();
			Howler.stop();
			id = null;
			tps = 1;
			username = null;
			player = null;
			res(undefined);
			//remove playercount
		}
	
		ws.onerror = (err) => {
			console.error(err);
			rej(new Error("Failed joining game"));
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
			send(ws, new MovementPressPacket(index));
		else if (event.key == KeyBind.INTERACT)
			send(ws, new InteractPacket());
		else if (event.key == KeyBind.RELOAD)
			send(ws, new ReloadWeaponPacket());
		else if (!isNaN(parseInt(event.key)))
			send(ws, new SwitchWeaponPacket(parseInt(event.key) - 1, true));
	}
}

window.onkeyup = (event) => {
	if (!connected) return;
	event.stopPropagation();
	removeKeyPressed(event.key);
	const index = movementKeys.indexOf(event.key);
	if (index >= 0)
		send(ws, new MovementReleasePacket(index));
}

window.onmousemove = (event) => {
	if (!connected) return;
	event.stopPropagation();
	send(ws, new MouseMovePacket(event.x - window.innerWidth / 2, event.y - window.innerHeight / 2));
}

window.onmousedown = (event) => {
	if (!connected || isMouseDisabled()) return;
	event.stopPropagation();
	addMousePressed(event.button);
	send(ws, new MousePressPacket(event.button));
}

window.onmouseup = (event) => {
	if (!connected) return;
	event.stopPropagation();
	removeMousePressed(event.button);
	send(ws, new MouseReleasePacket(event.button));
}

window.onwheel = (event) => {
	if (!connected || !player) return;
	event.stopPropagation();
	const delta = event.deltaY < 0 ? -1 : 1;
	send(ws, new SwitchWeaponPacket(delta));
}

window.oncontextmenu = (event) => {
	if (connected) event.preventDefault();
}

window.ondblclick = (event) => {
	if (connected) event.preventDefault();
}

// Because 4 is grenade and it's not done yet
for (let ii = 0; ii < 3; ii++) {
	const panel = <HTMLElement> document.getElementById("weapon-panel-" + ii);
	panel.onmouseenter = panel.onmouseleave = () => toggleMouseDisabled();
	panel.onclick = () => {
		if (!connected || !player) return;
		send(ws, new SwitchWeaponPacket(ii, true));
	}
}