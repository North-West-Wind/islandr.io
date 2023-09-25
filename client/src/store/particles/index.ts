import { MinParticle } from "../../types/minimized";
import { DummyParticle } from "../../types/particle";
import { ParticleSupplier } from "../../types/supplier";

export const PARTICLE_SUPPLIERS = new Map<string, ParticleSupplier>();

export { default as Wood } from "./wood";
export { default as Ripple } from "./ripple";

export function castParticle(minParticle: MinParticle) {
	return PARTICLE_SUPPLIERS.get(minParticle.id)?.create(minParticle) || new DummyParticle(minParticle);
}