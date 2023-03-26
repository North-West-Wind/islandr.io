import * as fs from "fs";
import { clamp, ID } from "../utils";
import { CircleHitbox, Hitbox, Line, RectHitbox, Vec2 } from "./math";
import { Obstacle } from "./obstacle";
import { Weapon } from "./weapon";
import { WEAPON_SUPPLIERS } from "../store/weapons";
import { MinEntity, MinInventory } from "./minimized";
import { CollisionType, GunColor } from "./misc";
import { world } from "..";
import { PUSH_THRESHOLD } from "../constants";

export class Inventory {
	// Maximum amount of things.
	static maxAmmos: number[][];
	static maxUtilities: Map<string, number>[];

	holding: number;
	weapons: Weapon[];
	// Array of 2 numbers. Order: gun slots, melee slots
	slots: number[];
	// Indices are colors. Refer to GunColor
	ammos: number[];
	// Utilities. Maps ID to amount of util.
	utilities: Map<string, number>;
	backpackLevel = 0;

	constructor(holding: number, slots: number[], weapons?: Weapon[], ammos?: number[], utilities?: Map<string, number>) {
		this.holding = holding;
		this.slots = slots;
		this.weapons = weapons || Array(slots.reduce((a, b) => a + b));
		this.ammos = ammos || Array(Object.keys(GunColor).length / 2).fill(0);
		this.utilities = utilities || new Map();
	}

	static {
		this.maxAmmos = JSON.parse(fs.readFileSync("../data/amount/ammos.json", { encoding: "utf8" }));
		this.maxUtilities = (<any[]>JSON.parse(fs.readFileSync("../data/amount/throwables.json", { encoding: "utf8" }))).map(x => new Map(Object.entries(x)));
	}

	getWeapon(index = -1) {
		if (index < 0) index = this.holding;
		if (index < this.weapons.length) return this.weapons[index];
		const util = Object.keys(this.utilities)[index - this.weapons.length];
		if (this.utilities.get(util)) return WEAPON_SUPPLIERS.get(util)!.create();
		return undefined;
	}

	setWeapon(weapon: Weapon, index = -1) {
		if (index < 0) index = this.holding;
		if (index < this.weapons.length) this.weapons[index] = weapon;
	}

	minimize() {
		if(!this.getWeapon()){
			console.log(this.weapons)
			//this.holding = 0;
		}
		return <MinInventory> { holding: this.weapons[this.holding].minimize(), backpackLevel: this.backpackLevel };
		//If the player isn't holding anything no need to minimize it
	}

	static defaultEmptyInventory() {
		const inv = new Inventory(2, [2, 1]);
		inv.weapons[2] = WEAPON_SUPPLIERS.get("fists")!.create();
		return inv;
	}
}

export class Entity {
	id: string;
	type = "";
	position: Vec2;
	velocity: Vec2 = Vec2.ZERO;
	direction: Vec2 = Vec2.UNIT_X;
	hitbox: Hitbox = CircleHitbox.ZERO;
	noCollision = false;
	collisionLayers = [-1]; // -1 means on all layers
	vulnerable = true;
	health = 100;
	maxHealth = 100;
	// If airborne, no effect from terrain
	airborne = false;
	// If discardable, will be removed from memory when despawn
	discardable = false;
	despawn = false;
	// Tells the client what animation should play
	animations: string[] = [];

	constructor() {
		this.id = ID();
		// Currently selects a random position to spawn. Will change in the future.
		this.position = world.size.scale(Math.random(), Math.random());
	}

	tick(_entities: Entity[], _obstacles: Obstacle[]) {
		// Add the velocity to the position, and cap it at map size.
		if (this.airborne)
			this.position = this.position.addVec(this.velocity);
		else {
			const terrain = world.terrainAtPos(this.position);
			this.position = this.position.addVec(this.velocity.scaleAll(terrain.speed));
			// Also handle terrain damage
			if (terrain.damage != 0 && !(world.ticks % terrain.interval))
				this.damage(terrain.damage);
		}
		this.position = new Vec2(clamp(this.position.x, this.hitbox.comparable, world.size.x - this.hitbox.comparable), clamp(this.position.y, this.hitbox.comparable, world.size.y - this.hitbox.comparable));

		// Check health and maybe call death
		if (this.vulnerable && this.health <= 0) this.die();
	}

	setVelocity(velocity: Vec2) {
		this.velocity = velocity;
	}

