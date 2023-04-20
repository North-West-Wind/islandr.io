import { OBSTACLE_SUPPLIERS } from ".";
import { RectHitbox } from "../../types/math";
import { MinObstacle } from "../../types/minimized";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";
import { Player } from "../entities";

const crateImg: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
crateImg.onload = () => crateImg.loaded = true;
//crateImg.src = "assets/images/game/objects/soviet_crate.png";
crateImg.src = "assets/images/game/objects/crate.svg";

const crateResidueImg: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
crateResidueImg.onload = () => crateResidueImg.loaded = true;
crateResidueImg.src = "assets/images/game/objects/residues/crate.svg";

class SovietCrateSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle) {
		return new SovietCrate(minObstacle);
	}
}

export default class SovietCrate extends Obstacle {
	static readonly TYPE = "soviet_crate";
	type = SovietCrate.TYPE;

	static {
		OBSTACLE_SUPPLIERS.set(SovietCrate.TYPE, new SovietCrateSupplier());
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		if (!crateImg.loaded || !crateResidueImg.loaded) return;
		const relative = this.position.addVec(you.position.inverse());
		const width = scale * (<RectHitbox>this.hitbox).width * (this.despawn ? 0.5 : 1), height = width * crateImg.naturalWidth / crateImg.naturalHeight;
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		ctx.drawImage(this.despawn ? crateResidueImg : crateImg, -width / 2, -height / 2, width, height);
		ctx.resetTransform();
	}

	renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		ctx.translate(this.position.x * scale, this.position.y * scale);
		ctx.fillStyle = "#683c05";
		ctx.fillRect(-2 * scale, -2 * scale, 4 * scale, 4 * scale);
		ctx.resetTransform();
	}
}