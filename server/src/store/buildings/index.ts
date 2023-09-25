import * as fs from "fs";
import { BuildingData } from "../../types/data";
import { BuildingSupplier } from "../../types/supplier";
import Building from "../../types/building";

export const BUILDING_SUPPLIERS = new Map<string, BuildingSupplier>();

export function castBuilding(id: string): Building | undefined {
	return BUILDING_SUPPLIERS.get(id)?.create();
}

for (const file of fs.readdirSync("../data/buildings/")) {
	if (file.startsWith(".")) continue;
	const data = <BuildingData> JSON.parse(fs.readFileSync("../data/buildings/" + file, { encoding: "utf8" }));
	const id = file.split(".").slice(0, -1).join(" ");
	BUILDING_SUPPLIERS.set(id, new BuildingSupplier(id, data));
}