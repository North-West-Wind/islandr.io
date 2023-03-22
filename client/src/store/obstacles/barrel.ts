import { Player } from "../entities";
import { Obstacle } from "../../types/obstacle";
import { MinObstacle } from "../../types/minimized";
import { circleFromCenter } from "../../utils";
import { ObstacleSupplier } from "../../types/supplier";
import { OBSTACLE_SUPPLIERS } from ".";

const barrelImg: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
barrelImg.onload = () => barrelImg.loaded = true;
barrelImg.src = "assets/images/game/objects/barrel.png";

const barrelResidueImg: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
barrelResidueImg.onload = () => barrelResidueImg.loaded = true;
barrelResidueImg.src = "assets/images/game/objects/residues/barrel.png";

class BarrelSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle) {
		return new Barrel(minObstacle);
	}
}

// Barrel
export default class Barrel extends Obstacle {
	static readonly TYPE = "barrel";
	type = Barrel.TYPE;
	zIndex = 0;

	static {
		OBSTACLE_SUPPLIERS.set(Barrel.TYPE, new BarrelSupplier());
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void {
		if (!barrelImg.loaded || !barrelResidueImg.loaded) return;
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		const img = this.despawn ? barrelResidueImg : barrelImg;
		// Times 2 because radius * 2 = diameter
		const width = scale * this.hitbox.comparable * 2 * (this.despawn ? 0.5 : 1), height = width * img.naturalWidth / img.naturalHeight;
		ctx.drawImage(img, -width / 2, -height / 2, width, height);
		ctx.resetTransform();
	}

	renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		ctx.fillStyle = "#005f00";
		circleFromCenter(ctx, this.position.x * scale, this.position.y * scale, 2 * scale);
	}
}