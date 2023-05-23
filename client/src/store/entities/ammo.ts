import { ENTITY_SUPPLIERS } from ".";
import { GunColor } from "../../constants";
import { Entity } from "../../types/entity";
import { MinEntity } from "../../types/minimized";
import { EntitySupplier } from "../../types/supplier";
import { circleFromCenter } from "../../utils";
import Player from "./player";

interface AdditionalEntity {
	amount: number;
	color: GunColor;
}

class AmmoSupplier implements EntitySupplier {
	create(minEntity: MinEntity & AdditionalEntity) {
		return new Ammo(minEntity);
	}
}

export default class Ammo extends Entity {
	static readonly TYPE = "ammo";
	static colorScheme: string[][] = [];
	type = Ammo.TYPE;
	amount!: number;
	color!: GunColor;
	zIndex = 8;

	constructor(minEntity: MinEntity & AdditionalEntity) {
		super(minEntity);
		this.copy(minEntity);
	}

	static {
		ENTITY_SUPPLIERS.set(Ammo.TYPE, new AmmoSupplier());
		fetch("data/colors/ammos.json").then(res => res.json()).then(x => this.colorScheme = x);
	}

	copy(minEntity: MinEntity & AdditionalEntity) {
		super.copy(minEntity);
		this.amount = minEntity.amount;
		this.color = minEntity.color;
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		ctx.scale(scale, scale);
		ctx.strokeStyle = `#${Ammo.colorScheme[this.color][0]}`;
		ctx.lineWidth = 0.2;
		ctx.fillStyle = `#${Ammo.colorScheme[this.color][1]}`;
		circleFromCenter(ctx, 0, 0, this.hitbox.comparable * 2 / 3, true, true);
		ctx.fillStyle = `#${Ammo.colorScheme[this.color][2]}`;
		circleFromCenter(ctx, -this.hitbox.comparable / 8 + this.hitbox.comparable / 6, -this.hitbox.comparable / 4 + this.hitbox.comparable / 6, this.hitbox.comparable / 3);
		ctx.resetTransform();
	}
}