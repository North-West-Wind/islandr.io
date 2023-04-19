import { GRID_INTERVAL } from "./constants";
import { getPlayer, world } from "./game";
import { drawHud } from "./rendering/hud";
import { drawMap, drawMinimap } from "./rendering/map";
import { isHudHidden, isMapHidden, isMapOpened } from "./states";
import { Entity } from "./types/entity";
import { Obstacle } from "./types/obstacle";
import { RenderableLayerN1 } from "./types/extenstions";
import { Terrain } from "./types/terrain";
import { lineBetween } from "./utils";
import { drawPrompt } from "./rendering/prompt";
import { cookieExists, setCookie } from "cookies-utils";

if (!cookieExists("gave_me_cookies")) {
	const button = document.getElementById("cookies-button")!;
	button.scrollIntoView();
	button.onclick = () => {
		setCookie({ name: "gave_me_cookies", value: "1" });
		button.classList.add("disabled");
		document.getElementById("cookies-span")!.innerHTML = "You gave me cookies :D";
	}
} else {
	document.getElementById("cookies-button")!.classList.add("disabled");
	document.getElementById("cookies-span")!.innerHTML = "You gave me cookies :D";
}

const canvas = <HTMLCanvasElement> document.getElementById("game");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.onresize = () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};

var running = false;
var lastTime: number;

const ctx = <CanvasRenderingContext2D> canvas.getContext("2d");
function animate(currentTime: number) {
	if (!lastTime) lastTime = currentTime;
	const elapsed = currentTime - lastTime;
	lastTime = currentTime;
	// Don't panic when drawing error
	try {
		// Fill canvas with default terrain color
		ctx.fillStyle = world.defaultTerrain.colorToHex();
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		const player = getPlayer();
		if (player) {
			// Client side ticking
			world.clientTick(player);

			// 1 unit to x pixels
			const scale = Math.max(canvas.width, canvas.height) / (20 + 20 * player.scope);
			const size = world.size;
			const x = canvas.width / 2 - player.position.x * scale;
			const y = canvas.height / 2 - player.position.y * scale;
			const width = size.x * scale;
			const height = size.y * scale;

			// Draw terrains
			// Do negative layer first
			(<(Terrain & RenderableLayerN1)[]> world.terrains.filter((terrain: any) => !!terrain["renderLayerN1"])).forEach(terrain => terrain.renderLayerN1(player, canvas, ctx, scale));
			// Do layer zero
			world.terrains.forEach(terrain => terrain.render(player, canvas, ctx, scale));

			// Draw grid lines
			ctx.strokeStyle = "#000";
			ctx.lineWidth = 2;
			ctx.globalAlpha = 0.2;
			for (let ii = 0; ii <= size.x; ii += GRID_INTERVAL) lineBetween(ctx, canvas.width / 2 - (player.position.x - ii) * scale, Math.max(y, 0), canvas.width / 2 - (player.position.x - ii) * scale, Math.min(y + height, canvas.height));
			for (let ii = 0; ii <= size.y; ii += GRID_INTERVAL) lineBetween(ctx, Math.max(x, 0), canvas.height / 2 - (player.position.y - ii) * scale, Math.min(x + width, canvas.width), canvas.height / 2 - (player.position.y - ii) * scale);
			ctx.globalAlpha = 1;
			
			// Draw obstacles and entities
			var combined: (Entity | Obstacle)[] = [];
			combined = combined.concat(world.entities, world.obstacles);
			combined.push(player);
			// Sort them by zIndex. Higher = Above
			combined = combined.sort((a, b) => a.zIndex - b.zIndex);
			// Do negative layer first
			(<((Entity | Obstacle) & RenderableLayerN1)[]> combined.filter((entOrObs: any) => !!entOrObs["renderLayerN1"])).forEach(entOrObs => entOrObs.renderLayerN1(player, canvas, ctx, scale));
			// Do layer zero
			combined.forEach(thing => {
				thing.render(player, canvas, ctx, scale);
				thing.renderTick(elapsed);
			});

			// Fill areas outside the border
			ctx.fillStyle = world.defaultTerrain.colorToHex();
			// The corners: top-left, top-right, bottom-left, bottom-right
			ctx.fillRect(0, 0, canvas.width / 2 - player.position.x * scale, canvas.height / 2 - player.position.y * scale);
			ctx.fillRect(canvas.width, 0, (world.size.x - player.position.x) * scale - canvas.width / 2, canvas.height / 2 - player.position.y * scale);
			ctx.fillRect(0, canvas.height, canvas.width / 2 - player.position.x * scale, (world.size.y - player.position.y) * scale - canvas.height / 2);
			ctx.fillRect(canvas.width, canvas.height, (world.size.x - player.position.x) * scale - canvas.width / 2, (world.size.y - player.position.y) * scale - canvas.height / 2);
			// The sides: top, bottom, left, right
			ctx.fillRect(canvas.width / 2 - player.position.x * scale, 0, world.size.x * scale, canvas.height / 2 - player.position.y * scale);
			ctx.fillRect(canvas.width / 2 - player.position.x * scale, canvas.height, world.size.x * scale, (world.size.y - player.position.y) * scale - canvas.height / 2);
			ctx.fillRect(0, canvas.height / 2 - player.position.y * scale, canvas.width / 2 - player.position.x * scale, world.size.y * scale);
			ctx.fillRect(canvas.width, canvas.height / 2 - player.position.y * scale, (world.size.x - player.position.x) * scale - canvas.width / 2, world.size.y * scale);

			// Draw world border
			ctx.strokeStyle = "#000000";
			ctx.lineWidth = scale / 4;
			ctx.strokeRect(x, y, width, height);
	
			// Draw overlays
			if (!isHudHidden()) drawHud(player, canvas, ctx);
			if (isMapOpened()) drawMap(canvas, ctx);
			else if (!isMapHidden()) drawMinimap(player, canvas, ctx);
			drawPrompt(player, canvas, ctx, scale);
		}
	} catch (err) { console.error(err); }

	if (running) requestAnimationFrame(animate);
}

export function start() {
	running = true;
	document.getElementById("menu")?.classList.add("hidden");
	document.getElementById("hud")?.classList.remove("hidden");
	animate(0);
}

export function stop() {
	running = false;
	document.getElementById("menu")?.classList.remove("hidden");
	document.getElementById("hud")?.classList.add("hidden");
	for (let ii = 0; ii < 4; ii++) {
		const nameEle = document.getElementById("weapon-name-" + ii);
		const imageEle = document.getElementById("weapon-image-" + ii);
		if (nameEle) nameEle.innerHTML = "";
		if (imageEle) (<HTMLImageElement>imageEle).src = "";
	}
}