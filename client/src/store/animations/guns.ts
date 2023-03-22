import { DEFINED_ANIMATIONS } from ".";
import { DefinedAnimation } from "../../types/animation";
import { Vec2 } from "../../types/math";

const SMALL_RECOIL = new DefinedAnimation(
	"small_recoil",
	[new Vec2(-0.1, 0), Vec2.ZERO],
	Array(2).fill(Vec2.ONE),
	[0, 1],
	100
);

const MEDIUM_RECOIL = new DefinedAnimation(
	"medium_recoil",
	[new Vec2(-0.25, 0), Vec2.ZERO],
	Array(2).fill(Vec2.ONE),
	[0, 1],
	150
);

const LARGE_RECOIL = new DefinedAnimation(
	"large_recoil",
	[new Vec2(-0.5, 0), Vec2.ZERO],
	Array(2).fill(Vec2.ONE),
	[0, 1],
	200
);

export default function init() {
	DEFINED_ANIMATIONS.set(SMALL_RECOIL.id, SMALL_RECOIL);
	DEFINED_ANIMATIONS.set(MEDIUM_RECOIL.id, MEDIUM_RECOIL);
	DEFINED_ANIMATIONS.set(LARGE_RECOIL.id, LARGE_RECOIL);
}