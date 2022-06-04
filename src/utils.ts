import * as crypto from "crypto";

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