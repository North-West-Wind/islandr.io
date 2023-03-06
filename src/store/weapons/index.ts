import { Weapon } from "../../types/weapon";
import Fists from "./fists";
import M1100 from "./guns/m1100";
import M870 from "./guns/m870";
import M9 from "./guns/m9";
import MosinNagant from "./guns/mosin_nagant";
import MP220 from "./guns/mp220";
import MP5 from "./guns/mp5";

export { default as Fists } from "./fists";
export { default as M9 } from "./guns/m9";
export { default as MosinNagant } from "./guns/mosin_nagant";
export { default as M870 } from "./guns/m870";
export { default as MP220 } from "./guns/mp220";
export { default as M1100 } from "./guns/m1100";
export { default as MP5 } from "./guns/mp5";

// If you have an idea how to avoid hardcoding this please tell me
export function castCorrectWeapon(id: string): Weapon {
	switch (id) {
		case "m9":
			return new M9();
		case "mosin_nagant":
			return new MosinNagant();
		case "m870":
			return new M870();
		case "mp220":
			return new MP220();
		case "m1100":
			return new M1100();
		case "mp5":
			return new MP5();
		default:
			return new Fists();
	}
}