	setDirection(direction: Vec2) {
		this.direction = direction.unit();
	}

	// Hitbox collision check
	collided(thing: Entity | Obstacle) {
		if (this.id == thing.id || this.despawn) return CollisionType.NONE;
		if (!this.collisionLayers.includes(-1) && !thing.collisionLayers.includes(-1) && !this.collisionLayers.some(layer => thing.collisionLayers.includes(layer))) return CollisionType.NONE;
		if (this.position.distanceTo(thing.position) > this.hitbox.comparable + thing.hitbox.comparable) return CollisionType.NONE;
		// For circle it is distance < sum of radii
		if (this.hitbox.type === "circle" && thing.hitbox.type === "circle") return this.position.addVec(thing.position.inverse()).magnitudeSqr() < Math.pow((<CircleHitbox>this.hitbox).radius + (<CircleHitbox>thing.hitbox).radius, 2) ? CollisionType.CIRCLE_CIRCLE : CollisionType.NONE;
		else if (this.hitbox.type === "rect" && thing.hitbox.type === "rect") {
			// https://math.stackexchange.com/questions/1278665/how-to-check-if-two-rectangles-intersect-rectangles-can-be-rotated
			// Using the last answer
			const thisStartingPoint = this.position.addVec(new Vec2(-(<RectHitbox>this.hitbox).width / 2, -(<RectHitbox>this.hitbox).height / 2).addAngle(this.direction.angle()));
			const thingStartingPoint = this.position.addVec(new Vec2(-(<RectHitbox>thing.hitbox).width / 2, -(<RectHitbox>thing.hitbox).height / 2).addAngle(thing.direction.angle()));
			const thisPoints = [
				thisStartingPoint,
				thisStartingPoint.addVec(new Vec2((<RectHitbox>this.hitbox).width, 0).addAngle(this.direction.angle())),
				thisStartingPoint.addVec(new Vec2(0, (<RectHitbox>this.hitbox).height).addAngle(this.direction.angle())),
				thisStartingPoint.addVec(new Vec2((<RectHitbox>this.hitbox).width, (<RectHitbox>this.hitbox).height).addAngle(this.direction.angle()))
			];
			const thingPoints = [
				thingStartingPoint,
				thingStartingPoint.addVec(new Vec2((<RectHitbox>thing.hitbox).width, 0).addAngle(thing.direction.angle())),
				thingStartingPoint.addVec(new Vec2(0, (<RectHitbox>thing.hitbox).height).addAngle(thing.direction.angle())),
				thingStartingPoint.addVec(new Vec2((<RectHitbox>thing.hitbox).width, (<RectHitbox>thing.hitbox).height).addAngle(thing.direction.angle()))
			];
			var results: boolean[] = Array(4);
			var ii: number;

			const thisVecs = [
				new Vec2((<RectHitbox>this.hitbox).width, 0).addAngle(this.direction.angle()),
				new Vec2(0, (<RectHitbox>this.hitbox).height).addAngle(this.direction.angle())
			];

			const thingVecs = [
				new Vec2((<RectHitbox>thing.hitbox).width, 0).addAngle(thing.direction.angle()),
				new Vec2(0, (<RectHitbox>thing.hitbox).height).addAngle(thing.direction.angle())
			];

			for (const mainVec of thisVecs) {
				const mainMagSqr = mainVec.magnitudeSqr();
				for (ii = 0; ii < thingPoints.length; ii++)
					results[ii] = thingPoints[ii].addVec(thisStartingPoint.inverse()).dot(mainVec) < 0 || thingPoints[ii].addVec(thisStartingPoint.inverse()).projectTo(mainVec).magnitudeSqr() > mainMagSqr;
				if (results.every(x => x)) return CollisionType.NONE;
			}

			for (const mainVec of thingVecs) {
				const mainMagSqr = mainVec.magnitudeSqr();
				for (ii = 0; ii < thisPoints.length; ii++)
					results[ii] = thisPoints[ii].addVec(thisStartingPoint.inverse()).dot(mainVec) < 0 || thisPoints[ii].addVec(thisStartingPoint.inverse()).projectTo(mainVec).magnitudeSqr() > mainMagSqr;
				if (results.every(x => x)) return CollisionType.NONE;
			}

			return CollisionType.RECT_RECT;
		} else {
			// https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
			// Using the chosen answer
			// EDIT: I don't even know if this is the same answer anymore
			var circle: { hitbox: CircleHitbox, position: Vec2, direction: Vec2 };
			var rect: { hitbox: RectHitbox, position: Vec2, direction: Vec2 };
			if (this.hitbox.type === "circle") {
				circle = { hitbox: <CircleHitbox>this.hitbox, position: this.position, direction: this.direction };
				rect = { hitbox: <RectHitbox>thing.hitbox, position: thing.position, direction: thing.direction };
			} else {
				circle = { hitbox: <CircleHitbox>thing.hitbox, position: thing.position, direction: thing.direction };
				rect = { hitbox: <RectHitbox>this.hitbox, position: this.position, direction: this.direction };
			}
			const rectStartingPoint = rect.position.addVec(new Vec2(-rect.hitbox.width / 2, -rect.hitbox.height / 2).addAngle(rect.direction.angle()));

			const rectPoints = [
				rectStartingPoint,
				rectStartingPoint.addVec(new Vec2(rect.hitbox.width, 0).addAngle(rect.direction.angle())),
				rectStartingPoint.addVec(new Vec2(rect.hitbox.width, rect.hitbox.height).addAngle(rect.direction.angle())),
				rectStartingPoint.addVec(new Vec2(0, rect.hitbox.height).addAngle(rect.direction.angle()))
			];

			if (this.pointInRect(rectPoints[0], rectPoints[1], rectPoints[2], rectPoints[3], circle.position)) return CollisionType.CIRCLE_RECT_CENTER_INSIDE;

			for (let ii = 0; ii < rectPoints.length; ii++)
				if (rectPoints[ii].addVec(circle.position.inverse()).magnitudeSqr() < Math.pow(circle.hitbox.radius, 2))
					return CollisionType.CIRCLE_RECT_POINT_INSIDE;

			for (let ii = 0; ii < rectPoints.length; ii++) {
				if (circle.hitbox.lineIntersects(new Line(rectPoints[ii], rectPoints[(ii + 1) % rectPoints.length]), circle.position))
					return CollisionType.CIRCLE_RECT_LINE_INSIDE;
			}

			return CollisionType.NONE;
		}
	}

