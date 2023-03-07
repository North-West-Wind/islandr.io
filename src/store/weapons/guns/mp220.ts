import { GunWeapon } from "../../../types/weapon";
import { GunColor } from "../../../types/misc";
import { WeaponSupplier } from "../../../types/supplier";
import { WEAPON_SUPPLIERS } from "..";

class MP220Supplier implements WeaponSupplier {
	create() {
		return new MP220();
	}
}

export default class MP220 extends GunWeapon {
	static readonly ID = "mp220";
	id = MP220.ID;
	name = "MP220";
	continuous = true;
	color = GunColor.RED;
	speed = 0.8;
	accuracy = 1.0;
	inaccuracy = 0.05;
	weight = 0.9;
	ticks = 50;
	delay = 10;
	bullets = 8;

	static {
		WEAPON_SUPPLIERS.set(MP220.ID, new MP220Supplier());
	}
}