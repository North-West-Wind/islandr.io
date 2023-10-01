import { CircleHitbox, Vec2 } from "../../types/math";
import { MinObstacle, MinMinObstacle } from "../../types/minimized";
import { DummyObstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";

export const OBSTACLE_SUPPLIERS = new Map<string, ObstacleSupplier>();

export { default as Tree } from "./tree";
export { default as Bush } from "./bush";
export { default as Crate } from "./crate";
export { default as Stone } from "./stone";
export { default as Barrel } from "./barrel";
export { default as Wall } from "./wall";
export { default as Roof } from "./roof";
export { default as Toilet} from "./toilet";
export { default as Door } from "./door";
export { default as ToiletMore } from "./toilet_more";
export { default as Table } from "./table";
export { default as Desk } from "./desk";
export function castObstacle(minObstacle: MinObstacle & any) {
	return OBSTACLE_SUPPLIERS.get(minObstacle.type)?.create(minObstacle);
}

export function castMinObstacle(minMinObstacle: MinMinObstacle) {
	const copy = minMinObstacle;
	return Object.assign(copy, { direction: Vec2.UNIT_X, hitbox: new CircleHitbox(0), despawn: false, animations: [] });
}