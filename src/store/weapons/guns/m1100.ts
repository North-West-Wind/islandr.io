import { GunWeapon } from "../../../types/weapon";
import { GunColor } from "../../../types/misc";

export default class M1100 extends GunWeapon {
	id = "M1100";
	name = "M1100";
	continuous = false;
	color = GunColor.RED;
	speed = 0.8;
	accuracy = 1.0;
	inaccuracy = 0.05;
	weight = 1.0;
	ticks = 50;
	delay = 20;
	recoil = 0.4;
	bullets = 9;
}