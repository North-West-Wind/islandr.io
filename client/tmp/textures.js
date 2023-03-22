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
exports.getTracerColor = exports.getWeaponImage = void 0;
const constants_1 = require("./constants");
const weapons = new Map();
(() => __awaiter(void 0, void 0, void 0, function* () {
    for (const id of yield fetch(`${constants_1.OPENSURVIV_DATA}/data/weapons/guns/.list.json`).then(res => res.json())) {
        const img = Object.assign(new Image(), { loaded: false });
        img.onload = () => img.loaded = true;
        img.src = `assets/images/game/loots/weapons/${id}.png`;
        weapons.set(id, img);
    }
}))();
function getWeaponImage(id) {
    return weapons.get(id);
}
exports.getWeaponImage = getWeaponImage;
const tracerColors = new Map();
(() => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield fetch(`${constants_1.OPENSURVIV_DATA}/data/colors/tracers.json`).then(res => res.json());
    for (const id of Object.keys(data)) {
        tracerColors.set(id, data[id]);
    }
}))();
function getTracerColor(id) {
    return tracerColors.get(id);
}
exports.getTracerColor = getTracerColor;
//# sourceMappingURL=textures.js.map