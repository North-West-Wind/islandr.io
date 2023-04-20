import { OBSTACLE_SUPPLIERS } from ".";
import { RectHitbox } from "../../types/math";
import { MinObstacle } from "../../types/minimized";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";
import { Player } from "../entities";

const grenadeCrateImg: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
grenadeCrateImg.onload = () => grenadeCrateImg.loaded = true;
//grenadeCrateImg.src = "assets/images/game/objects/grenade_crate.png";
grenadeCrateImg.src = "assets/images/game/objects/crate.svg";

const grenadeCrateResidueImg: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
grenadeCrateResidueImg.onload = () => grenadeCrateResidueImg.loaded = true;
grenadeCrateResidueImg.src = "assets/images/game/objects/residues/crate.svg";

class GrenadeCrateSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle) {
		return new GrenadeCrate(minObstacle);
	}
}

export default class GrenadeCrate extends Obstacle {
	static readonly TYPE = "grenade_crate";
	type = GrenadeCrate.TYPE;

	static {
		OBSTACLE_SUPPLIERS.set(GrenadeCrate.TYPE, new GrenadeCrateSupplier());
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		if (!grenadeCrateImg.loaded || !grenadeCrateResidueImg.loaded) return;
		const relative = this.position.addVec(you.position.inverse());
		const width = scale * (<RectHitbox>this.hitbox).width * (this.despawn ? 0.5 : 1), height = width * grenadeCrateImg.naturalWidth / grenadeCrateImg.naturalHeight;
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		ctx.drawImage(this.despawn ? grenadeCrateResidueImg : grenadeCrateImg, -width / 2, -height / 2, width, height);
		ctx.resetTransform();
	}

	renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		ctx.translate(this.position.x * scale, this.position.y * scale);
		ctx.fillStyle = "#46502d";
		ctx.fillRect(-1.5 * scale, -1.5 * scale, 3 * scale, 3 * scale);
		ctx.resetTransform();
	}
}