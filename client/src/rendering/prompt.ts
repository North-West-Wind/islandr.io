import { KeyBind } from "../constants";
import { roundRect } from "../utils";

export function drawPrompt(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
	drawInteract(canvas, ctx, scale);
}

function drawInteract(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
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
	ctx.fillText("[F] Interact", canvas.width / 2, canvas.height / 2 + padding + yOffset);
}