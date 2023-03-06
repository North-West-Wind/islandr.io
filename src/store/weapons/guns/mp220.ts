import { GunWeapon } from "../../../types/weapon";
import { GunColor } from "../../../types/misc";

export default class MP220 extends GunWeapon {
	id = "mp220";
	name = "MP220";
	continuous = true;
	color = GunColor.RED;
	speed = 0.8;
	accuracy = 1.0;
	inaccuracy = 0.05;
	weight = 1.0;
	ticks = 50;
	delay = 10;
	recoil = 0.01;
	bullets = 8;
}