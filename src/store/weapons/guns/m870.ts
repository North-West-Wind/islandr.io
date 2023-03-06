import { GunWeapon } from "../../../types/weapon";
import { GunColor } from "../../../types/misc";

export default class M870 extends GunWeapon {
	id = "M870";
	name = "M870";
	continuous = false;
	color = GunColor.RED;
	speed = 0.8;
	accuracy = 1.0;
	inaccuracy = 0.05;
	weight = 1.0;
	ticks = 50;
	delay = 50;
	recoil = 1.0;
	bullets = 6;
}