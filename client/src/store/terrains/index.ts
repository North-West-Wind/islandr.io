import { MinTerrain } from "../../types/minimized";
import { TerrainSupplier } from "../../types/supplier";

export const TERRAIN_SUPPLIERS = new Map<string, TerrainSupplier>();

import Plain from "./plain";

export { default as Plain } from "./plain";
export { default as Pond } from "./pond";
export { default as River, RiverSegment } from "./river";
export { default as Sea } from "./sea";
export { default as Floor } from "./floor";

export function castTerrain(minTerrain: MinTerrain  & { [key: string]: any }) {
	return TERRAIN_SUPPLIERS.get(minTerrain.id)?.create(minTerrain) || new Plain(minTerrain);
}