import { PARTICLE_SUPPLIERS } from ".";
import { MinParticle } from "../../types/minimized";
import { GrowFadeParticle } from "../../types/particle";
import { ParticleSupplier } from "../../types/supplier";

class RippleSupplier implements ParticleSupplier {
	create(minParticle: MinParticle) {
		return new Ripple(minParticle);
	}
}

export default class Ripple extends GrowFadeParticle {
	static readonly ID = "ripple";
	id = Ripple.ID;

	constructor(minParticle: MinParticle) {
		super(Object.assign(minParticle, { duration: 1000, fadeStart: 1000, color: 0x7ec8ea, growSpeed: 1 }));
	}

	static {
		PARTICLE_SUPPLIERS.set(Ripple.ID, new RippleSupplier());
	}
}