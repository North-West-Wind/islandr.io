"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullPlayer = exports.PartialPlayer = void 0;
const _1 = require(".");
const entity_1 = require("../../types/entity");
const weapon_1 = require("../../types/weapon");
const utils_1 = require("../../utils");
const weapons_1 = require("../weapons");
const deathImg = Object.assign(new Image(), { loaded: false });
deathImg.onload = () => deathImg.loaded = true;
deathImg.src = "assets/images/game/entities/death.svg";
class PlayerSupplier {
    create(minEntity) {
        return new PartialPlayer(minEntity);
    }
}
class Player extends entity_1.Entity {
    constructor(minEntity) {
        super(minEntity);
        this.type = Player.TYPE;
        this.zIndex = 9;
        this.copy(minEntity);
    }
    copy(minEntity) {
        super.copy(minEntity);
        this.username = minEntity.username;
        if (typeof minEntity.inventory.holding === "number") {
            const inventory = minEntity.inventory;
            this.inventory = new entity_1.Inventory(inventory.holding, inventory.slots, inventory.weapons.map(w => w ? (0, weapons_1.castCorrectWeapon)(w, w.type == weapon_1.WeaponType.GUN ? w.magazine : 0) : w), inventory.ammos, inventory.utilities);
        }
        else
            this.inventory = new entity_1.PartialInventory(minEntity.inventory);
        if (this.despawn)
            this.zIndex = 7;
    }
    render(you, canvas, ctx, scale) {
        const relative = this.position.addVec(you.position.inverse());
        const radius = scale * this.hitbox.comparable;
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        if (!this.despawn) {
            ctx.rotate(this.direction.angle());
            ctx.fillStyle = "#F8C675";
            (0, utils_1.circleFromCenter)(ctx, 0, 0, radius);
            // We will leave the transform for the weapon
            // If player is holding nothing, render fist
            var weapon = weapons_1.WEAPON_SUPPLIERS.get("fists").create();
            //console.log(this.inventory);
            if (typeof this.inventory.holding === "number")
                weapon = this.inventory.getWeapon();
            else
                weapon = this.inventory.holding;
            weapon.render(this, canvas, ctx, scale);
            ctx.resetTransform();
        }
        else {
            ctx.drawImage(deathImg, -radius * 2, -radius * 2, radius * 4, radius * 4);
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.font = `700 ${scale}px Jura`;
            ctx.fillStyle = "#60605f";
            ctx.fillText(this.username, 2, radius * 2 + 2);
            ctx.fillStyle = "#80807f";
            ctx.fillText(this.username, 0, radius * 2);
            ctx.resetTransform();
        }
    }
}
exports.default = Player;
Player.TYPE = "player";
class PartialPlayer extends Player {
}
exports.PartialPlayer = PartialPlayer;
(() => {
    _1.ENTITY_SUPPLIERS.set(Player.TYPE, new PlayerSupplier());
})();
class FullPlayer extends Player {
    copy(minEntity) {
        super.copy(minEntity);
        this.boost = minEntity.boost;
        this.scope = minEntity.scope;
        this.canInteract = minEntity.canInteract || false;
        this.reloadTicks = minEntity.reloadTicks;
        this.maxReloadTicks = minEntity.maxReloadTicks;
    }
}
exports.FullPlayer = FullPlayer;
//# sourceMappingURL=player.js.map