export enum WeaponType {
	MELEE = "melee",
	GUN = "gun",
	GRENADE = "grenade"
}

export interface Weapon {
	id: string;
	name: string;
	continuous: boolean;
	// This is handled client-side, but still needs to be sent from server
	animations: string[];
	damage: number;
	type: WeaponType;
}