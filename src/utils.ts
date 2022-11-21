import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

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

// Read all file names under a directory (recursive)
export function deepReaddir(dir: string) {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    let i = 0;
    function next(): string[] {
        let file = list[i++];
        if (!file) return results;
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            const res = deepReaddir(file);
            results = results.concat(res);
            return next();
        } else {
            results.push(file);
            return next();
        }
    }
    return next();
}