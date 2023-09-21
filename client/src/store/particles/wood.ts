import { PARTICLE_SUPPLIERS } from ".";
import { MinParticle } from "../../types/minimized";
import { FadeParticle, Particle, TextureFadeParticle } from "../../types/particle";
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
	static readonly TYPE = "wood";
	type = Wood.TYPE;
	texture = "wood";

	static {
		PARTICLE_SUPPLIERS.set(Wood.TYPE, new WoodSupplier());
	}
}