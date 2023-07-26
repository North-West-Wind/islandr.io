import { Player } from "../store/entities";
import { MinWeapon } from "./minimized";
import { Renderable } from "./extenstions";
import { roundRect, circleFromCenter } from "../utils";
import { CircleHitbox, Vec2 } from "./math";
import { GunData, MeleeData } from "./data";
import { CommonNumber, CommonAngle, GunColor } from "../constants";
import { DEFINED_ANIMATIONS } from "../store/animations";
import { getBarrelImagePath } from "../textures";

export enum WeaponType {
	MELEE = "melee",
	GUN = "gun",
	GRENADE = "grenade"
}

export abstract class Weapon implements MinWeapon, Renderable {
	type!: WeaponType;
	id: string;
	name: string;

	constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
	}

	abstract render(player: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}

export class MeleeWeapon extends Weapon {
	type = WeaponType.MELEE;
	static readonly FIST_ANIMATIONS = ["left_fist", "right_fist"];
	readonly currentSkinSVG: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });

	constructor(id: string, data: MeleeData) {
		super(id, data.name);
		this.currentSkinSVG.onload = () => this.currentSkinSVG.loaded = true;
	}

	render(player: Player, _canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		this.currentSkinSVG.src = "assets/images/game/fists/" + player.skin + ".svg";
		const radius = scale * (<CircleHitbox> player.hitbox).radius;
		const fistScale = radius * 1.2 * CommonNumber.SIN45;
		const fistExtend = Vec2.UNIT_X.scaleAll(fistScale);
		const fists = [];
		if (!MeleeWeapon.FIST_ANIMATIONS.some(a => player.animations.find(aa => aa.id == a))) {
			fists.push(fistExtend.addVec(fistExtend.addAngle(CommonAngle.PI_TWO)));
			fists.push(fistExtend.addVec(fistExtend.addAngle(-CommonAngle.PI_TWO)));
		} else {
			for (const animation of player.animations) {
				const anim = DEFINED_ANIMATIONS.get(animation.id);
				if (anim) {
					const index = MeleeWeapon.FIST_ANIMATIONS.indexOf(animation.id);
					const portion = (anim.duration - animation.duration) / anim.duration;
					for (let ii = 0; ii < anim.keyframes.length - 1; ii++) {
						if (portion >= anim.keyframes[ii] && portion <= anim.keyframes[ii + 1]) {
							const position = anim.positions[ii].addVec(anim.positions[ii + 1].addVec(anim.positions[ii].inverse()).scaleAll((portion - anim.keyframes[ii]) / (anim.keyframes[ii + 1] - anim.keyframes[ii]))).scaleAll(fistScale);
							// TODO: handle rotation
							//const rotation = anim.rotations[ii]
							fists.push(fistExtend.addVec(position));
							break;
						}
					}
					fists.push(fistExtend.addVec(fistExtend.addAngle(CommonAngle.PI_TWO * (-index * 2 + 1))));
				}
			}
		}
	
		const fistRadius = radius / 3;
		ctx.lineWidth = fistRadius / 3;
		ctx.strokeStyle = "#000000";
		for (const fist of fists) 
		{//circleFromCenter(ctx, fist.x, fist.y, fistRadius, true, true);
		ctx.drawImage(this.currentSkinSVG, fist.x - fistRadius, fist.y - fistRadius, fistRadius *2, fistRadius*2)}
	}
}

export class GunWeapon extends Weapon {
	static readonly barrelImages = new Map<string, HTMLImageElement & { loaded: boolean }>();

	type = WeaponType.GUN;
	color: GunColor;
	length: number;
	hasBarrelImage: boolean;
	magazine: number;
	readonly currentFistSVG: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });

	

	constructor(id: string, data: GunData, magazine = 0) {
		super(id, data.name);
		this.color = data.color;
		this.length = data.length;
		this.hasBarrelImage = data.visuals.hasBarrelImage;
		this.magazine = magazine;
		this.currentFistSVG.onload = () => this.currentFistSVG.loaded = true;
	}

	render(player: Player, _canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void {
		this.currentFistSVG.src = "assets/images/game/fists/" + player.skin + ".svg";
		const radius = scale * player.hitbox.comparable;
		const fistRadius = radius / 3;
		const fistPositions = [new Vec2(player.hitbox.comparable, 0.1), new Vec2(player.hitbox.comparable + 0.25, -0.1)];
		var offset = Vec2.ZERO;
		ctx.fillStyle = "#222";
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 0.025 * scale;
		if (!this.hasBarrelImage)
			roundRect(ctx, player.hitbox.comparable * scale, -0.15 * scale, this.length * scale, 0.3 * scale, 0.15 * scale, true, true);
		else {
			const img = GunWeapon.barrelImages.get(this.id);
			if (!img?.loaded) {
				if (!img) {
					const image: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
					image.onload = () => image.loaded = true;
					image.src = getBarrelImagePath(this.id);
					GunWeapon.barrelImages.set(this.id, image);
				}
				roundRect(ctx, player.hitbox.comparable * scale, -0.15 * scale, this.length * scale, 0.3 * scale, 0.15 * scale, true, true);
			} else
				ctx.drawImage(img, player.hitbox.comparable * scale, - this.length * scale / 2, this.length * scale, this.length * scale)
		}
		ctx.lineWidth = fistRadius / 3;
		ctx.strokeStyle = "#000000";
		for (const pos of fistPositions) {
			const fist = pos.addVec(offset).scaleAll(scale);
			ctx.drawImage(this.currentFistSVG, fist.x - fistRadius, fist.y - fistRadius, fistRadius *2, fistRadius*2)
		}
	}
}

export abstract class GrenadeWeapon extends Weapon {
	type = WeaponType.GRENADE;
	//type!: "frag" | "mirv" | "smoke";
}

// Dummy weapon
export class DummyWeapon extends Weapon {
	render(_player: Player, _canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number) { }
}