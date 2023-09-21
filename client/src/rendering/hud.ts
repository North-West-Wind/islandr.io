import { Backpack, FullPlayer, Helmet, Vest } from "../store/entities";
import { GunWeapon, WeaponType } from "../types/weapon";
import { roundRect } from "../utils";

// Calls all the HUD related functions
export function drawHud(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
	drawHealth(player, canvas, ctx);
	drawAdrenaline(player, canvas, ctx);
	drawGunAmmo(player, canvas, ctx);
	drawBackpack(player, canvas, ctx);
	drawVest(player, canvas, ctx);
	drawHelmet(player, canvas, ctx);
}

// Draws the player's health
function drawHealth(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
	//fixed height:width ratio
	const height = canvas.height / 20;
	const width = height * 10;
	const padding = Math.min(canvas.width, canvas.height) / 100;
	const innerWidth = width - padding * 2;
	const innerHeight = height - padding * 2;
	ctx.fillStyle = "#000000";
	ctx.globalAlpha = 0.2;
	roundRect(ctx, (canvas.width - width) / 2, canvas.height - height - padding, width, height, padding / 2);
	//can change these later
	if (player.health == player.maxHealth) ctx.fillStyle = "#ccc";
	else if (player.health / player.maxHealth > 0.8) ctx.fillStyle = "#ffffff";
	else if (player.health / player.maxHealth > 0.5) ctx.fillStyle = "#ffabab";
	else if (player.health / player.maxHealth > 0.25) ctx.fillStyle = "#ad5555";
	else if (player.health / player.maxHealth > 0.1) ctx.fillStyle = "#751212";
	else ctx.fillStyle = "#751212";
	ctx.globalAlpha = 1;
	if(player.health > 0){
		roundRect(ctx, (canvas.width - innerWidth) / 2, canvas.height - height, innerWidth * player.health / player.maxHealth, innerHeight, padding / 2);
	}
}

function drawAdrenaline(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
	if (!player.boost) return;
	//fixed height:width ratio
	const height = canvas.height / 80;
	const width = canvas.height / 2;
	const margin = Math.min(canvas.width, canvas.height) / 100;
	const gradient = ctx.createLinearGradient((canvas.width - width) / 2, 0, (canvas.width + width) / 2, 0);
	gradient.addColorStop(0, "#ff8d19");
	gradient.addColorStop(1, "#ff5300");
	ctx.fillStyle = gradient;
	roundRect(ctx, (canvas.width - width) / 2, canvas.height - height - margin * 2 - canvas.height / 20, width * player.boost / player.maxBoost, height, margin / 2);
}

// Draws the ammo amount inside and outside the gun
function drawGunAmmo(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
	if (player.despawn || player.inventory.getWeapon()?.type != WeaponType.GUN) return;
	const weapon = <GunWeapon>player.inventory.getWeapon();
	const size = canvas.height / 27;
	const smallSize = size / 1.5;
	ctx.font = `${size}px Arial bold`;
	ctx.textBaseline = "bottom";
	ctx.textAlign = "center";
	const yOffset = canvas.height / 20 + Math.min(canvas.width, canvas.height) / 50 + canvas.height / 80 + Math.min(canvas.width, canvas.height) / 100;
	const padding = Math.min(canvas.width, canvas.height) / 200;
	const width = canvas.width / 20;
	ctx.fillStyle = "#000";
	ctx.globalAlpha = 0.6;
	roundRect(ctx, (canvas.width - width) / 2, canvas.height - yOffset - padding * 2 - size, width, size + padding * 2, canvas.height / 108);
	roundRect(ctx, (canvas.width - width) / 2 + width + padding, canvas.height - yOffset - padding * 2 - smallSize, width, smallSize + padding * 2, canvas.height / 108);
	if (!weapon.magazine) ctx.fillStyle = "#ff0000";
	else ctx.fillStyle = "#fff";
	ctx.globalAlpha = 1;
	ctx.fillText(`${weapon.magazine}`, canvas.width / 2, canvas.height - yOffset - padding);
	ctx.font = `${smallSize}px Arial bold`;
	const ammos = player.inventory.ammos[weapon.color];
	if (!ammos) ctx.fillStyle = "#ff0000";
	else ctx.fillStyle = "#fff";
	ctx.fillText(`${ammos}`, (canvas.width - width) / 2 + width * 1.5 + padding, canvas.height - yOffset - padding);
}

