import { ENTITY_SUPPLIERS } from ".";
import { GunColor } from "../../constants";
import { getWeaponImage } from "../../textures";
import { Entity } from "../../types/entity";
import { MinEntity } from "../../types/minimized";
import { EntitySupplier } from "../../types/supplier";
import { circleFromCenter } from "../../utils";
import Player from "./player";

interface AdditionalEntity {
	name: string;
	color: GunColor;
}

class GunSupplier implements EntitySupplier {
	create(minEntity: MinEntity & AdditionalEntity) {
		return new Gun(minEntity);
	}
}

const HEX_COLORS = ["#F2A500", "#F20000", "#0061F2", "#039700"];

export default class Gun extends Entity {
	static readonly TYPE = "gun";
	type = Gun.TYPE;
	name!: string;
	color!: GunColor;
	zIndex = 8;

	constructor(minEntity: MinEntity & AdditionalEntity) {
		super(minEntity);
		this.copy(minEntity);
	}

	static {
		ENTITY_SUPPLIERS.set(Gun.TYPE, new GunSupplier());
	}

	copy(minEntity: MinEntity & AdditionalEntity) {
		super.copy(minEntity);
		this.name = minEntity.name;
		this.color = minEntity.color;
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		const relative = this.position.addVec(you.position.inverse());
		const radius = scale * this.hitbox.comparable;
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		ctx.strokeStyle = HEX_COLORS[this.color];
		ctx.lineWidth = scale * 0.25;
		circleFromCenter(ctx, 0, 0, radius, false, true);
		ctx.fillStyle = HEX_COLORS[this.color] + "66"; // <- alpha/opacity
		circleFromCenter(ctx, 0, 0, radius, true, false);
		const img = getWeaponImage(this.name);
		if (!img?.loaded) {
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#fff";
			ctx.font = `${canvas.height / 54}px Arial`;
			ctx.fillText(this.name, 0, 0);
		} else {
			ctx.drawImage(img, -0.7*radius, -0.7*radius, 1.4*radius, 1.4*radius);
		}
		ctx.resetTransform();
	}
}