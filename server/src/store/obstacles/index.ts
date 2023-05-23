import { ObstacleData } from "../../types/data";
import { ObstacleSupplier } from "../../types/supplier";

export const OBSTACLE_SUPPLIERS = new Map<string, ObstacleSupplier>();

export { default as Tree } from "./tree";
export { default as Bush } from "./bush";
export { default as Crate } from "./crate";
export { default as Stone } from "./stone";
export { default as Barrel } from "./barrel";
export { default as Wall } from "./wall";

export function castCorrectObstacle(data: ObstacleData) {
	return OBSTACLE_SUPPLIERS.get(data.type)?.create(data);
}