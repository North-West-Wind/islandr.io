import { FullPlayer } from "../store/entities";
import { Inventory } from "../types/entity";
import { GunWeapon, WeaponType } from "../types/weapon";
import { roundRect } from "../utils";

// Calls all the HUD related functions
export function drawHud(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
	drawHealth(player, canvas, ctx);
	drawGunAmmo(player, canvas, ctx);
	drawInventory(player, canvas, ctx);
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

// Draws the player's inventory (temporary)
function drawInventory(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
	ctx.fillStyle = "#fff";
	ctx.font = `${canvas.height / 27}px Arial`;
	ctx.textBaseline = "bottom";
	ctx.textAlign = "end";
	const inventory = <Inventory>player.inventory;
	var str = "";
	for (let ii = 0; ii < inventory.weapons.length; ii++) {
		if (!inventory.weapons[ii]) continue;
		if (ii != 0) str += " ";
		if (ii == inventory.holding) str += `[${inventory.weapons[ii].name}]`;
		else str += inventory.weapons[ii].name;
	}
	ctx.fillText(str, canvas.width * 191/192, canvas.height - canvas.width / 192);
}

// Draws the ammo amount inside and outside the gun
function drawGunAmmo(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
	if (player.inventory.getWeapon()?.type != WeaponType.GUN) return;
	const weapon = <GunWeapon>player.inventory.getWeapon();
	const size = canvas.height / 27;
	const smallSize = size / 1.5;
	ctx.font = `${size}px Arial bold`;
	ctx.textBaseline = "bottom";
	ctx.textAlign = "center";
	const yOffset = canvas.height / 20 + Math.min(canvas.width, canvas.height) / 50;
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