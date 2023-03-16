import { GunWeapon } from "../../../types/weapon";
import { GunColor } from "../../../types/misc";
import { WeaponSupplier } from "../../../types/supplier";
import { WEAPON_SUPPLIERS } from "..";

class AK47Supplier implements WeaponSupplier {
	create() {
		return new AK47();
	}
}

export default class AK47 extends GunWeapon {
	static readonly ID = "ak47";
	id = AK47.ID;
	name = "AK 47";
	continuous = true;
	color = GunColor.BLUE;
	speed = 0.8;
	accuracy = 0.8;
	inaccuracy = 0.2;
	weight = 0.9;
	ticks = 50;
	delay = 12;
	spread = 1;
	bullets = 30;
	dmg = 7;

	static {
		WEAPON_SUPPLIERS.set(AK47.ID, new AK47Supplier());
	}
}