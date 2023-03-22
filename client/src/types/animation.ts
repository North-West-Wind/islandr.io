import { Vec2 } from "./math";

// Data about animations
export interface Animation {
	id: string;
	duration: number;
}

// Defined animation path
export class DefinedAnimation {
	id: string;
	positions: Vec2[];
	rotations: Vec2[];
	keyframes: number[];
	// Animation duration, in milliseconds
	duration: number;

	constructor(id: string, positions: Vec2[], rotations: Vec2[], keyframes: number[], duration: number) {
		this.id = id;
		this.positions = positions;
		this.rotations = rotations;
		this.keyframes = keyframes;
		this.duration = duration;
	}
}