	damage(dmg: number) {
		if (!this.vulnerable) return;
		this.health -= dmg;
	}

	die() {
		this.despawn = true;
		this.health = 0;
	}

	minimize() {
		return <MinEntity> {
			id: this.id,
			type: this.type,
			position: this.position.minimize(),
			direction: this.direction.minimize(),
			hitbox: this.hitbox.minimize(),
			animations: this.animations,
			despawn: this.despawn
		}
	}

	private isLeft(a: Vec2, b: Vec2, c: Vec2) {
		return ((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y));
	}

	private pointInRect(a: Vec2, b: Vec2, c: Vec2, d: Vec2, p: Vec2) {
		return (this.isLeft(a, b, p) > 0 && this.isLeft(b, c, p) > 0 && this.isLeft(c, d, p) > 0 && this.isLeft(d, a, p) > 0);
	}

	protected handleCircleCircleCollision(obstacle: Obstacle) {
		const relative = this.position.addVec(obstacle.position.inverse());
		this.position = obstacle.position.addVec(relative.scaleAll((obstacle.hitbox.comparable + this.hitbox.comparable) / relative.magnitude()));
	}

	protected handleCircleRectCenterCollision(obstacle: Obstacle) {
		const rectVecs = [
			new Vec2((<RectHitbox>obstacle.hitbox).width, 0).addAngle(obstacle.direction.angle()),
			new Vec2(0, (<RectHitbox>obstacle.hitbox).height).addAngle(obstacle.direction.angle())
		];
		const centerToCenter = this.position.addVec(obstacle.position.inverse());
		/* In the order of right up left down
		 * Think of the rectangle as vectors
		 *       up vec0
		 *      +------->
		 *      |
		 * left |        right
		 * vec1 |
		 *      v
		 *         down
		 */
		const horiProject = centerToCenter.projectTo(rectVecs[0]);
		const vertProject = centerToCenter.projectTo(rectVecs[1]);
		// Distances between center and each side
		const distances = [
			rectVecs[0].scaleAll(0.5).addVec(horiProject.inverse()),
			rectVecs[1].scaleAll(-0.5).addVec(vertProject.inverse()),
			rectVecs[0].scaleAll(-0.5).addVec(horiProject.inverse()),
			rectVecs[1].scaleAll(0.5).addVec(vertProject.inverse())
		];
		var shortestIndex = 0;
		for (let ii = 1; ii < distances.length; ii++)
			if (distances[ii].magnitudeSqr() < distances[shortestIndex].magnitudeSqr())
				shortestIndex = ii;

		this.position = this.position.addVec(distances[shortestIndex]).addVec(distances[shortestIndex].unit().scaleAll(this.hitbox.comparable));
	}

