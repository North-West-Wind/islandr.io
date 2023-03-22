"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyEntity = exports.Entity = exports.PartialInventory = exports.Inventory = void 0;
const weapons_1 = require("../store/weapons");
const math_1 = require("./math");
const constants_1 = require("../constants");
const animations_1 = require("../store/animations");
class Inventory {
    constructor(holding, slots, weapons, ammos, utilities) {
        this.holding = holding;
        this.slots = slots;
        this.weapons = weapons || Array(slots.reduce((a, b) => a + b));
        this.ammos = ammos || Array(Object.keys(constants_1.GunColor).length / 2).fill(0);
        this.utilities = utilities || new Map();
    }
    getWeapon(index = -1) {
        if (index < 0)
            index = this.holding;
        if (this.holding < this.weapons.length)
            return this.weapons[this.holding];
        const util = Object.keys(this.utilities)[this.holding - this.weapons.length];
        if (this.utilities.get(util))
            return weapons_1.WEAPON_SUPPLIERS.get(util).create();
        return undefined;
    }
}
exports.Inventory = Inventory;
// Inventory, mainly for players
class PartialInventory {
    constructor(minInv) {
        this.holding = (0, weapons_1.castCorrectWeapon)(minInv.holding);
    }
}
exports.PartialInventory = PartialInventory;
// An entity with position, velocity and hitbox
class Entity {
    constructor(minEntity) {
        this.animations = [];
        this.zIndex = 0;
        this.copy(minEntity);
    }
    copy(minEntity) {
        this.id = minEntity.id;
        this.type = minEntity.type;
        this.position = new math_1.Vec2(minEntity.position.x, minEntity.position.y);
        this.direction = new math_1.Vec2(minEntity.direction.x, minEntity.direction.y);
        if (minEntity.hitbox.type === "rect") {
            const rect = minEntity.hitbox;
            this.hitbox = new math_1.RectHitbox(rect.width, rect.height);
        }
        else {
            const circle = minEntity.hitbox;
            this.hitbox = new math_1.CircleHitbox(circle.radius);
        }
        this.health = this.maxHealth = 100;
        this.despawn = minEntity.despawn;
        for (const anim of minEntity.animations)
            if (animations_1.DEFINED_ANIMATIONS.has(anim)) {
                const duration = animations_1.DEFINED_ANIMATIONS.get(anim).duration;
                this.animations.push({ id: anim, duration: duration });
            }
    }
    renderTick(time) {
        const removable = [];
        for (let ii = 0; ii < this.animations.length; ii++) {
            this.animations[ii].duration -= time;
            if (this.animations[ii].duration <= 0)
                removable.push(ii);
        }
        for (let ii = removable.length - 1; ii >= 0; ii--)
            this.animations.splice(removable[ii], 1);
    }
}
exports.Entity = Entity;
class DummyEntity extends Entity {
    render(_you, _canvas, _ctx, _scale) { }
}
exports.DummyEntity = DummyEntity;
//# sourceMappingURL=entity.js.map