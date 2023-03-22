import { OBSTACLE_SUPPLIERS } from ".";
import { RectHitbox } from "../../types/math";
import { MinObstacle } from "../../types/minimized";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";
import { Player } from "../entities";

const awmCrateImg: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
awmCrateImg.onload = () => awmCrateImg.loaded = true;
awmCrateImg.src = "assets/images/game/objects/awm_crate.png";

const awmCrateResidueImg: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
awmCrateResidueImg.onload = () => awmCrateResidueImg.loaded = true;
awmCrateResidueImg.src = "assets/images/game/objects/residues/crate.svg";

class AWMCrateSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle) {
		return new AWMCrate(minObstacle);
	}
}

export default class AWMCrate extends Obstacle {
	static readonly TYPE = "AWMCrate";
	type = AWMCrate.TYPE;

	static {
		OBSTACLE_SUPPLIERS.set(AWMCrate.TYPE, new AWMCrateSupplier());
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		if (!awmCrateImg.loaded || !awmCrateResidueImg.loaded) return;
		const relative = this.position.addVec(you.position.inverse());
		const width = scale * (<RectHitbox>this.hitbox).width * (this.despawn ? 0.5 : 1), height = width * awmCrateImg.naturalWidth / awmCrateImg.naturalHeight;
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		ctx.drawImage(this.despawn ? awmCrateResidueImg : awmCrateImg, -width / 2, -height / 2, width + 1, height + 0.5);
		ctx.resetTransform();
	}

	renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		ctx.translate(this.position.x * scale, this.position.y * scale);
		ctx.fillStyle = "#683c05";
		ctx.fillRect(-2 * scale, -2 * scale, 5 * scale, 4 * scale);
		ctx.resetTransform();
	}
}