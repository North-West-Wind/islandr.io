import { GunWeapon } from "../../../types/weapon";
import { GunColor } from "../../../types/misc";

export default class MP220 extends GunWeapon {
	id = "MP220";
	name = "MP220";
	continuous = true;
	ammo = GunColor.RED;
	speed = 0.8;
	accuracy = 1.0;
	inaccuracy = 0.05;
	weight = 1.0;
	ticks = 50;
	delay = 10;
	recoil = 0.01;
	spread = 8;
	bullets = 2;
}