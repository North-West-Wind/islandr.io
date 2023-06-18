import { CircleHitbox } from "../../types/math";
import { MinEntity } from "../../types/minimized";
import Item from "./item";
import Player from "./player";

export default class Scope extends Item {
	type = "scope";
	hitbox = new CircleHitbox(1);
	zoom: number;

	constructor(zoom: number) {
		super();
		this.zoom = zoom;
	}

	picked(player: Player) {
		return player.inventory.addScope(this.zoom);
	}

	minimize() {
		return Object.assign(super.minimize(), { zoom: this.zoom });
	}
}