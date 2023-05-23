import { ENTITY_SUPPLIERS, Player } from ".";
import { getHealingImagePath } from "../../textures";
import { Entity } from "../../types/entity";
import { MinEntity } from "../../types/minimized";
import { EntitySupplier } from "../../types/supplier";
import { circleFromCenter } from "../../utils";

interface AdditionalEntity {
	name: string;
}

class HealingSupplier implements EntitySupplier {
	create(minEntity: MinEntity & AdditionalEntity) {
		return new Healing(minEntity);
	}
}

export default class Healing extends Entity {
	static readonly healingImages = new Map<string, HTMLImageElement & { loaded: boolean }>();
	static mapping: string[];
	static readonly TYPE = "healing";
	type = Healing.TYPE;
	// Used for rendering Grenade size
	name!: string;
	zIndex = 8;

	constructor(minEntity: MinEntity & AdditionalEntity) {
		super(minEntity);
		this.copy(minEntity);
	}

	static {
		ENTITY_SUPPLIERS.set(Healing.TYPE, new HealingSupplier());
	}

	static async setupHud() {
		const div = <HTMLDivElement> document.getElementById("healing-container");
		div.innerHTML = "";
		const list: string[] = await fetch(`data/healings/.list.json`).then(res => res.json());
		this.mapping = list;
		for (let ii = 0; ii < list.length; ii++) {
			const file = list[ii];
			div.innerHTML += `<tr class="healing-panel" id="healing-panel-${ii}"><td class="healing-image-container"><img class="healing-image" id="healing-image-${ii}" src="${getHealingImagePath(file)}" /></td><td class="healing-count-container"><span class="healing-count" id="healing-count-${ii}">0</span></td></tr>`;
		}
	}

	copy(minEntity: MinEntity & AdditionalEntity) {
		super.copy(minEntity);
		this.name = minEntity.name;
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		const relative = this.position.addVec(you.position.inverse());
		const radius = scale * this.hitbox.comparable;
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		ctx.strokeStyle = "#000";
		ctx.lineWidth = scale * 0.1;
		circleFromCenter(ctx, 0, 0, radius, false, true);
		ctx.fillStyle = "#00000066"; // <- alpha/opacity
		circleFromCenter(ctx, 0, 0, radius, true, false);
		const img = Healing.healingImages.get(this.name);
		if (!img?.loaded) {
			if (!img) {
				const image: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
				image.onload = () => image.loaded = true;
				image.src = getHealingImagePath(this.name);
				Healing.healingImages.set(this.name, image);
			}
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#fff";
			ctx.font = `${canvas.height / 54}px Arial`;
			ctx.fillText(this.name, 0, 0);
		} else
			ctx.drawImage(img, -0.7*radius, -0.7*radius, 1.4*radius, 1.4*radius);
		ctx.resetTransform();
	}
}