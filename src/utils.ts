import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { Vec2 } from "./types/maths";

// ID generator
export async function ID() {
    const buffer: Buffer = await new Promise((resolve, reject) => crypto.randomBytes(24, async (err, buffer) => err ? reject(err) : resolve(buffer)));
    return buffer.toString("hex");
}

// Promisified setTimeout
export function wait(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }
// Capping value with limits
export function clamp(val: number, min: number, max: number) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
}

// Pick random element from array
export function randomSelect(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Check line circle intersection
export function lineCircleIntersect(lineA: Vec2, lineB: Vec2, center: Vec2, radius: number) {
    const a = lineB.y - lineA.y;
    const b = lineA.x - lineB.x;
    const c = (lineB.x - lineA.x) * lineA.y - (lineB.y - lineA.y) * lineA.x;

    return Math.abs(a * center.x + b * center.y + c) / Math.sqrt(a*a + b*b) < radius;
}