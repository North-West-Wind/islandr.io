import { circleFromCenter, numToRGBA } from "../utils";
import { RenderableMap } from "./extenstions";
import { Hitbox, RectHitbox, Vec2 } from "./math";
import { MinBuilding } from "./minimized";

export default class Building implements RenderableMap {
	id: string;
	position: Vec2;
	direction: Vec2;
	zones: { position: Vec2, hitbox: Hitbox, map: boolean }[] = [];
	color?: number;

	constructor(minBuilding: MinBuilding) {
		this.id = minBuilding.id;
		this.position = Vec2.fromMinVec2(minBuilding.position);
		this.direction = Vec2.fromMinVec2(minBuilding.direction);
		this.zones = minBuilding.zones.map(zone => ({ position: Vec2.fromMinVec2(zone.position), hitbox: Hitbox.fromMinHitbox(zone.hitbox), map: zone.map }));
		this.color = minBuilding.color;
	}

	renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		if (this.color === undefined || !this.zones.length) return;
		ctx.scale(scale, scale);
		ctx.translate(this.position.x, this.position.y);
		ctx.rotate(this.direction.angle());
		ctx.fillStyle = numToRGBA(this.color);
		for (const zone of this.zones) {
			if (!zone.map) continue;
			if (zone.hitbox.type === "circle")
				circleFromCenter(ctx, zone.position.x, zone.position.y, zone.hitbox.comparable);
			else {
				const rect = <RectHitbox>zone.hitbox;
				const topLeft = zone.position.addVec(new Vec2(-rect.width / 2, -rect.height / 2));
				const botRight = zone.position.addVec(new Vec2(rect.width / 2, rect.height / 2));
				const dimension = botRight.addVec(topLeft.inverse());
				ctx.fillRect(topLeft.x, topLeft.y, dimension.x, dimension.y);
			}
		}
		ctx.resetTransform();
	}
}