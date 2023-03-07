import { GunWeapon } from "../../../types/weapon";
import { GunColor } from "../../../types/misc";
import { WeaponSupplier } from "../../../types/supplier";
import { WEAPON_SUPPLIERS } from "..";

class M1100Supplier implements WeaponSupplier {
	create() {
		return new M1100();
	}
}

export default class M1100 extends GunWeapon {
	static readonly ID = "m1100";
	id = M1100.ID;
	name = "M1100";
	continuous = false;
	color = GunColor.RED;
	speed = 0.8;
	accuracy = 1.0;
	inaccuracy = 0.05;
	weight = 0.9;
	ticks = 50;
	delay = 20;
	bullets = 9;

	static {
		WEAPON_SUPPLIERS.set(M1100.ID, new M1100Supplier());
	}
}