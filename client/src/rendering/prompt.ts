import { CommonAngle, KeyBind } from "../constants";
import { getTPS } from "../game";
import { FullPlayer } from "../store/entities";
import { circleFromCenter, roundRect, strokeArc } from "../utils";

export function drawPrompt(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
	drawInteract(player, canvas, ctx);
	drawReloading(player, canvas, ctx);
	drawHealing(player, canvas, ctx);
}

function drawInteract(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
	if (player.despawn || !player.canInteract) return;
	const size = canvas.height / 36;
	ctx.font = `${size}px Arial bold`;
	ctx.textBaseline = "top";
	ctx.textAlign = "center";
	const metric = ctx.measureText(`[${KeyBind.INTERACT.toUpperCase()}] Pick up ${player.onTopOfLoot}`);
	const yOffset = canvas.height / 24;
	const padding = canvas.height / 72;
	const width = metric.width + padding * 2;
	ctx.fillStyle = "#000";
	ctx.globalAlpha = 0.5;
	roundRect(ctx, (canvas.width - width) / 2, canvas.height / 2 + yOffset, width, size + 2 * padding, canvas.height / 108);
	ctx.fillStyle = "#fff";
	ctx.globalAlpha = 1;
	ctx.fillText(`[${KeyBind.INTERACT.toUpperCase()}] Pick up ${player.onTopOfLoot}`, canvas.width / 2, canvas.height / 2 + padding + yOffset);
}

function drawReloading(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
	if (!player.reloadTicks) return;
	drawCircleLoading(player.reloadTicks, player.maxReloadTicks, "Reloading", canvas, ctx);
}

function drawHealing(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
	if (!player.healTicks) return;
	drawCircleLoading(player.healTicks, player.maxHealTicks, "Using " + player.onTopOfLoot, canvas, ctx);
}

function drawCircleLoading(remain: number, max: number, message: string, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
	const size = canvas.height / 36;
	ctx.font = `${size}px Arial bold`;
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	const yOffset = canvas.height / 24 + size * 2;
	ctx.fillStyle = "#000";
	ctx.globalAlpha = 0.5;
	circleFromCenter(ctx, canvas.width / 2, canvas.height / 2 - yOffset, size * 2, true, false);
	ctx.strokeStyle = "#fff";
	ctx.globalAlpha = 1;
	ctx.lineWidth = size / 4;
	strokeArc(ctx, canvas.width / 2, canvas.height / 2 - yOffset, size * 2 - ctx.lineWidth / 2, -CommonAngle.PI_TWO, -CommonAngle.PI_TWO + CommonAngle.TWO_PI * (max - remain) / max);
	ctx.fillStyle = "#fff";
	ctx.fillText((remain / getTPS()).toFixed(2) + "s", canvas.width / 2, canvas.height / 2 - yOffset);
	
	const padding = size / 4;
	const metric = ctx.measureText(message);
	const width = metric.width + padding * 2;
	ctx.fillStyle = "#000";
	ctx.globalAlpha = 0.5;
	roundRect(ctx, (canvas.width - width) / 2, canvas.height / 2 - yOffset * 2 - padding, width, size + 2 * padding, canvas.height / 108);

	ctx.globalAlpha = 1;
	ctx.textBaseline = "bottom";
	ctx.fillStyle = "#fff";
	ctx.fillText(message, canvas.width / 2, canvas.height / 2 - yOffset * 2 + size);
}