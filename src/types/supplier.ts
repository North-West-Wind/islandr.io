import { Weapon } from "./weapon";

interface Supplier<T> {
	create(...arg: any[]): T;
}

export interface WeaponSupplier extends Supplier<Weapon> {
	create(): Weapon;
}