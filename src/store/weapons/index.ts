import { WeaponSupplier } from "../../types/supplier";
import { Weapon } from "../../types/weapon";

export const WEAPON_SUPPLIERS = new Map<string, WeaponSupplier>();

import Fists from "./fists";

export { default as Fists } from "./fists";
export { default as M9 } from "./guns/m9";
export { default as MosinNagant } from "./guns/mosin_nagant";
export { default as M870 } from "./guns/m870";
export { default as MP220 } from "./guns/mp220";
export { default as M1100 } from "./guns/m1100";
export { default as MP5 } from "./guns/mp5";
export { default as FragGrenade} from "./grenades/frag_grenade";

export function castCorrectWeapon(id: string): Weapon {
	return WEAPON_SUPPLIERS.get(id)?.create() || new Fists();
}