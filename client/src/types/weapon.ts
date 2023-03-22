import { Player } from "../store/entities";
import { MinWeapon } from "./minimized";
import { Renderable } from "./extenstions";
import { roundRect, circleFromCenter } from "../utils";
import { CircleHitbox, Vec2 } from "./math";
import { GunData, MeleeData } from "./data";
import { CommonNumber, CommonAngle, GunColor } from "../constants";
import { DEFINED_ANIMATIONS } from "../store/animations";

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

	constructor(id: string, data: MeleeData) {
		super(id, data.name);
	}

	render(player: Player, _canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		const radius = scale * (<CircleHitbox> player.hitbox).radius;
		const fistScale = radius * 1.2 * CommonNumber.SIN45;
		const fistExtend = Vec2.ONE.scaleAll(fistScale);
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
		ctx.fillStyle = "#F8C675";
		ctx.lineWidth = fistRadius / 3;
		ctx.strokeStyle = "#000000";
		for (const fist of fists) circleFromCenter(ctx, fist.x, fist.y, fistRadius, true, true);
	}
}

export class GunWeapon extends Weapon {
	type = WeaponType.GUN;
	color: GunColor;
	length: number;
	magazine: number;

	constructor(id: string, data: GunData, magazine = 0) {
		super(id, data.name);
		this.color = data.color;
		this.length = data.length;
		this.magazine = magazine;
	}

	render(player: Player, _canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void {
		const radius = scale * player.hitbox.comparable;
		const fistRadius = radius / 3;
		const fistPositions = [new Vec2(player.hitbox.comparable, 0.1), new Vec2(player.hitbox.comparable + 0.25, -0.1)];
		var offset = Vec2.ZERO;
		ctx.fillStyle = "#222";
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 0.025 * scale;
		//ctx.fillRect(player.hitbox.comparable * scale, -0.15 * scale, 1.2 * scale, 0.3 * scale);
		roundRect(ctx, player.hitbox.comparable * scale, -0.15 * scale, this.length * scale, 0.3 * scale, 0.15 * scale, true, true);
		ctx.fillStyle = "#F8C675";
		ctx.lineWidth = fistRadius / 3;
		ctx.strokeStyle = "#000000";
		for (const pos of fistPositions) {
			const fist = pos.addVec(offset).scaleAll(scale);
			circleFromCenter(ctx, fist.x, fist.y, fistRadius, true, true);
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