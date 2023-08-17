import { world } from "../..";
import { CircleHitbox } from "../../types/math";
import { MinEntity } from "../../types/minimized";
import Item from "./item";
import Player from "./player";

export default class Scope extends Item {
	type = "scope";
	name: string;
	hitbox = new CircleHitbox(1);
	zoom: number;

	constructor(zoom: number) {
		super();
		this.zoom = zoom;
		this.name = `${this.zoom}x scope`
	}

	picked(player: Player) {
		world.onceSounds.push({"path": "item_usage/scope_equip.mp3", "position": this.position})
		return player.inventory.addScope(this.zoom);
	}

	minimize() {
		return Object.assign(super.minimize(), { zoom: this.zoom });
	}
}