	protected handleCircleRectPointCollision(obstacle: Obstacle) {
		const rectStartingPoint = obstacle.position.addVec(new Vec2(-(<RectHitbox>obstacle.hitbox).width / 2, -(<RectHitbox>obstacle.hitbox).height / 2).addAngle(obstacle.direction.angle()));
		const rectPoints = [
			rectStartingPoint,
			rectStartingPoint.addVec(new Vec2((<RectHitbox>obstacle.hitbox).width, 0).addAngle(obstacle.direction.angle())),
			rectStartingPoint.addVec(new Vec2((<RectHitbox>obstacle.hitbox).width, (<RectHitbox>obstacle.hitbox).height).addAngle(obstacle.direction.angle())),
			rectStartingPoint.addVec(new Vec2(0, (<RectHitbox>obstacle.hitbox).height).addAngle(obstacle.direction.angle()))
		];
		const intersections = Array(rectPoints.length).fill(false);
		var counts = 0
		for (let ii = 0; ii < rectPoints.length; ii++)
			if (rectPoints[ii].distanceSqrTo(this.position) <= this.hitbox.comparable) {
				intersections[ii] = true;
				counts++;
			}
		if (counts == 2) return this.handleCircleRectLineCollision(obstacle);
		var sum = 0;
		for (let ii = 0; ii < intersections.length; ii++)
			if (intersections[ii])
				sum += ii;
		const index = sum / counts;
		const adjacents = [
			rectPoints[((index - 1) < 0 ? rectPoints.length : index) - 1],
			rectPoints[index],
			rectPoints[(index + 1) % rectPoints.length]
		];
		const vecs = [
			adjacents[1].addVec(adjacents[0].inverse()),
			adjacents[2].addVec(adjacents[1].inverse())
		];

		for (let ii = 0; ii < vecs.length; ii++) {
			const distance = new Line(adjacents[ii], adjacents[ii+1]).distanceTo(this.position);
			this.position = this.position.addVec(vecs[ii].perpendicular().unit().scaleAll(this.hitbox.comparable - distance));
		}
	}

	protected handleCircleRectLineCollision(obstacle: Obstacle) {
		const rectStartingPoint = obstacle.position.addVec(new Vec2(-(<RectHitbox>obstacle.hitbox).width / 2, -(<RectHitbox>obstacle.hitbox).height / 2).addAngle(obstacle.direction.angle()));
		const rectPoints = [
			rectStartingPoint,
			rectStartingPoint.addVec(new Vec2((<RectHitbox>obstacle.hitbox).width, 0).addAngle(obstacle.direction.angle())),
			rectStartingPoint.addVec(new Vec2((<RectHitbox>obstacle.hitbox).width, (<RectHitbox>obstacle.hitbox).height).addAngle(obstacle.direction.angle())),
			rectStartingPoint.addVec(new Vec2(0, (<RectHitbox>obstacle.hitbox).height).addAngle(obstacle.direction.angle()))
		];
		const distances: number[] = Array(rectPoints.length);
		const vecs: Vec2[] = Array(rectPoints.length);
		for (let ii = 0; ii < rectPoints.length; ii++) {
			const point1 = rectPoints[ii], point2 = rectPoints[(ii + 1) % rectPoints.length];
			vecs[ii] = point2.addVec(point1.inverse());
			distances[ii] = new Line(point1, point2).distanceTo(this.position);
		}
		var shortestIndex = 0;
		for (let ii = 1; ii < distances.length; ii++)
			if (distances[ii] < distances[shortestIndex])
				shortestIndex = ii;
		
		const push = vecs[shortestIndex].perpendicular().unit().scaleAll(this.hitbox.comparable - distances[shortestIndex]);
		if (Math.abs(push.y) < PUSH_THRESHOLD && Math.abs(push.x) < PUSH_THRESHOLD) return;
		this.position = this.position.addVec(push);
	}
}

