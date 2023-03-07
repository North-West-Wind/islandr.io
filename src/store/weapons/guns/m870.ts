import { GunWeapon } from "../../../types/weapon";
import { GunColor } from "../../../types/misc";
import { WeaponSupplier } from "../../../types/supplier";
import { WEAPON_SUPPLIERS } from "..";

class M870Supplier implements WeaponSupplier {
	create() {
		return new M870();
	}
}

export default class M870 extends GunWeapon {
	static readonly ID = "m870";
	id = M870.ID;
	name = "M870";
	continuous = false;
	color = GunColor.RED;
	speed = 0.8;
	accuracy = 1.0;
	inaccuracy = 0.05;
	weight = 0.9;
	ticks = 50;
	delay = 50;
	recoil = 1.0;
	bullets = 6;

	static {
		WEAPON_SUPPLIERS.set(M870.ID, new M870Supplier());
	}
}