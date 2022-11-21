import { Weapon, WeaponType } from "../../types/weapons";

export default class Fists implements Weapon {
	id = "fists";
	name = "Fists";
	continuous = false;
	animations = ["left_fist", "right_fist"];
	damage = 24;
	type = WeaponType.MELEE;
}