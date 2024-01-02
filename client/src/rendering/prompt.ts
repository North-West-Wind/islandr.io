import { KeyBind, LANG } from "../constants";
import { getTPS } from "../game";
import { translate } from "../languages";
import { FullPlayer } from "../store/entities";
import { CommonAngles } from "../types/math";
import { circleFromCenter, roundRect, strokeArc } from "../utils";

/**
 * Calls all the prompt drawing functions
 * @param player Client player
 * @param ctx Rendering Context of the client HTML canvas
 */
export function drawPrompt(player: FullPlayer, ctx: CanvasRenderingContext2D) {
	drawInteract(player, ctx);
	drawReloading(player, ctx);
	drawHealing(player, ctx);
}

/**
 * Draws the interact prompt
 * @param player Client player
 * @param ctx Rendering Context of the client HTML canvas
 */
function drawInteract(player: FullPlayer, ctx: CanvasRenderingContext2D) {
	const canvas = ctx.canvas;
	// don't draw if we cannot interact with anything
	if (player.despawn || !player.canInteract) return;
	// measures the needed width of the rectangle
	const size = canvas.height / 36;
	ctx.font = `${size}px Jura bold`;
	ctx.textBaseline = "top";
	ctx.textAlign = "center";
	const metric = ctx.measureText(`[${KeyBind.INTERACT.toUpperCase()}] Pick up ${player.interactMessage}`);
	const yOffset = canvas.height / 24;
	const padding = canvas.height / 72;
	const width = metric.width + padding * 2;
	// draws the background rectangle
	ctx.fillStyle = "#000";
	ctx.globalAlpha = 0.5;
	roundRect(ctx, (canvas.width - width) / 2, canvas.height / 2 + yOffset, width, size + 2 * padding, canvas.height / 108);
	// draws the message on top
	ctx.fillStyle = "#fff";
	ctx.globalAlpha = 1;
	const split = player.interactMessage?.split(" ");
	if (split)
		ctx.fillText(translate(LANG, split.shift()!, KeyBind.INTERACT.toUpperCase(), split ? translate(LANG, split.shift()!, ...split) : ""), canvas.width / 2, canvas.height / 2 + padding + yOffset);
}

/**
 * Draws the reloading indicator
 * @param player Client player
 * @param ctx Rendering Context of the client HTML canvas
 */
function drawReloading(player: FullPlayer, ctx: CanvasRenderingContext2D) {
	// don't draw if not reloading
	if (!player.reloadTicks) return;
	drawCircleLoading(player.reloadTicks, player.maxReloadTicks, translate(LANG, "prompt.reload"), ctx);
}

/**
 * Draws the healing indicator
 * @param player Client player
 * @param ctx Rendering Context of the client HTML canvas
 */
function drawHealing(player: FullPlayer, ctx: CanvasRenderingContext2D) {
	// don't draw if not healing
	if (!player.healTicks) return;
	drawCircleLoading(player.healTicks, player.maxHealTicks, translate(LANG, "prompt.heal", translate(LANG, player.currentHealItem)), ctx);
}

/**
 * Generic circle loading indicator drawer
 * @param remain Seconds remaining until it's done
 * @param max Maximum seconds for the full circle
 * @param message Message to show while indicator is active
 * @param ctx Rendering Context of the client HTML canvas
 */
function drawCircleLoading(remain: number, max: number, message: string, ctx: CanvasRenderingContext2D) {
	const canvas = ctx.canvas;
	const size = canvas.height / 36;
	ctx.font = `${size}px Jura bold`;
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	const yOffset = canvas.height / 24 + size * 2;
	// Draws the circle
	ctx.fillStyle = "#000";
	ctx.globalAlpha = 0.5;
	circleFromCenter(ctx, canvas.width / 2, canvas.height / 2 - yOffset, size * 2, true, false);
	// Draws the progress of the circle
	ctx.strokeStyle = "#fff";
	ctx.globalAlpha = 1;
	ctx.lineWidth = size / 4;
	strokeArc(ctx, canvas.width / 2, canvas.height / 2 - yOffset, size * 2 - ctx.lineWidth / 2, -CommonAngles.PI_TWO, -CommonAngles.PI_TWO + CommonAngles.TWO_PI * (max - remain) / max);
	// Draws the remaining time
	ctx.fillStyle = "#fff";
	ctx.fillText((remain / getTPS()).toFixed(2) + "s", canvas.width / 2, canvas.height / 2 - yOffset);
	// Draws the message background
	const padding = size / 4;
	const metric = ctx.measureText(message);
	const width = metric.width + padding * 2;
	ctx.fillStyle = "#000";
	ctx.globalAlpha = 0.5;
	roundRect(ctx, (canvas.width - width) / 2, canvas.height / 2 - yOffset * 2 - padding, width, size + 2 * padding, canvas.height / 108);
	// Draws the message
	ctx.globalAlpha = 1;
	ctx.textBaseline = "bottom";
	ctx.fillStyle = "#fff";
	ctx.fillText(message, canvas.width / 2, canvas.height / 2 - yOffset * 2 + size);
}