import { Entity } from "./entities";
import { Hitbox, Vec2 } from "./maths";
import { MinWeapon } from "./minimized";
import { GameObject } from "./objects";

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

	abstract attack(attacker: Entity, entities: Entity[], objects: GameObject[]): void;

	minimize() {
		return <MinWeapon> { id: this.id, name: this.name };
	}
}

export abstract class MeleeWeapon extends Weapon {
	type = WeaponType.MELEE;
	hitbox!: Hitbox;
	distance!: Vec2;
	rotation!: Vec2;
	delay!: number;
	single = true;
}