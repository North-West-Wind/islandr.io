"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const terrain_1 = require("../../types/terrain");
class SeaSupplier {
    create(minTerrain) {
        return new Sea(minTerrain);
    }
}
class Sea extends terrain_1.LineTerrain {
    constructor() {
        super(...arguments);
        this.id = Sea.ID;
        this.color = 0x3481ab;
    }
}
exports.default = Sea;
Sea.ID = "sea";
(() => {
    _1.TERRAIN_SUPPLIERS.set(Sea.ID, new SeaSupplier());
})();
//# sourceMappingURL=sea.js.map