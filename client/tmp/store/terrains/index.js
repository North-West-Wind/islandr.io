"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.castCorrectTerrain = exports.Sea = exports.RiverSegment = exports.River = exports.Pond = exports.Plain = exports.TERRAIN_SUPPLIERS = void 0;
exports.TERRAIN_SUPPLIERS = new Map();
const plain_1 = require("./plain");
var plain_2 = require("./plain");
Object.defineProperty(exports, "Plain", { enumerable: true, get: function () { return plain_2.default; } });
var pond_1 = require("./pond");
Object.defineProperty(exports, "Pond", { enumerable: true, get: function () { return pond_1.default; } });
var river_1 = require("./river");
Object.defineProperty(exports, "River", { enumerable: true, get: function () { return river_1.default; } });
Object.defineProperty(exports, "RiverSegment", { enumerable: true, get: function () { return river_1.RiverSegment; } });
var sea_1 = require("./sea");
Object.defineProperty(exports, "Sea", { enumerable: true, get: function () { return sea_1.default; } });
function castCorrectTerrain(minTerrain) {
    var _a;
    return ((_a = exports.TERRAIN_SUPPLIERS.get(minTerrain.id)) === null || _a === void 0 ? void 0 : _a.create(minTerrain)) || new plain_1.default(minTerrain);
}
exports.castCorrectTerrain = castCorrectTerrain;
//# sourceMappingURL=index.js.map