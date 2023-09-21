import { PARTICLE_SUPPLIERS } from ".";
import { MinParticle } from "../../types/minimized";
import { TextureFadeParticle } from "../../types/particle";
import { ParticleSupplier } from "../../types/supplier";

type AdditionalParticle = {
	duration: number;
}

class WoodSupplier implements ParticleSupplier {
	create(minParticle: MinParticle & AdditionalParticle) {
		return new Wood(minParticle);
	}
}

export default class Wood extends TextureFadeParticle {
	static readonly ID = "wood";
	id = Wood.ID;
	texture = "wood";

	constructor(minParticle: MinParticle) {
		super(Object.assign(minParticle, { duration: 1000, fadeStart: 1000 }));
	}

	static {
		PARTICLE_SUPPLIERS.set(Wood.ID, new WoodSupplier());
	}
}