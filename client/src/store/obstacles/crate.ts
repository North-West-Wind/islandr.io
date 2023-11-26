import { OBSTACLE_SUPPLIERS } from ".";
import { getMode } from "../../homepage";
import { RectHitbox } from "../../types/math";
import { MinObstacle } from "../../types/minimized";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";
import { Player } from "../entities";
/*
const awcCrateImg: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
awcCrateImg.onload = () => awcCrateImg.loaded = true;
//awmCrateImg.src = "assets/images/game/objects/awm_crate.png";
*/

interface AdditionalObstacle {
	special: "normal" | "grenade" | "soviet" | "awc";
}

class CrateSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle & AdditionalObstacle) {
		return new Crate(minObstacle);
	}
}

export default class Crate extends Obstacle {
	static readonly TYPE = "crate";
	type = Crate.TYPE;
	special!: "normal" | "grenade" | "soviet" | "awc";
	static crateImg = new Image();
	static crateResidueImg = new Image();
	static grenadeCrateImg = new Image();
	static sovietCrateImg = new Image();

	static {
		OBSTACLE_SUPPLIERS.set(Crate.TYPE, new CrateSupplier());
	}
	static updateAssets() {
		this.crateImg.src = "assets/" + getMode() + "/images/game/objects/crate.svg";
		this.crateResidueImg.src = "assets/" + getMode() + "/images/game/objects/residues/crate.svg";
		this.grenadeCrateImg.src = "assets/" + getMode() + "/images/game/objects/grenade_crate.svg";
		this.sovietCrateImg.src = "assets/" + getMode() + "/images/game/objects/soviet_crate.svg";
	}

	copy(minObstacle: MinObstacle & AdditionalObstacle) {
		super.copy(minObstacle);
		this.special = minObstacle.special;
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		var img: HTMLImageElement;
		switch (this.special) {
			case "grenade":
				img = Crate.grenadeCrateImg;
				break;
			case "soviet":
				img = Crate.sovietCrateImg;
				break;
			default:
				img = Crate.crateImg;
				break;
		}
		if (!img.complete || !Crate.crateResidueImg.complete) return;
		const relative = this.position.addVec(you.position.inverse());
		const width = scale * (<RectHitbox>this.hitbox).width * (this.despawn ? 0.5 : 1), height = width * Crate.crateImg.naturalWidth / Crate.crateImg.naturalHeight;
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		ctx.drawImage(this.despawn ? Crate.crateResidueImg : img, -width / 2, -height / 2, width, height);
		ctx.resetTransform();
	}

	renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		ctx.translate(this.position.x * scale, this.position.y * scale);
		switch (this.special) {
			case "grenade":
				ctx.fillStyle = "#46502d";
				ctx.fillRect(-1.5 * scale, -1.5 * scale, 3 * scale, 3 * scale);
				break;
			default:
				ctx.fillStyle = "#683c05";
				ctx.fillRect(-2 * scale, -2 * scale, 4 * scale, 4 * scale);
				break;
		}
		ctx.resetTransform();
	}
}