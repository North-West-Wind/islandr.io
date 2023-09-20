import { TerrainData } from "../../types/data";
import { Vec2 } from "../../types/math";
import { TerrainSupplier } from "../../types/supplier";
import Plain from "./plain";

export const TERRAIN_SUPPLIERS = new Map<string, TerrainSupplier>();

export { default as Floor } from "./floor";
export { default as Plain } from "./plain";
export { default as Pond } from "./pond";
export { default as River } from "./river";
export { default as Sea } from "./sea";

export function castCorrectTerrain(data: TerrainData) {
	return TERRAIN_SUPPLIERS.get(data.type)?.create(data) || new Plain();
}