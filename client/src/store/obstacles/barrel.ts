import { Player } from "../entities";
import { Obstacle } from "../../types/obstacle";
import { MinObstacle } from "../../types/minimized";
import { circleFromCenter } from "../../utils";
import { ObstacleSupplier } from "../../types/supplier";
import { OBSTACLE_SUPPLIERS } from ".";
import { getMode } from "../../homepage";


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
	static  barrelImg = new Image();

	static barrelResidueImg = new Image();


	static {
		OBSTACLE_SUPPLIERS.set(Barrel.TYPE, new BarrelSupplier());
	}
	static updateAssets() {
		this.barrelResidueImg.src = "assets/" + getMode() + "/images/game/objects/residues/barrel.svg";
		this.barrelImg.src = "assets/" + getMode() + "/images/game/objects/barrel.svg";

	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void {
		if (!Barrel.barrelImg.complete || !Barrel.barrelResidueImg.complete) return;
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		const img = this.despawn ? Barrel.barrelResidueImg : Barrel.barrelImg;
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