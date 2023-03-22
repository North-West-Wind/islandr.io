"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyWeapon = exports.GrenadeWeapon = exports.GunWeapon = exports.MeleeWeapon = exports.Weapon = exports.WeaponType = void 0;
const utils_1 = require("../utils");
const math_1 = require("./math");
const constants_1 = require("../constants");
const animations_1 = require("../store/animations");
var WeaponType;
(function (WeaponType) {
    WeaponType["MELEE"] = "melee";
    WeaponType["GUN"] = "gun";
    WeaponType["GRENADE"] = "grenade";
})(WeaponType = exports.WeaponType || (exports.WeaponType = {}));
class Weapon {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}
exports.Weapon = Weapon;
class MeleeWeapon extends Weapon {
    constructor(id, data) {
        super(id, data.name);
        this.type = WeaponType.MELEE;
    }
    render(player, _canvas, ctx, scale) {
        const radius = scale * player.hitbox.radius;
        const fistScale = radius * 1.2 * constants_1.CommonNumber.SIN45;
        const fistExtend = math_1.Vec2.ONE.scaleAll(fistScale);
        const fists = [];
        if (!MeleeWeapon.FIST_ANIMATIONS.some(a => player.animations.find(aa => aa.id == a))) {
            fists.push(fistExtend.addVec(fistExtend.addAngle(constants_1.CommonAngle.PI_TWO)));
            fists.push(fistExtend.addVec(fistExtend.addAngle(-constants_1.CommonAngle.PI_TWO)));
        }
        else {
            for (const animation of player.animations) {
                const anim = animations_1.DEFINED_ANIMATIONS.get(animation.id);
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
                    fists.push(fistExtend.addVec(fistExtend.addAngle(constants_1.CommonAngle.PI_TWO * (-index * 2 + 1))));
                }
            }
        }
        const fistRadius = radius / 3;
        ctx.fillStyle = "#F8C675";
        ctx.lineWidth = fistRadius / 3;
        ctx.strokeStyle = "#000000";
        for (const fist of fists)
            (0, utils_1.circleFromCenter)(ctx, fist.x, fist.y, fistRadius, true, true);
    }
}
exports.MeleeWeapon = MeleeWeapon;
MeleeWeapon.FIST_ANIMATIONS = ["left_fist", "right_fist"];
class GunWeapon extends Weapon {
    constructor(id, data, magazine = 0) {
        super(id, data.name);
        this.type = WeaponType.GUN;
        this.color = data.color;
        this.length = data.length;
        this.magazine = magazine;
    }
    render(player, _canvas, ctx, scale) {
        const radius = scale * player.hitbox.comparable;
        const fistRadius = radius / 3;
        const fistPositions = [new math_1.Vec2(player.hitbox.comparable, 0.1), new math_1.Vec2(player.hitbox.comparable + 0.25, -0.1)];
        var offset = math_1.Vec2.ZERO;
        ctx.fillStyle = "#222";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 0.025 * scale;
        //ctx.fillRect(player.hitbox.comparable * scale, -0.15 * scale, 1.2 * scale, 0.3 * scale);
        (0, utils_1.roundRect)(ctx, player.hitbox.comparable * scale, -0.15 * scale, this.length * scale, 0.3 * scale, 0.15 * scale, true, true);
        ctx.fillStyle = "#F8C675";
        ctx.lineWidth = fistRadius / 3;
        ctx.strokeStyle = "#000000";
        for (const pos of fistPositions) {
            const fist = pos.addVec(offset).scaleAll(scale);
            (0, utils_1.circleFromCenter)(ctx, fist.x, fist.y, fistRadius, true, true);
        }
    }
}
exports.GunWeapon = GunWeapon;
class GrenadeWeapon extends Weapon {
    constructor() {
        super(...arguments);
        this.type = WeaponType.GRENADE;
        //type!: "frag" | "mirv" | "smoke";
    }
}
exports.GrenadeWeapon = GrenadeWeapon;
// Dummy weapon
class DummyWeapon extends Weapon {
    render(_player, _canvas, _ctx, _scale) { }
}
exports.DummyWeapon = DummyWeapon;
//# sourceMappingURL=weapon.js.map