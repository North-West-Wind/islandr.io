import { MapTerrainData, TerrainData } from "../../types/data";
import { MapTerrainSupplier, TerrainSupplier } from "../../types/supplier";

export const TERRAIN_SUPPLIERS = new Map<string, TerrainSupplier>();
export const MAP_TERRAIN_SUPPLIERS = new Map<string, MapTerrainSupplier>();

import Plain from "./plain";
export { Plain };
export { default as Floor } from "./floor";
export { default as Pond } from "./pond";
export { default as River } from "./river";
export { default as Sea } from "./sea";

export function castTerrain(data: TerrainData) {
	return TERRAIN_SUPPLIERS.get(data.type)?.create(data) || new Plain();
}

export function castMapTerrain(data: MapTerrainData) {
	return MAP_TERRAIN_SUPPLIERS.get(data.id)?.create(data);
}