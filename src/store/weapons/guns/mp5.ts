import { GunWeapon } from "../../../types/weapon";
import { GunColor } from "../../../types/misc";

export default class MP5 extends GunWeapon {
	id = "mp5";
	name = "MP5";
	continuous = true;
	color = GunColor.YELLOW;
	speed = 0.6;
	accuracy = 0.7;
	inaccuracy = 0.3;
	weight = 0.8;
	ticks = 50;
	delay = 12;
	recoil = 0.08;
	spread = 1;
	bullets = 30;
}