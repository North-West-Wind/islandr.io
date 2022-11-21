import { MinWeapon } from "./minimized";

export enum WeaponType {
	MELEE = "melee",
	GUN = "gun",
	GRENADE = "grenade"
}

export abstract class Weapon {
	id!: string;
	name!: string;
	continuous!: boolean;
	// This is handled client-side, but still needs to be sent from server
	animations!: string[];
	// Each element corresponds to an animation
	durations!: number[];
	damage!: number;
	type!: WeaponType;

	minimize() {
		return <MinWeapon> { id: this.id, name: this.name };
	}
}