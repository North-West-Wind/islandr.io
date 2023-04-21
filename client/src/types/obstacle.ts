import { Player } from "../store/entities";
import { CircleHitbox, Hitbox, RectHitbox, Vec2 } from "./math";
import { MinCircleHitbox, MinObstacle, MinRectHitbox } from "./minimized";
import { Renderable, RenderableMap } from "./extenstions";
import { DEFINED_ANIMATIONS } from "../store/animations";
import { Animation } from "./animation";

// Obstacles inside the game
export abstract class Obstacle implements Renderable, RenderableMap {
	id!: string;
	type!: string;
	position!: Vec2;
	direction!: Vec2;
	hitbox!: Hitbox;
	despawn!: boolean;
	animations: Animation[] = [];
	zIndex = 0;

	constructor(minObstacle: MinObstacle) {
		this.copy(minObstacle);
	}

	copy(minObstacle: MinObstacle) {
		this.id = minObstacle.id;
		this.type = minObstacle.type;
		this.position = new Vec2(minObstacle.position.x, minObstacle.position.y);
		this.direction = new Vec2(minObstacle.direction.x, minObstacle.direction.y);
		if (minObstacle.hitbox.type === "rect") {
			const rect = <MinRectHitbox> minObstacle.hitbox;
			this.hitbox = new RectHitbox(rect.width, rect.height);
		} else {
			const circle = <MinCircleHitbox> minObstacle.hitbox;
			this.hitbox = new CircleHitbox(circle.radius);
		}
		this.despawn = minObstacle.despawn;
		for (const anim of minObstacle.animations)
			if (DEFINED_ANIMATIONS.has(anim))
				this.animations.push({ id: anim, duration: DEFINED_ANIMATIONS.get(anim)!.duration });
		if (this.despawn) this.zIndex = 0;
	}

	abstract render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;

	abstract renderMap(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;

	renderTick(time: number) {
		const removable: number[] = [];
		for (let ii = 0; ii < this.animations.length; ii++) {
			this.animations[ii].duration -= time;
			if (this.animations[ii].duration <= 0)
				removable.push(ii);
		}
		for (let ii = removable.length - 1; ii >= 0; ii--)
			this.animations.splice(removable[ii], 1);
	}
}

// Dummy obstacle for default casting
export class DummyObstacle extends Obstacle {
	render(_you: Player, _canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number) { }
	renderMap(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number) { }
}