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


class TableSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle) {
		return new Table(minObstacle);
	}
}

export default class Table extends Obstacle {
	static readonly TYPE = "table";
	type = Table.TYPE;
	zIndex = 11;
	static tableImg = new Image();
	static tableResidueImg = new Image();

	static {
		OBSTACLE_SUPPLIERS.set(Table.TYPE, new TableSupplier());
	}

	static updateAssets() {
		this.tableImg.src = "assets/" + getMode() + "/images/game/objects/table.svg";
		this.tableResidueImg.src = "assets/" + getMode() + "/images/game/objects/residues/table.svg";
	}

	copy(minObstacle: MinObstacle) {
		super.copy(minObstacle);
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		var img: HTMLImageElement;
		img = Table.tableImg;
		if (!img.complete || !Table.tableResidueImg.complete) return;
		const relative = this.position.addVec(you.position.inverse());
		const width = scale * (<RectHitbox>this.hitbox).width * (this.despawn ? 0.5 : 1), height = width * Table.tableImg.naturalWidth / Table.tableImg.naturalHeight;
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		ctx.drawImage(this.despawn ? Table.tableResidueImg : img, -width / 2, -height / 2, width, height);
		ctx.resetTransform();
	}

	renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		console.log("")
	}
}