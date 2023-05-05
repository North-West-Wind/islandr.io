import { ENTITY_SUPPLIERS } from ".";
import { Entity } from "../../types/entity";
import { MinEntity } from "../../types/minimized";
import { EntitySupplier } from "../../types/supplier";
import { circleFromCenter } from "../../utils";
import Player from "./player";

interface AdditionalEntity {
	health: number;
	maxHealth: number;
}

class ExplosionSupplier implements EntitySupplier {
	create(minEntity: MinEntity & AdditionalEntity) {
		return new Explosion(minEntity);
	}
}

export default class Explosion extends Entity {
	static readonly TYPE = "explosion";
	type = Explosion.TYPE;
	

	constructor(minEntity: MinEntity & AdditionalEntity) {
		super(minEntity);
		this.copy(minEntity);
	}

	static {
		ENTITY_SUPPLIERS.set(Explosion.TYPE, new ExplosionSupplier());
	}

	copy(minEntity: MinEntity & AdditionalEntity) {
		super.copy(minEntity);
		this.health = minEntity.health;
		this.maxHealth = minEntity.maxHealth;
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(this.direction.angle());
		ctx.scale(scale, scale);
		const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.hitbox.comparable);
		gradient.addColorStop(0, "#000000ff");
		gradient.addColorStop(1, "#00000000");
		ctx.fillStyle = gradient;
		ctx.globalAlpha = this.health / this.maxHealth;
		circleFromCenter(ctx, 0, 0, this.hitbox.comparable, true);
		ctx.globalAlpha = 1;
		ctx.resetTransform();
	}
}