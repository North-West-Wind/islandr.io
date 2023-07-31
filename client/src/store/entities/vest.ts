import { ENTITY_SUPPLIERS } from ".";
import { Entity } from "../../types/entity";
import { MinEntity } from "../../types/minimized";
import { EntitySupplier } from "../../types/supplier";
import { circleFromCenter } from "../../utils";
import Player from "./player";
import { getVestImagePath } from "../../textures";

interface AdditionalEntity {
	level: number;
	name: string;
}

class VestSupplier implements EntitySupplier {
	create(minEntity: MinEntity & AdditionalEntity) {
		return new Vest(minEntity);
	}
}

export default class Vest extends Entity {
	static readonly vestImages: (HTMLImageElement & { loaded: boolean })[] = Array(4).fill(undefined);
	static readonly TYPE = "vest";
	name!: string
	type = Vest.TYPE;
	level!: number;
	zIndex = 8;

	constructor(minEntity: MinEntity & AdditionalEntity) {
		super(minEntity);
		this.copy(minEntity);
	}

	static {
		ENTITY_SUPPLIERS.set(Vest.TYPE, new VestSupplier());
	}

	copy(minEntity: MinEntity & AdditionalEntity) {
		super.copy(minEntity);
		this.name = minEntity.name;
		this.level = minEntity.level;
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		const relative = this.position.addVec(you.position.inverse());
		const radius = scale * this.hitbox.comparable;
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		ctx.strokeStyle = "#000";
		ctx.lineWidth = scale * 0.1;
		circleFromCenter(ctx, 0, 0, radius, false, true);
		ctx.fillStyle = "#00000066"; // <- alpha/opacity
		circleFromCenter(ctx, 0, 0, radius, true, false);
		const img = Vest.vestImages[this.level - 1];
		if (!img?.loaded) {
			if (!img) {
				const image: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
				image.onload = () => image.loaded = true;
				image.src = getVestImagePath(this.level);
				Vest.vestImages[this.level -1] = image;
			}
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#fff";
			ctx.font = `${canvas.height / 54}px Arial`;
			ctx.fillText(`V${this.level}`, 0, 0);
		} else
			ctx.drawImage(img, -0.6 * radius, -0.6 * radius, 1.2 * radius, 1.2 * radius);
		ctx.resetTransform();
	}
}
