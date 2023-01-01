import * as crypto from "crypto";

// ID generator
export function ID() {
    return crypto.randomBytes(24).toString("hex");
}

// Promisified setTimeout
export function wait(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }
// Capping value with limits
export function clamp(val: number, min: number, max: number) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
}
// Random between numbers
export function randomBetween(min: number, max: number) {
    return (Math.random() * (max - min)) + min;
}