function drawBackpack(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
	if (player.inventory.backpackLevel == 0) return;
	const size = canvas.height / 20;
	const healthWidth = size * 10;
	const padding = Math.min(canvas.width, canvas.height) / 100;
	ctx.fillStyle = "#000000";
	ctx.globalAlpha = 0.2;
	roundRect(ctx, (canvas.width + healthWidth) / 2 + padding, canvas.height - size - padding, size, size, padding / 2);
	ctx.globalAlpha = 1;
	const img = Backpack.backpackImages[player.inventory.backpackLevel - 1];
	if (img?.complete) ctx.drawImage(img, (canvas.width + healthWidth) / 2 + padding * 2, canvas.height - size, size - padding * 2, size - padding * 2);

	ctx.fillStyle = "#fff";
	ctx.font = `${canvas.height / 54}px Arial`;
	ctx.textBaseline = "bottom";
	ctx.textAlign = "center";
	ctx.fillText(`Lv. ${player.inventory.backpackLevel}`, (canvas.width + healthWidth) / 2 + padding + size / 2, canvas.height - size - padding * 2);
}

function drawVest(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
	if (player.inventory.vestLevel == 0) return;
	const size = canvas.height / 20;
	const healthWidth = size * 10;
	const padding = Math.min(canvas.width, canvas.height) / 100;
	ctx.fillStyle = "#000000";
	ctx.globalAlpha = 0.2;
	roundRect(ctx, (canvas.width + healthWidth) / 2 + padding * 2 + size, canvas.height - size - padding, size, size, padding / 2);
	ctx.globalAlpha = 1;
	const img = Vest.vestImages[player.inventory.vestLevel - 1];
	if (img?.complete) ctx.drawImage(img, (canvas.width + healthWidth) / 2 + padding * 3 + size, canvas.height - size, size - padding * 2, size - padding * 2);

	ctx.fillStyle = "#fff";
	ctx.font = `${canvas.height / 54}px Arial`;
	ctx.textBaseline = "bottom";
	ctx.textAlign = "center";
	ctx.fillText(`Lv. ${player.inventory.vestLevel}`, (canvas.width + healthWidth) / 2 + padding * 2 + size * 3 / 2, canvas.height - size - padding * 2);
}

function drawHelmet(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
	if (player.inventory.helmetLevel == 0) return;
	const size = canvas.height / 20;
	const healthWidth = size * 10;
	const padding = Math.min(canvas.width, canvas.height) / 100;
	ctx.fillStyle = "#000000";
	ctx.globalAlpha = 0.2;
	roundRect(ctx, (canvas.width + healthWidth) / 2 + padding * 3 + size * 2, canvas.height - size - padding, size, size, padding / 2);
	ctx.globalAlpha = 1;
	const img = Helmet.helmetImages[player.inventory.helmetLevel- 1];
	if (img?.complete) ctx.drawImage(img, (canvas.width + healthWidth) / 2 + padding * 4 + size * 2, canvas.height - size, size - padding * 2, size - padding * 2);

	ctx.fillStyle = "#fff";
	ctx.font = `${canvas.height / 54}px Arial`;
	ctx.textBaseline = "bottom";
	ctx.textAlign = "center";
	ctx.fillText(`Lv. ${player.inventory.helmetLevel}`, (canvas.width + healthWidth) / 2 + padding * 3 + size * 5 / 2, canvas.height - size - padding * 2);
}