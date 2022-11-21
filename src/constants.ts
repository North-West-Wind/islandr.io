import { CommonAngles, Vec2 } from "./types/maths";
import * as fs from "fs";

export const MAP_SIZE = [1000, 1000];
export const TICKS_PER_SECOND = 100;
// Radius of 1x scope
export const BASE_RADIUS = 50;
export const DIRECTION_VEC = [Vec2.ONE, Vec2.ONE.addAngle(-CommonAngles.PI_TWO), Vec2.ONE.addAngle(Math.PI), Vec2.ONE.addAngle(CommonAngles.PI_TWO)];

export const TSCONFIG = JSON.parse(fs.readFileSync("./tsconfig.json", { encoding: "utf8" }));