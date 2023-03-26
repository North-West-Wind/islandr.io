import { MeleeData, GunData } from "../../types/data";
import { MinWeapon } from "../../types/minimized";
import { WeaponSupplier } from "../../types/supplier";
import { MeleeWeapon, GunWeapon } from "../../types/weapon";

export const WEAPON_SUPPLIERS = new Map<string, WeaponSupplier>();

export { default as FragGrenade } from "./grenades/frag_grenade";

export function castCorrectWeapon(minWeapon: MinWeapon & any, magazine = 0) {
	return WEAPON_SUPPLIERS.get(minWeapon.id)?.create(magazine) || WEAPON_SUPPLIERS.get("fists")!.create();
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

	create(magazine = 0) {
		return new GunWeapon(this.id, this.data, magazine);
	}
}

(async() => {
	for (const file of await fetch(`data/weapons/melee/.list.json`).then(res => res.json()).catch(err => console.error(err))) {
		const data = <MeleeData> await fetch(`data/weapons/melee/${file}.json`).then(res => res.json());
		WEAPON_SUPPLIERS.set(file, new MeleeSupplier(file, data));
	}
	
	for (const file of await fetch(`data/weapons/guns/.list.json`).then(res => res.json())) {
		const data = <GunData> await fetch(`data/weapons/guns/${file}.json`).then(res => res.json())
		WEAPON_SUPPLIERS.set(file, new GunSupplier(file, data));
	}
})();