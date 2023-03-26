import { ENTITY_SUPPLIERS } from ".";
import { getTracerColor } from "../../textures";
import { TracerData } from "../../types/data";
import { Entity } from "../../types/entity";
import { MinEntity } from "../../types/minimized";
import { EntitySupplier } from "../../types/supplier";
import { lineBetween } from "../../utils";
import Player from "./player";

interface AdditionalEntity {
	tracer: TracerData;
}

class BulletSupplier implements EntitySupplier {
	create(minEntity: MinEntity & AdditionalEntity) {
		return new Bullet(minEntity);
	}
}

export default class Bullet extends Entity {
	static readonly TYPE = "bullet";
	type = Bullet.TYPE;
	// Used for rendering bullet size
	tracer!: TracerData;

	constructor(minEntity: MinEntity & AdditionalEntity) {
		super(minEntity);
		this.copy(minEntity);
	}

	static {
		ENTITY_SUPPLIERS.set(Bullet.TYPE, new BulletSupplier());
	}

	copy(minEntity: MinEntity & AdditionalEntity) {
		super.copy(minEntity);
		this.tracer = minEntity.tracer;
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(this.direction.angle());
		ctx.scale(scale, scale);
		ctx.fillStyle = `#${getTracerColor(this.tracer.type)?.color.regular || "000"}`;
		const gradient = ctx.createLinearGradient(0, 0, -this.tracer.length * 4, 0);
		gradient.addColorStop(0, ctx.fillStyle + "ff");
		gradient.addColorStop(1, ctx.fillStyle + "00");
		ctx.strokeStyle = gradient;
		ctx.lineWidth = this.tracer.width * 2;
		lineBetween(ctx, 0, 0, -this.tracer.length * 4, 0);
		//what da circle for??
		//circleFromCenter(ctx, 0, 0, this.tracer.width, true);
		ctx.resetTransform();
	}
}