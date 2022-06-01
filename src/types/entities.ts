import { MAP_SIZE } from "../constants";

class Entity {
	x: number;
	y: number;
	vx: number = 0;
	vy: number = 0;

	constructor() {
		this.x = Math.random() * MAP_SIZE[0];
		this.y = Math.random() * MAP_SIZE[1];
	}

	tick() {
		this.x += this.vx;
		this.y += this.vy;
	}
}

export class Player extends Entity {
	id: string;

	constructor(id: string) {
		super();
		this.id = id;
	}
}

export class Bullet extends Entity {
	
}