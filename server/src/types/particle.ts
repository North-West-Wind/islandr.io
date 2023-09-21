import { Vec2 } from "./math";
import { MinParticle } from "./minimized";

export class Particle {
	id: string;
	position: Vec2;
	size: number;

	constructor(id: string, position: Vec2, size: number) {
		this.id = id;
		this.position = position;
		this.size = size;
	}

	minimize() {
		return <MinParticle> { id: this.id, position: this.position.minimize(), size: this.size };
	}
}