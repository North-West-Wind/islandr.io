import * as fs from "fs";
import { clamp, ID } from "../utils";
import { CircleHitbox, Hitbox, Line, RectHitbox, Vec2 } from "./math";
import { Obstacle } from "./obstacle";
import { Weapon } from "./weapon";
import { WEAPON_SUPPLIERS } from "../store/weapons";
import { MinEntity, MinInventory } from "./minimized";
import { CollisionType, CountableString, GunColor } from "./misc";
import { world } from "..";
import { PUSH_THRESHOLD } from "../constants";
import { Player } from "../store/entities";

export class Inventory {
	// Maximum amount of things.
	static maxAmmos: number[][];
	static maxUtilities: Map<string, number>[];
	static maxHealings: Map<string, number>[];

	holding: number;
	weapons: Weapon[];
	// Indices are colors. Refer to GunColor
	ammos: number[];
	// Utilities. Maps ID to amount of util.
	utilities: CountableString;
	utilOrder = new Set<string>();
	healings: CountableString;
	backpackLevel = 0;
	vestLevel = 0;
	helmetLevel = 0;
	scopes = [1];
	selectedScope = 1;

	constructor(holding: number, weapons?: Weapon[], ammos?: number[], utilities: CountableString = {}, healings: CountableString = {}) {
		this.holding = holding;
		// Hardcoding slots
		this.weapons = weapons || Array(4);
		this.ammos = ammos || Array(Object.keys(GunColor).length / 2).fill(0);
		this.utilities = utilities;
		this.healings = healings;
	}

	static {
		this.maxAmmos = JSON.parse(fs.readFileSync("../data/amount/ammos.json", { encoding: "utf8" }));
		this.maxUtilities = (<any[]>JSON.parse(fs.readFileSync("../data/amount/throwables.json", { encoding: "utf8" }))).map(x => new Map(Object.entries(x)));
		this.maxHealings = (<any[]>JSON.parse(fs.readFileSync("../data/amount/healings.json", { encoding: "utf8" }))).map(x => new Map(Object.entries(x)));
	}

	getWeapon(index = -1) {
		if (index < 0) index = this.holding;
		if (index < this.weapons.length) return this.weapons[index];
		const util = Object.keys(this.utilities)[index - this.weapons.length];
		if (this.utilities[util]) return WEAPON_SUPPLIERS.get(util)!.create();
		return undefined;
	}

	setWeapon(weapon: Weapon, index = -1) {
		if (index < 0) index = this.holding;
		if (index < 3) {this.weapons[index] = weapon; }
	}

	fourthSlot() {
		const util = Array.from(this.utilOrder)[0];
		if (this.utilities[util]) this.weapons[3] = WEAPON_SUPPLIERS.get(util)!.create();
	}

	addScope(scope: number) {
		if (this.scopes.includes(scope)) return false;
		this.scopes.push(scope);
		this.scopes = this.scopes.sort();
		if (this.selectedScope < scope) this.selectScope(scope);
		return true;
	}

	selectScope(scope: number) {
		if (!this.scopes.includes(scope)) return;
		this.selectedScope = scope;
	}

	minimize() {
		return <MinInventory> { holding: this.weapons[this.holding].minimize(), backpackLevel: this.backpackLevel, vestLevel: this.vestLevel, helmetLevel: this.helmetLevel };
		//If the player isn't holding anything no need to minimize it
	}

	static defaultEmptyInventory() {
		const inv = new Inventory(2);
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
	interactable = false;
	// Tells the client what animation should play
	animations: string[] = [];
	repelExplosions = false;
	dirty = true;
	potentialKiller?: string;
	// Particle type to emit when damaged
	damageParticle?: string;

	constructor() {
		this.id = ID();
		// Currently selects a random position to spawn. Will change in the future.
		this.position = world.size.scale(Math.random(), Math.random());
	}

	tick(_entities: Entity[], _obstacles: Obstacle[]) {
		const lastPosition = this.position;
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

		if (this.position != lastPosition) this.markDirty();

		// Check health and maybe call death
		if (this.vulnerable && this.health <= 0) this.die();
	}

	setVelocity(velocity: Vec2) {
		this.velocity = velocity;
		this.markDirty();
	}

	setDirection(direction: Vec2) {
		this.direction = direction.unit();
		this.markDirty();
	}

	// Hitbox collision check
	collided(thing: Entity | Obstacle) {
		if (this.id == thing.id || this.despawn) return CollisionType.NONE;
		if (!this.collisionLayers.includes(-1) && !thing.collisionLayers.includes(-1) && !this.collisionLayers.some(layer => thing.collisionLayers.includes(layer))) return CollisionType.NONE;
		if (this.position.distanceTo(thing.position) > this.hitbox.comparable + thing.hitbox.comparable) return CollisionType.NONE;
		// For circle it is distance < sum of radii
		// Reason this doesn't require additional checking: Look up 2 lines
		if (this.hitbox.type === "circle" && thing.hitbox.type === "circle") return CollisionType.CIRCLE_CIRCLE;
		else if (this.hitbox.type === "rect" && thing.hitbox.type === "rect") return this.hitbox.collideRect(this.position, this.direction, <RectHitbox><unknown>thing.hitbox, thing.position, thing.direction);
		else {
			// https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
			// Using the chosen answer
			// EDIT: I don't even know if this is the same answer anymore
			let circle: { hitbox: CircleHitbox, position: Vec2, direction: Vec2 };
			let rect: { hitbox: RectHitbox, position: Vec2, direction: Vec2 };
			if (this.hitbox.type === "circle") {
				circle = { hitbox: <CircleHitbox>this.hitbox, position: this.position, direction: this.direction };
				rect = { hitbox: <RectHitbox>thing.hitbox, position: thing.position, direction: thing.direction };
			} else {
				circle = { hitbox: <CircleHitbox>thing.hitbox, position: thing.position, direction: thing.direction };
				rect = { hitbox: <RectHitbox>this.hitbox, position: this.position, direction: this.direction };
			}
			return rect.hitbox.collideCircle(rect.position, rect.direction, circle.hitbox, circle.position, circle.direction);
		}
	}

	damage(dmg: number, damager?: string) {
		if (!this.vulnerable) return;
		this.health -= dmg;
		this.potentialKiller = damager;
		this.markDirty();
	}

	die() {
		this.despawn = true;
		this.health = 0;
		this.markDirty();
	}

	interact(_player: Player) { }

	interactionKey() {
		return this.translationKey();
	}

	translationKey() {
		return `entity.${this.type}`;
	}

	markDirty() {
		this.dirty = true;
	}
	
	unmarkDirty() {
		this.dirty = false;
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
			adjacents[1]?.addVec(adjacents[0].inverse()),
			adjacents[2]?.addVec(adjacents[1].inverse())
		];
		if (vecs.some(x => !x)) return;
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

