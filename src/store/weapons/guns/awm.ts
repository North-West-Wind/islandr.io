import { GunWeapon } from "../../../types/weapon";
import { GunColor } from "../../../types/misc";
import { WeaponSupplier } from "../../../types/supplier";
import { WEAPON_SUPPLIERS } from "..";

class AWMSupplier implements WeaponSupplier {
	create() {
		return new AWM();
	}
}

export default class AWM extends GunWeapon {
	static readonly ID = "awm";
	id = AWM.ID;
	name = "AWM-S";
	continuous = false;
	color = GunColor.SUBSONIC;
	speed = 0.9;
	accuracy = 1.0;
	inaccuracy = 0.0;
	weight = 1.0;
	ticks = 50;
	dmg = 200;
	delay = 50;

	static {
		WEAPON_SUPPLIERS.set(AWM.ID, new AWMSupplier());
	}
}