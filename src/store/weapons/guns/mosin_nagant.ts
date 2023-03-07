import { GunWeapon } from "../../../types/weapon";
import { GunColor } from "../../../types/misc";
import { WeaponSupplier } from "../../../types/supplier";
import { WEAPON_SUPPLIERS } from "..";

class MosinNagantSupplier implements WeaponSupplier {
	create() {
		return new MosinNagant();
	}
}

export default class MosinNagant extends GunWeapon {
	static readonly ID = "mosin_nagant";
	id = MosinNagant.ID;
	name = "Mosin Nagant";
	continuous = false;
	color = GunColor.BLUE;
	speed = 1.0;
	accuracy = 1.0;
	inaccuracy = 0.05;
	weight = 0.7;
	ticks = 50;
	delay = 50;

	static {
		WEAPON_SUPPLIERS.set(MosinNagant.ID, new MosinNagantSupplier());
	}
}