import { CommonAngle } from "./constants";

// Promisified setTimeout
export function wait(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Maths
// Capping value with limits
export function clamp(val: number, min: number, max: number) {
	if (val < min) return min;
	if (val > max) return max;
	return val;
}
// Converts radian to degrees
export function toDegrees(radian: number) {
	return radian * 180 / Math.PI;
}

// Colors
// Converting number to RGBA
export function numToRGBA(num: number) {
	const a = num % 256;
	const b = (num >>> 8) % 256;
	const g = (num >>> 16) % 256;
	const r = (num >>> 24) % 256;
	return `#${twoDigits(r.toString(16))}${twoDigits(g.toString(16))}${twoDigits(b.toString(16))}${twoDigits(a.toString(16))}`;
}

// Strings
// Make numbers 2 digits
export function twoDigits(num: number | string) {
	if (typeof num === "string") {
		const str = <string> num;
		if (str.length <= 1) return Array(2 - str.length).fill("0").join("") + str;
		else return str;
	} else {
		if (num < 10) return `0${num}`;
		else return num.toString();
	}
}

// Networking
import { encode, decode } from "msgpack-lite";
import { deflate, inflate } from "pako";
import { ServerPacketResolvable, IPacket } from "./types/packet";
// Send packet
export function send(socket: WebSocket, packet: IPacket) {
  //socket.send(deflate(deflate(encode(packet).buffer)));
	socket.send(deflate(encode(packet).buffer));
}
// Receive packet
export function receive(msg: ArrayBuffer) {
  //return <ServerPacketResolvable>decode(inflate(inflate(new Uint8Array(msg))));
	return <ServerPacketResolvable>decode(inflate(new Uint8Array(msg)));
}

// Rendering
// Draws circle with x, y center
export function circleFromCenter(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, fill = true, stroke = false) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, CommonAngle.TWO_PI, false);
	ctx.closePath();
	if (fill) ctx.fill();
	if (stroke) ctx.stroke();
}
export function strokeArc(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, start = 0, end = CommonAngle.TWO_PI, counter = false) {
	ctx.beginPath();
	ctx.arc(x, y, radius, start, end, counter);
	ctx.stroke();
	ctx.closePath();
}
// Strokes a line between (x1, y1) and (x2, y2)
export function lineBetween(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, stroke = true) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.closePath();
	if (stroke) ctx.stroke();
}
// Draws a rounded rectangle
export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number | { tl?: number, tr?: number, br?: number, bl?: number }, fill = true, stroke = false) {
	if (typeof radius === 'undefined') {
		radius = 5;
	}
	var tl, tr, bl, br;
	if (typeof radius === 'number') tl = tr = bl = br = radius;
	else {
		tl = radius.tl || 0;
		tr = radius.tr || 0;
		br = radius.br || 0;
		bl = radius.bl || 0;
	}
	ctx.beginPath();
	ctx.moveTo(x + tl, y);
	ctx.lineTo(x + width - tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
	ctx.lineTo(x + width, y + height - br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
	ctx.lineTo(x + bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
	ctx.lineTo(x, y + tl);
	ctx.quadraticCurveTo(x, y, x + tl, y);
	ctx.closePath();
	if (fill) ctx.fill();
	if (stroke) ctx.stroke();
}