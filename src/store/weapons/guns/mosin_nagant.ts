import { GunWeapon } from "../../../types/weapon";
import { GunColor } from "../../../types/misc";

export default class MosinNagant extends GunWeapon {
	id = "mosin_nagant";
	name = "Mosin Nagant";
	continuous = false;
	ammo = GunColor.BLUE;
	speed = 1.0;
	accuracy = 1.0;
	inaccuracy = 0.05;
	weight = 2.0;
	ticks = 50;
	delay = 50;
	recoil = 1.0;
}