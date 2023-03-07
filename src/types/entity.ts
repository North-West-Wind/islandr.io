import { clamp, ID } from "../utils";
import { CircleHitbox, Hitbox, Line, RectHitbox, Vec2 } from "./math";
import { Obstacle } from "./obstacle";
import { Weapon } from "./weapon";
import { Fists } from "../store/weapons";
import { MinEntity, MinInventory } from "./minimized";
import { CollisionType, GunColor } from "./misc";
import { world } from "..";

export class Inventory {
	holding: number;
	weapons: Weapon[];
	// Array of 2 numbers. Order: gun slots, melee slots
	slots: number[];
	// Indices are colors. Refer to GunColor
	ammos: number[];
	// Utilities. Similar working to ammos, but yet to be implemented
	utilities: number[];

	constructor(holding: number, slots: number[], weapons?: Weapon[], ammos?: number[], utilities?: number[]) {
		this.holding = holding;
		this.slots = slots;
		this.weapons = weapons || Array(slots.reduce((a, b) => a + b));
		this.ammos = ammos || Array(Object.keys(GunColor).length / 2).fill(0);
		this.utilities = utilities || []; // TODO: Use a utility enum to generate 0s
	}

	minimize() {
		return <MinInventory> { holding: this.weapons[this.holding].minimize() };
	}

	static defaultEmptyInventory() {
		const inv = new Inventory(2, [2, 1]);
		inv.weapons[2] = new Fists();
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
	collided(hitbox: Hitbox, position: Vec2, direction: Vec2) {
		if (this.despawn) return CollisionType.NONE;
		if (this.position.distanceTo(position) > this.hitbox.comparable + hitbox.comparable) return CollisionType.NONE;
		// For circle it is distance < sum of radii
		if (this.hitbox.type === "circle" && hitbox.type === "circle") return this.position.addVec(position.inverse()).magnitudeSqr() < Math.pow((<CircleHitbox>this.hitbox).radius + (<CircleHitbox>hitbox).radius, 2) ? CollisionType.CIRCLE_CIRCLE : CollisionType.NONE;
		else if (this.hitbox.type === "rect" && hitbox.type === "rect") {
			// https://math.stackexchange.com/questions/1278665/how-to-check-if-two-rectangles-intersect-rectangles-can-be-rotated
			// Using the last answer
			const thisStartingPoint = this.position.addVec(new Vec2(-(<RectHitbox>this.hitbox).width / 2, -(<RectHitbox>this.hitbox).height / 2).addAngle(this.direction.angle()));
			const thingStartingPoint = this.position.addVec(new Vec2(-(<RectHitbox>hitbox).width / 2, -(<RectHitbox>hitbox).height / 2).addAngle(direction.angle()));
			const thisPoints = [
				thisStartingPoint,
				thisStartingPoint.addVec(new Vec2((<RectHitbox>this.hitbox).width, 0).addAngle(this.direction.angle())),
				thisStartingPoint.addVec(new Vec2(0, (<RectHitbox>this.hitbox).height).addAngle(this.direction.angle())),
				thisStartingPoint.addVec(new Vec2((<RectHitbox>this.hitbox).width, (<RectHitbox>this.hitbox).height).addAngle(this.direction.angle()))
			];
			const thingPoints = [
				thingStartingPoint,
				thingStartingPoint.addVec(new Vec2((<RectHitbox>hitbox).width, 0).addAngle(direction.angle())),
				thingStartingPoint.addVec(new Vec2(0, (<RectHitbox>hitbox).height).addAngle(direction.angle())),
				thingStartingPoint.addVec(new Vec2((<RectHitbox>hitbox).width, (<RectHitbox>hitbox).height).addAngle(direction.angle()))
			];
			var results: boolean[] = Array(4);
			var ii: number;

			const thisVecs = [
				new Vec2((<RectHitbox>this.hitbox).width, 0).addAngle(this.direction.angle()),
				new Vec2(0, (<RectHitbox>this.hitbox).height).addAngle(this.direction.angle())
			];

			const thingVecs = [
				new Vec2((<RectHitbox>hitbox).width, 0).addAngle(direction.angle()),
				new Vec2(0, (<RectHitbox>hitbox).height).addAngle(direction.angle())
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
				rect = { hitbox: <RectHitbox>hitbox, position, direction };
			} else {
				circle = { hitbox: <CircleHitbox>hitbox, position, direction };
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
}

