import * as fs from "fs";
import { GunData, MeleeData } from "../../types/data";
import { WeaponSupplier } from "../../types/supplier";
import { GunWeapon, MeleeWeapon, Weapon } from "../../types/weapon";

export const WEAPON_SUPPLIERS = new Map<string, WeaponSupplier>();

export { default as FragGrenade } from "./grenades/frag_grenade";
export function castCorrectWeapon(id: string): Weapon {
	return WEAPON_SUPPLIERS.get(id)?.create() || WEAPON_SUPPLIERS.get("fists")!.create();
}

class MeleeSupplier implements WeaponSupplier {
	id: string;
	data: MeleeData;

	constructor(id: string, data: MeleeData) {
		this.id = id;
		this.data = data;
	}

	create() {
		return new MeleeWeapon(this.id, this.data);
	}
}

class GunSupplier implements WeaponSupplier {
	id: string;
	data: GunData;

	constructor(id: string, data: GunData) {
		this.id = id;
		this.data = data;
	}

	create() {
		return new GunWeapon(this.id, this.data);
	}
}

for (const file of fs.readdirSync("../data/weapons/melee/")) {
	if (file.startsWith(".")) continue;
	const data = <MeleeData> JSON.parse(fs.readFileSync("../data/weapons/melee/" + file, { encoding: "utf8" }));
	WEAPON_SUPPLIERS.set(file.split(".")[0], new MeleeSupplier(file.split(".")[0], data));
}

for (const file of fs.readdirSync("../data/weapons/guns/")) {
	if (file.startsWith(".")) continue;
	const data = <GunData> JSON.parse(fs.readFileSync("../data/weapons/guns/" + file, { encoding: "utf8" }));
	WEAPON_SUPPLIERS.set(file.split(".")[0], new GunSupplier(file.split(".")[0], data));
}