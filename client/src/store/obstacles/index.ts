import { CircleHitbox, Vec2 } from "../../types/math";
import { MinObstacle, MinMinObstacle } from "../../types/minimized";
import { DummyObstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";

export const OBSTACLE_SUPPLIERS = new Map<string, ObstacleSupplier>();

export { default as Tree } from "./tree";
export { default as Bush } from "./bush";
export { default as Crate } from "./crate";
export { default as MosinTree } from "./mosin_tree";
export { default as Stone } from "./stone";
export { default as SovietCrate } from "./soviet_crate";
export { default as GrenadeCrate} from "./grenade_crate";
export { default as AWMCrate} from "./awm_crate";
export { default as Barrel} from "./barrel";
export { default as AK47Stone} from "./ak47stone";

export function castCorrectObstacle(minObstacle: MinObstacle & any) {
	return OBSTACLE_SUPPLIERS.get(minObstacle.type)?.create(minObstacle) || new DummyObstacle(minObstacle);
}

export function castMinObstacle(minMinObstacle: MinMinObstacle & any) {
	const copy = minMinObstacle;
	return Object.assign(copy, { direction: Vec2.ONE, hitbox: new CircleHitbox(0), despawn: false, animations: [] });
}