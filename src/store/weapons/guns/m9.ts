import { GunWeapon } from "../../../types/weapon";
import { GunColor } from "../../../types/misc";
import { WeaponSupplier } from "../../../types/supplier";
import { WEAPON_SUPPLIERS } from "..";

class M9Supplier implements WeaponSupplier {
	create() {
		return new M9();
	}
}

export default class M9 extends GunWeapon {
	static readonly ID = "m9";
	id = M9.ID;
	name = "M9";
	continuous = false;
	color = GunColor.YELLOW;
	speed = 0.2;
	accuracy = 0.5;
	inaccuracy = 0.1;
	weight = 0.95;
	ticks = 50;
	delay = 12;
	dual = 0;
	dmg = 5;

	static {
		WEAPON_SUPPLIERS.set(M9.ID, new M9Supplier());
	}
}