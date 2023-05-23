import { Vec2 } from "./math";
import { Obstacle } from "./obstacle";

export default class Building {
	// Center of the building
	position = Vec2.ZERO;
	// "position" here is the relative position of the obstacle towards the center of the building
	obstacles: { obstacle: Obstacle, position: Vec2 }[] = [];

	addObstacle(position: Vec2, obstacle: Obstacle) {
		this.obstacles.push({ position, obstacle });
	}

	setPosition(position: Vec2) {
		this.position = position;
		for (const ob of this.obstacles)
			ob.obstacle.position = this.position.addVec(ob.position);
	}
}