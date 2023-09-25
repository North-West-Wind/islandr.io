import { MapObstacleData, ObstacleData } from "../../types/data";
import { MapObstacleSupplier, ObstacleSupplier } from "../../types/supplier";

export const OBSTACLE_SUPPLIERS = new Map<string, ObstacleSupplier>();
export const MAP_OBSTACLE_SUPPLIERS = new Map<string, MapObstacleSupplier>();

export { default as Tree } from "./tree";
export { default as Bush } from "./bush";
export { default as Crate } from "./crate";
export { default as Stone } from "./stone";
export { default as Barrel } from "./barrel";
export { default as Wall } from "./wall";
export { default as Roof } from "./roof";
export { default as Toilet} from "./toilet";

export function castObstacle(data: ObstacleData) {
	return OBSTACLE_SUPPLIERS.get(data.type)?.create(data);
}

export function castMapObstacle(data: MapObstacleData) {
	return MAP_OBSTACLE_SUPPLIERS.get(data.type)?.create(data);
}