import { MAP_SIZE } from "../constants";
import { clamp } from "../utils";
import { CircleHitbox, Hitbox, RectHitbox, Vec2 } from "./maths";
import { GameObject } from "./objects";
import { Weapon } from "./weapons";
import { Fists } from "../store/weapons";
import { MinEntity, MinInventory } from "./minimized";

export interface Animation {
	name: string;
	duration: number;
}

export class Inventory {
	holding: number;
	weapons: Weapon[];
	slots: number;

	constructor(holding: number, slots: number, weapons?: Weapon[]) {
		this.holding = holding;
		this.slots = slots;
		this.weapons = weapons || Array(slots);
	}

	minimize() {
		return <MinInventory> { holding: this.weapons[this.holding].minimize() };
	}
}

export const DEFAULT_EMPTY_INVENTORY = new Inventory(2, 4);
DEFAULT_EMPTY_INVENTORY.weapons[2] = new Fists();

export class Entity {
	type: string = "";
	position: Vec2;
	velocity: Vec2 = Vec2.ZERO;
	direction: Vec2 = Vec2.ONE;
	hitbox: Hitbox = CircleHitbox.ZERO;
	vulnerable = true;
	health: number = 100;
	maxHealth: number = 100;
	discardable = false;
	despawn = false;
	// Tells the client which animation is going on
	animation: Animation = { name: "", duration: 0 };

	constructor() {
		// Currently selects a random position to spawn. Will change in the future.
		this.position = new Vec2((Math.random() + 1) * MAP_SIZE[0] / 2, (Math.random() + 1) * MAP_SIZE[1] / 2);
	}

	tick(_entities: Entity[], _objects: GameObject[]) {
		// Add the velocity to the position, and cap it at map size.
		this.position = this.position.addVec(this.velocity);
		this.position = new Vec2(clamp(this.position.x, 0, MAP_SIZE[0]), clamp(this.position.y, 0, MAP_SIZE[1]));

		if (this.animation.name) {
			if (this.animation.duration > 0) this.animation.duration--;
			else this.animation.name = "";
		}

		if (this.vulnerable && this.health <= 0) this.die();
	}

	setVelocity(velocity: Vec2) {
		this.velocity = velocity;
	}

	setDirection(direction: Vec2) {
		this.direction = direction.unit();
	}

	// Hitbox collision check
	collided(thing: Entity | GameObject) {
		// For circle it is distance < sum of radii
		if (this.hitbox.type === "circle" && thing.hitbox.type === "circle") return this.position.addVec(thing.position.inverse()).magnitudeSqr() < Math.pow((<CircleHitbox>this.hitbox).radius + (<CircleHitbox>thing.hitbox).radius, 2);
		else if (this.hitbox.type === "rect" && thing.hitbox.type === "rect") {
			// https://math.stackexchange.com/questions/1278665/how-to-check-if-two-rectangles-intersect-rectangles-can-be-rotated
			// Using the last answer
			const thisStartingPoint = this.position.addVec(new Vec2(-(<RectHitbox>this.hitbox).width / 2, -(<RectHitbox>this.hitbox).height).addAngle(this.direction.angle()));
			const thingStartingPoint = this.position.addVec(new Vec2(-(<RectHitbox>thing.hitbox).width / 2, -(<RectHitbox>thing.hitbox).height).addAngle(thing.direction.angle()));
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
				if (results.every(x => x)) return false;
			}

			for (const mainVec of thingVecs) {
				const mainMagSqr = mainVec.magnitudeSqr();
				for (ii = 0; ii < thisPoints.length; ii++)
					results[ii] = thisPoints[ii].addVec(thisStartingPoint.inverse()).dot(mainVec) < 0 || thisPoints[ii].addVec(thisStartingPoint.inverse()).projectTo(mainVec).magnitudeSqr() > mainMagSqr;
				if (results.every(x => x)) return false;
			}

			return true;
		} else {
			// https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
			// Using the chosen answer
			if (this.hitbox.type === "circle") return check(this, thing);
			else return check(thing, this);
			function check(circle: Entity | GameObject, rect: Entity | GameObject) {
				const rectStartingPoint = rect.position.addVec(new Vec2(-(<RectHitbox>rect.hitbox).width / 2, -(<RectHitbox>rect.hitbox).height).addAngle(rect.direction.angle()));
				const rectVecs = [
					new Vec2((<RectHitbox>rect.hitbox).width, 0).addAngle(rect.direction.angle()),
					new Vec2(0, (<RectHitbox>rect.hitbox).height).addAngle(rect.direction.angle())
				];

				const ap = circle.position.addVec(rectStartingPoint.inverse());
				const apab2 = ap.magnitudeSqr() * rectVecs[0].magnitudeSqr();
				const abab2 = Math.pow(rectVecs[0].magnitudeSqr(), 2);
				const apad2 = ap.magnitudeSqr() * rectVecs[1].magnitudeSqr();
				const adad2 = Math.pow(rectVecs[1].magnitudeSqr(), 2);
				if (0 <= apab2 && apab2 <= abab2 && 0 <= apad2 && apad2 <= adad2) return true;

				/*if (
					!(circle.position.addVec(rectStartingPoint.inverse()).dot(rectVecs[0]) < 0 || circle.position.addVec(rectStartingPoint.inverse()).projectTo(rectVecs[0]).magnitudeSqr() > rectVecs[0].magnitudeSqr())
					&&
					!(circle.position.addVec(rectStartingPoint.inverse()).dot(rectVecs[1]) < 0 || circle.position.addVec(rectStartingPoint.inverse()).projectTo(rectVecs[1]).magnitudeSqr() > rectVecs[1].magnitudeSqr())
				) return true;

				const rectPoints = [
					rectStartingPoint,
					rectStartingPoint.addVec(new Vec2((<RectHitbox>rect.hitbox).width, 0).addAngle(rect.direction.angle())),
					rectStartingPoint.addVec(new Vec2(0, (<RectHitbox>rect.hitbox).height).addAngle(rect.direction.angle())),
					rectStartingPoint.addVec(new Vec2((<RectHitbox>rect.hitbox).width, (<RectHitbox>rect.hitbox).height).addAngle(rect.direction.angle()))
				];

				for (const point of rectPoints)
					if (point.addVec(circle.position.inverse()).magnitudeSqr() < Math.pow((<CircleHitbox>circle.hitbox).radius, 2))
						return true;*/
				
				const centerToCenter = circle.position.addVec(rect.position.inverse());
				if (
					centerToCenter.projectTo(rectVecs[0]).magnitude() - rectVecs[0].scaleAll(0.5).magnitude() < (<CircleHitbox>circle.hitbox).radius
					&&
					centerToCenter.projectTo(rectVecs[1]).magnitude() - rectVecs[1].scaleAll(0.5).magnitude() < (<CircleHitbox>circle.hitbox).radius
				) return true;
				
				return false;
			}
		}
	}

	damage(dmg: number) {
		if (!this.vulnerable) return;
		this.health -= dmg;
	}

	die() {
		this.despawn = true;
	}

	minimize() {
		return <MinEntity> {
			position: this.position.minimize(),
			direction: this.direction.minimize(),
			hitbox: this.hitbox.minimize(),
			animation: this.animation,
			despawn: this.despawn
		}
	}
}

