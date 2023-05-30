import { castCorrectEntity, FullPlayer, Player } from "../store/entities";
import { castCorrectTerrain } from "../store/terrains";
import { Entity } from "./entity";
import { Line, Vec2 } from "./math";
import { MinEntity, MinLine, MinObstacle, MinTerrain, MinVec2 } from "./minimized";
import { Obstacle } from "./obstacle";
import { Renderable, RenderableMap } from "./extenstions";
import { circleFromCenter } from "../utils";
import { castCorrectObstacle } from "../store/obstacles";
import { Howl } from "howler";

export class World {
	size: Vec2;
	entities: Entity[] = [];
	obstacles: Obstacle[] = [];
	defaultTerrain: Terrain;
	terrains: Terrain[] = [];
	aliveCount: Number = 0;
	sounds: Map<number, { howl: Howl, pos: Vec2 }> = new Map();

	constructor(size: Vec2, defaultTerrain: Terrain) {
		this.size = size;
		this.defaultTerrain = defaultTerrain;
	}

	clientTick(player: FullPlayer) {
		for (const sound of this.sounds.values()) {
			const relative = sound.pos.addVec(player.position.inverse()).scaleAll(1/60);
			sound.howl.pos(relative.x, relative.y);
		}
	}

	updateEntities(entities: MinEntity[], discardEntities: string[] = []) {
		const pending: Entity[] = [];
		for (const entity of this.entities) {
			if (discardEntities.includes(entity.id)) continue;
			const newData = entities.find(e => e.id == entity.id);
			if (newData) entity.copy(newData);
			pending.push(entity);
		}
		for (const entity of entities) {
			const existing = this.entities.find(e => e.id == entity.id);
			if (!existing) pending.push(castCorrectEntity(entity));
		}
		this.entities = pending;
	}

	updateObstacles(obstacles: MinObstacle[], discardObstacles: string[] = []) {
		const pending: Obstacle[] = [];
		for (const obstacle of this.obstacles) {
			if (discardObstacles.includes(obstacle.id)) continue;
			const newData = obstacles.find(o => o.id == obstacle.id);
			if (newData) obstacle.copy(newData);
			pending.push(obstacle);
		}
		for (const obstacle of obstacles) {
			const existing = this.obstacles.find(o => o.id == obstacle.id);
			if (!existing) pending.push(castCorrectObstacle(obstacle));
		}
		this.obstacles = pending;
	}

	updateLiveCount(count: Number) {
		this.aliveCount = count;
		(document.getElementById("playercount") as HTMLInputElement).innerText = this.aliveCount.toString();
	}
}

export abstract class Terrain implements Renderable, RenderableMap {
	id: string;
	type = "generic";
	// Use RGB
	color = 0;

	constructor(minTerrain: MinTerrain) {
		this.id = minTerrain.id;
	}

	colorToHex(color?: number) {
		if (!color) color = this.color;
		return "#" + color.toString(16);
	}

	abstract render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
	abstract renderMap(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}

export class FullTerrain extends Terrain {
	render(_you: Player, _canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number) { }
	renderMap(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number) { }
}

export class DotTerrain extends Terrain {
	type = "dot";
	position: Vec2;
	radius: number;

	constructor(minTerrain: MinTerrain & { position: MinVec2, radius: number }) {
		super(minTerrain);
		this.position = new Vec2(minTerrain.position.x, minTerrain.position.y);
		this.radius = minTerrain.radius;
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.fillStyle = this.colorToHex();
		circleFromCenter(ctx, 0, 0, this.radius * scale);
		ctx.resetTransform();
	}

	renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		ctx.fillStyle = this.colorToHex();
		circleFromCenter(ctx, this.position.x * scale, this.position.y * scale, this.radius * scale);
	}
}

export class LineTerrain extends Terrain {
	type = "line";
	line: Line;
	range: number;
	boundary: { start: Vec2, end: Vec2 };

	constructor(minTerrain: MinTerrain & { line: MinLine, range: number, boundary: MinVec2[] }) {
		super(minTerrain);
		this.line = Line.fromMinLine(minTerrain.line);
		this.range = minTerrain.range;
		this.boundary = { start: Vec2.fromMinVec2(minTerrain.boundary[0]), end: Vec2.fromMinVec2(minTerrain.boundary[1]) };
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.scale(scale, scale);
		ctx.translate(-you.position.x, -you.position.y);
		const lines = this.line.toParallel(this.range, false);
		const start = new Line(this.line.a, this.boundary.start.addVec(this.line.a), false);
		const end = new Line(this.line.b, this.boundary.end.addVec(this.line.b), false);
		const a = lines[0].intersection(start);
		if (!a) return;
		const b = lines[0].intersection(end);
		if (!b) return;
		const c = lines[1].intersection(end);
		if (!c) return;
		const d = lines[1].intersection(start);
		if (!d) return;
		ctx.fillStyle = this.colorToHex();
		ctx.beginPath();
		ctx.moveTo(a.x - 1/scale, a.y - 1/scale);
		ctx.lineTo(b.x, b.y);
		ctx.lineTo(c.x, c.y);
		ctx.lineTo(d.x - 1/scale, d.y - 1/scale);
		ctx.closePath();
		ctx.fill();
		ctx.resetTransform();
	}

	renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		ctx.scale(scale, scale);
		const lines = this.line.toParallel(this.range, false);
		const start = new Line(this.line.a, this.boundary.start.addVec(this.line.a), false);
		const end = new Line(this.line.b, this.boundary.end.addVec(this.line.b), false);
		const a = lines[0].intersection(start);
		if (!a) return;
		const b = lines[0].intersection(end);
		if (!b) return;
		const c = lines[1].intersection(end);
		if (!c) return;
		const d = lines[1].intersection(start);
		if (!d) return;
		ctx.fillStyle = this.colorToHex();
		ctx.beginPath();
		ctx.moveTo(a.x - 1/scale, a.y - 1/scale);
		ctx.lineTo(b.x, b.y);
		ctx.lineTo(c.x, c.y);
		ctx.lineTo(d.x - 1/scale, d.y - 1/scale);
		ctx.closePath();
		ctx.fill();
		ctx.resetTransform();
	}
}

export class PiecewiseTerrain extends Terrain {
	type = "piecewise";
	lines: LineTerrain[] = [];

	constructor(minTerrain: MinTerrain & { lines: (MinTerrain & { line: MinLine, range: number, boundary: MinVec2[] })[] }) {
		super(minTerrain);
		for (const line of minTerrain.lines)
			this.lines.push(<LineTerrain> castCorrectTerrain(line));
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		this.lines.forEach(line => line.render(you, canvas, ctx, scale));
	}

	renderMap(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		this.lines.forEach(line => line.renderMap(canvas, ctx, scale));
	}

}