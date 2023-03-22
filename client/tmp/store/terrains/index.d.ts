import { MinTerrain } from "../../types/minimized";
import { TerrainSupplier } from "../../types/supplier";
export declare const TERRAIN_SUPPLIERS: Map<string, TerrainSupplier>;
export { default as Plain } from "./plain";
export { default as Pond } from "./pond";
export { default as River, RiverSegment } from "./river";
export { default as Sea } from "./sea";
export declare function castCorrectTerrain(minTerrain: MinTerrain & any): import("../../types/terrain").Terrain;
