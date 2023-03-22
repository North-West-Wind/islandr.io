import { ENTITY_SUPPLIERS } from ".";
import { CommonAngle, GunColor } from "../../constants";
import { Entity } from "../../types/entity";
import { MinEntity } from "../../types/minimized";
import { EntitySupplier } from "../../types/supplier";
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

// Refer to gun color for the order
// Inner order: frame, outer, inner
const COLOR_SCHEME = [
	["#332300", "#b37a00", "#f2a500"],
	["#4c0000", "#b30000", "#f20000"],
	["#002c6d", "#0048b3", "#0061f2"],
	["#013d00", "#026f00", "#039600"],
	["#111111", "#111111", "#006400"],
];

export default class Ammo extends Entity {
	static readonly TYPE = "ammo";
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
		const length = this.hitbox.comparable * Math.sin(CommonAngle.PI_TWO);
		ctx.strokeStyle = COLOR_SCHEME[this.color][0];
		ctx.lineWidth = 0.2;
		ctx.fillStyle = COLOR_SCHEME[this.color][1];
		ctx.fillRect(-length / 2, -length / 2, length, length);
		ctx.strokeRect(-length / 2, -length / 2, length, length);
		ctx.fillStyle = COLOR_SCHEME[this.color][2];
		ctx.fillRect(-length / 8, -length / 4, length / 3, length / 3);
		ctx.resetTransform();
	}
}