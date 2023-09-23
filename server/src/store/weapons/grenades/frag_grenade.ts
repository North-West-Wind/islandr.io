import { GrenadeWeapon } from "../../../types/weapon";
import { WeaponSupplier } from "../../../types/supplier";
import { WEAPON_SUPPLIERS } from "..";

class FragGrenadeSupplier implements WeaponSupplier {
	create() {
		return new FragGrenade();
	}
}

export default class FragGrenade extends GrenadeWeapon {
	static readonly ID = "frag_grenade";

	constructor() {
		super(FragGrenade.ID);
	}

	static {
		WEAPON_SUPPLIERS.set(FragGrenade.ID, new FragGrenadeSupplier());
	}
}