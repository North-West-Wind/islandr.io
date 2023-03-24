import { ENTITY_SUPPLIERS } from ".";
import { Entity, Inventory, PartialInventory } from "../../types/entity";
import { MinEntity, MinInventory } from "../../types/minimized";
import { EntitySupplier } from "../../types/supplier";
import { GunWeapon, WeaponType } from "../../types/weapon";
import { circleFromCenter } from "../../utils";
import { castCorrectWeapon, WEAPON_SUPPLIERS } from "../weapons";

const deathImg: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
deathImg.onload = () => deathImg.loaded = true;
deathImg.src = "assets/images/game/entities/death.svg";

interface AdditionalEntity {
	id: string;
	username: string;
	boost: number;
	scope: number;
	inventory: MinInventory | Inventory;
	canInteract?: boolean;
	reloadTicks: number;
	maxReloadTicks: number;
	health: number
}

class PlayerSupplier implements EntitySupplier {
	create(minEntity: MinEntity & AdditionalEntity) {
		return new PartialPlayer(minEntity);
	}
}

export default class Player extends Entity {
	static readonly TYPE = "player";
	type = Player.TYPE;
	id!: string;
	username!: string;
	inventory!: PartialInventory | Inventory;
	zIndex = 9;

	constructor(minEntity: MinEntity & AdditionalEntity) {
		super(minEntity);
		this.copy(minEntity);
	}

	copy(minEntity: MinEntity & AdditionalEntity) {
		super.copy(minEntity);
		this.username = minEntity.username;
		this.health = minEntity.health;
		if (typeof minEntity.inventory.holding === "number") {
			const inventory = <Inventory>minEntity.inventory;
			this.inventory = new Inventory(inventory.holding, inventory.slots, inventory.weapons.map(w => w ? castCorrectWeapon(w, w.type == WeaponType.GUN ? (<GunWeapon>w).magazine : 0) : w), inventory.ammos, inventory.utilities);
		} else this.inventory = new PartialInventory(<MinInventory>minEntity.inventory);
		if (this.despawn) this.zIndex = 7;
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		const relative = this.position.addVec(you.position.inverse());
		const radius = scale * this.hitbox.comparable;
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		if (!this.despawn) {
			ctx.rotate(this.direction.angle());
			ctx.fillStyle = "#F8C675";
			circleFromCenter(ctx, 0, 0, radius);
			// We will leave the transform for the weapon
			// If player is holding nothing, render fist
			var weapon = WEAPON_SUPPLIERS.get("fists")!.create();
			//console.log(this.inventory);
			if (typeof this.inventory.holding === "number") weapon = (<Inventory>this.inventory).getWeapon()!;
			else weapon = (<PartialInventory>this.inventory).holding;
			weapon.render(this, canvas, ctx, scale);
			ctx.resetTransform();
		} else {
			ctx.drawImage(deathImg, -radius * 2, -radius * 2, radius * 4, radius * 4);
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
			ctx.font = `700 ${scale}px Jura`;
			ctx.fillStyle = "#60605f";
			ctx.fillText(this.username, 2, radius * 2 + 2);
			ctx.fillStyle = "#80807f"
			ctx.fillText(this.username, 0, radius * 2);
			ctx.resetTransform();
		}
	}
}

export class PartialPlayer extends Player {
	inventory!: PartialInventory;

	static {
		ENTITY_SUPPLIERS.set(Player.TYPE, new PlayerSupplier());
	}
}

export class FullPlayer extends Player {
	inventory!: Inventory;
	boost!: number;
	scope!: number;
	canInteract?: boolean;
	reloadTicks!: number;
	maxReloadTicks!: number;

	copy(minEntity: MinEntity & AdditionalEntity) {
		super.copy(minEntity);
		this.boost = minEntity.boost;
		this.scope = minEntity.scope;
		this.canInteract = minEntity.canInteract || false;
		this.reloadTicks = minEntity.reloadTicks;
		this.maxReloadTicks = minEntity.maxReloadTicks;
	}
}