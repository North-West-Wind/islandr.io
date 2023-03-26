import { world } from "../..";
import { CircleHitbox } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { randomBetween } from "../../utils";
import { Entity } from "../../types/entity";
export default class Barrel extends Obstacle {
	type = "barrel";
	madePlayerDie = false;

	constructor() {
		const salt = randomBetween(0.9, 1.1);
		super(world, new CircleHitbox(2).scaleAll(salt), new CircleHitbox(1.5).scaleAll(salt), 250, 250);
		while (world.terrainAtPos(this.position).id != "plain" || world.obstacles.find(obstacle => obstacle.collided(this))) this.position = world.size.scale(Math.random(), Math.random());
	}
	tick(entities: Entity[]) {
		// Iterate through entities
		for (const entity of entities) {
			// Check for collision and type
			if (entity.collided(this) && entity.type === "player" && this.health === 0 && this.madePlayerDie === false) {
				// Damage the entity
				entity.damage(100);
				this.madePlayerDie = true;
			}
		}
	}
}