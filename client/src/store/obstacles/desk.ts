import { OBSTACLE_SUPPLIERS } from ".";
import { getMode } from "../../homepage";
import { RectHitbox } from "../../types/math";
import { MinObstacle } from "../../types/minimized";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";
import { Player } from "../entities";

class DeskSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle) {
		return new Desk(minObstacle);
	}
}

export default class Desk extends Obstacle {
	static readonly TYPE = "desk";
	type = Desk.TYPE;
	static deskImg = new Image();
	static deskResidueImg = new Image();

	static {
		OBSTACLE_SUPPLIERS.set(Desk.TYPE, new DeskSupplier());
	}

	static updateAssets() {
		this.deskImg.src = "assets/" + getMode() + "/images/game/objects/desk.svg";
		this.deskResidueImg.src = "assets/" + getMode() + "/images/game/objects/residues/desk.svg";
	}

	copy(minObstacle: MinObstacle) {
		super.copy(minObstacle);
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		var img: HTMLImageElement;
		img = Desk.deskImg;
		if (!img.complete || !Desk.deskResidueImg.complete) return;
		const relative = this.position.addVec(you.position.inverse());
		const width = scale * (<RectHitbox>this.hitbox).width * (this.despawn ? 0.5 : 1), height = width * Desk.deskImg.naturalWidth / Desk.deskImg.naturalHeight;
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		ctx.drawImage(this.despawn ? Desk.deskResidueImg : img, -width / 2, -height / 2, width, height);
		ctx.resetTransform();
	}

	renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		console.log("")
	}
}