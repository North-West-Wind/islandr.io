import { Vec2 } from "./types/maths";

export const MAP_SIZE = [1000, 1000];
export const TICKS_PER_SECOND = 50;
export const BASE_RADIUS = 20;
export const ENTITY_EXCLUDE = ["position", "velocity", "hitbox"];
export const DIRECTION_VEC = [Vec2.ONE, Vec2.ONE.addAngle(Math.PI / 2), Vec2.ONE.addAngle(Math.PI), Vec2.ONE.addAngle(-Math.PI)];