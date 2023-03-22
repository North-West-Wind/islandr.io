"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const terrain_1 = require("../../types/terrain");
class PlainSupplier {
    create(minTerrain) {
        return new Plain(minTerrain);
    }
}
class Plain extends terrain_1.Terrain {
    constructor(minTerrain) {
        super(minTerrain);
        this.id = Plain.ID;
        this.color = 0x80B251;
    }
    render(_you, _canvas, _ctx, _scale) { }
    renderMap(_canvas, _ctx, _scale) { }
}
exports.default = Plain;
Plain.ID = "plain";
(() => {
    _1.TERRAIN_SUPPLIERS.set(Plain.ID, new PlainSupplier());
})();
//# sourceMappingURL=plain.js.map