import { Vec2 } from "./math";
import { MinParticle } from "./minimized";

export class Particle {
	id: string;
	position: Vec2;

	constructor(id: string, position: Vec2) {
		this.id = id;
		this.position = position;
	}

	minimize() {
		return <MinParticle> { id: this.id, position: this.position.minimize() };
	}
}