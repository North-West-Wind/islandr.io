"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.castCorrectWeapon = exports.FragGrenade = exports.WEAPON_SUPPLIERS = void 0;
const constants_1 = require("../../constants");
const weapon_1 = require("../../types/weapon");
exports.WEAPON_SUPPLIERS = new Map();
var frag_grenade_1 = require("./grenades/frag_grenade");
Object.defineProperty(exports, "FragGrenade", { enumerable: true, get: function () { return frag_grenade_1.default; } });
function castCorrectWeapon(minWeapon, magazine = 0) {
    var _a;
    return ((_a = exports.WEAPON_SUPPLIERS.get(minWeapon.id)) === null || _a === void 0 ? void 0 : _a.create(magazine)) || exports.WEAPON_SUPPLIERS.get("fists").create();
}
exports.castCorrectWeapon = castCorrectWeapon;
class MeleeSupplier {
    constructor(id, data) {
        this.id = id;
        this.data = data;
    }
    create() {
        return new weapon_1.MeleeWeapon(this.id, this.data);
    }
}
class GunSupplier {
    constructor(id, data) {
        this.id = id;
        this.data = data;
    }
    create(magazine = 0) {
        return new weapon_1.GunWeapon(this.id, this.data, magazine);
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    for (const file of yield fetch(`${constants_1.OPENSURVIV_DATA}/data/weapons/melee/.list.json`).then(res => res.json())) {
        const data = yield fetch(`${constants_1.OPENSURVIV_DATA}/data/weapons/melee/${file}.json`).then(res => res.json());
        exports.WEAPON_SUPPLIERS.set(file, new MeleeSupplier(file, data));
    }
    for (const file of yield fetch(`${constants_1.OPENSURVIV_DATA}/data/weapons/guns/.list.json`).then(res => res.json())) {
        const data = yield fetch(`${constants_1.OPENSURVIV_DATA}/data/weapons/guns/${file}.json`).then(res => res.json());
        exports.WEAPON_SUPPLIERS.set(file, new GunSupplier(file, data));
    }
}))();
//# sourceMappingURL=index.js.map