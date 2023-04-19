import { CommonAngle, KeyBind } from "../constants";
import { getTPS } from "../game";
import { FullPlayer } from "../store/entities";
import { circleFromCenter, roundRect, strokeArc } from "../utils";

export function drawPrompt(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
	drawInteract(player, canvas, ctx, scale);
	drawReloading(player, canvas, ctx, scale);
}

function drawInteract(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
	if (!player.canInteract) return;
	const size = canvas.height / 27;
	ctx.font = `${size}px Arial bold`;
	ctx.textBaseline = "top";
	ctx.textAlign = "center";
	const metric = ctx.measureText(`[${KeyBind.INTERACT.toUpperCase()}] Interact`);
	const yOffset = 1.5 * scale;
	const padding = 0.25 * scale;
	const width = metric.width + padding * 2;
	ctx.fillStyle = "#000";
	ctx.globalAlpha = 0.6;
	roundRect(ctx, (canvas.width - width) / 2, canvas.height / 2 + yOffset, width, size + 2 * padding, canvas.height / 108);
	ctx.fillStyle = "#fff";
	ctx.globalAlpha = 1;
	ctx.fillText(`[${KeyBind.INTERACT.toUpperCase()}] Interact`, canvas.width / 2, canvas.height / 2 + padding + yOffset);
}

function drawReloading(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
	if (!player.reloadTicks) return;
	const size = canvas.height / 27;
	ctx.font = `${size}px Arial bold`;
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	const yOffset = 6 * scale;
	ctx.fillStyle = "#000";
	ctx.globalAlpha = 0.6;
	circleFromCenter(ctx, canvas.width / 2, canvas.height / 2 - yOffset, size * 2, true, false);
	ctx.strokeStyle = "#fff";
	ctx.globalAlpha = 1;
	ctx.lineWidth = size / 4;
	strokeArc(ctx, canvas.width / 2, canvas.height / 2 - yOffset, size * 2 - ctx.lineWidth / 2, -CommonAngle.PI_TWO, -CommonAngle.PI_TWO + CommonAngle.TWO_PI * (player.maxReloadTicks - player.reloadTicks) / player.maxReloadTicks);
	ctx.fillStyle = "#fff";
	ctx.fillText((player.reloadTicks / getTPS()).toFixed(2), canvas.width / 2, canvas.height / 2 - yOffset);
}