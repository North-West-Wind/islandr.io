import { GunWeapon } from "../../../types/weapon";
import { GunColor } from "../../../types/misc";
import { WeaponSupplier } from "../../../types/supplier";
import { WEAPON_SUPPLIERS } from "..";

class MP5Supplier implements WeaponSupplier {
	create() {
		return new MP5();
	}
}

export default class MP5 extends GunWeapon {
	static readonly ID = "mp5";
	id = MP5.ID;
	name = "MP5";
	continuous = true;
	color = GunColor.YELLOW;
	speed = 0.6;
	accuracy = 0.7;
	inaccuracy = 0.3;
	weight = 0.9;
	ticks = 50;
	delay = 12;
	spread = 1;
	bullets = 30;

	static {
		WEAPON_SUPPLIERS.set(MP5.ID, new MP5Supplier());
	}
}