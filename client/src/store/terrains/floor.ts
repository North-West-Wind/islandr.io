import { TERRAIN_SUPPLIERS } from ".";
import { getTexture } from "../../textures";
import { TextureData } from "../../types/data";
import { Vec2 } from "../../types/math";
import { MinLine, MinTerrain, MinVec2 } from "../../types/minimized";
import { TerrainSupplier } from "../../types/supplier";
import { LineTerrain } from "../../types/terrain";
import { Player } from "../entities";

interface AdditionalFloorTerrain {
	line: MinLine;
	range: number;
	border: number;
	boundary: MinVec2[];

	texture: TextureData;
}

class FloorSupplier implements TerrainSupplier {
	create(minTerrain: MinTerrain & AdditionalFloorTerrain) {
		return new Floor(minTerrain);
	}
}

export default class Floor extends LineTerrain {
	static readonly ID = "floor";
	id = Floor.ID;
	color = 0x80B251;
	texture: TextureData;
	aboveTerrainLine = true;
	textureCache?: HTMLCanvasElement;

	constructor(minTerrain: MinTerrain & AdditionalFloorTerrain) {
		super(minTerrain);
		this.texture = minTerrain.texture;
	}

	static {
		TERRAIN_SUPPLIERS.set(Floor.ID, new FloorSupplier());
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		const relative = this.line.a.addVec(you.position.inverse());
		const vec = this.line.toVec();
		ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
		ctx.scale(scale, scale);
		ctx.translate(relative.x + vec.x * 0.5, relative.y + vec.y * 0.5);
		ctx.rotate(-vec.angle());
		const path = "assets/images/game/textures/" + this.texture.path;
		const img = getTexture(path);
		const dim = new Vec2(vec.magnitude(), this.range * 2);
		if (!img?.complete) this.defaultRender(ctx, dim);
		else if (this.texture.path.startsWith("fixed")) ctx.drawImage(img, -dim.x * 0.5, -dim.y * 0.5, dim.x, dim.y);
		else {
			if (!this.textureCache) {
				this.textureCache = document.createElement("canvas");
				this.textureCache.width = canvas.height * dim.x / dim.y;
				this.textureCache.height = canvas.height;
				const tCtx = this.textureCache.getContext("2d")!;
				const fill = Math.round(this.texture.horizontalFill || 1);
				const width = this.textureCache.width / fill;
				const height = width * img.height / img.width;
				for (let ii = 0; ii < Math.ceil(this.textureCache.height / height); ii++)
					for (let jj = 0; jj < fill; jj++)
						tCtx.drawImage(img, width * jj, height * ii, width, height);
			}
			ctx.drawImage(this.textureCache, -dim.x * 0.5, -dim.y * 0.5, dim.x, dim.y);
		}
		ctx.resetTransform();
	}

	defaultRender(ctx: CanvasRenderingContext2D, dim: Vec2) {
		ctx.fillStyle = this.colorToHex(this.color);
		ctx.fillRect(-dim.x * 0.5, -dim.y * 0.5, dim.x, dim.y);
	}

	renderMap(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number) {
		// We don't render anything on map, as buildings have handled it
	}
}