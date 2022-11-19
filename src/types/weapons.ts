export interface Weapon {
	name: string;
	continuous: boolean;
	attacks: string[]
}

export class Fist {
	name = "fist";
	continuous = false;
	attacks = ["left_fist", "right_fist"];
}