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
export function randomBoolean() {
    return !!Math.floor(Math.random() * 2);
}
export function toRadians(degree: number) {
    return degree * Math.PI / 180;
}

// Things that require game object imports
import { world } from ".";
import { Ammo, Gun } from "./store/entities";
import { CommonAngles, Vec2 } from "./types/math";
import { GunColor } from "./types/misc";

// Spawners
export function spawnGun(id: string, color: GunColor, position: Vec2) {
    const gun = new Gun(id, color);
    gun.position = position;
    gun.velocity = Vec2.UNIT_X.addAngle(Math.random() * CommonAngles.TWO_PI).scaleAll(0.025);
    world.entities.push(gun);
}
export function spawnAmmo(amount: number, color: GunColor, position: Vec2) {
    const ammo = new Ammo(amount, color);
    ammo.position = position;
    ammo.velocity = Vec2.UNIT_X.addAngle(Math.random() * CommonAngles.TWO_PI).scaleAll(0.025);
    world.entities.push(ammo);
}