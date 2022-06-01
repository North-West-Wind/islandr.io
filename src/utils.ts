import * as crypto from "crypto";

export async function ID() {
    const buffer: Buffer = await new Promise((resolve, reject) => crypto.randomBytes(24, async (err, buffer) => err ? reject(err) : resolve(buffer)));
    return buffer.toString("hex");
}

export function wait(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }