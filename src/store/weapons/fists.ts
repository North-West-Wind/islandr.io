import { Weapon, WeaponType } from "../../types/weapons";

export default class Fists implements Weapon {
	id = "fists";
	name = "Fists";
	continuous = false;
	animations = ["left_fist", "right_fist"];
	durations = [50, 50];
	damage = 24;
	type = WeaponType.MELEE;
}