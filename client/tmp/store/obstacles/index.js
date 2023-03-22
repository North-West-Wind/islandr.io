"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.castMinObstacle = exports.castCorrectObstacle = exports.AK47Stone = exports.Barrel = exports.AWMCrate = exports.GrenadeCrate = exports.SovietCrate = exports.Stone = exports.MosinTree = exports.Crate = exports.Bush = exports.Tree = exports.OBSTACLE_SUPPLIERS = void 0;
const math_1 = require("../../types/math");
const obstacle_1 = require("../../types/obstacle");
exports.OBSTACLE_SUPPLIERS = new Map();
var tree_1 = require("./tree");
Object.defineProperty(exports, "Tree", { enumerable: true, get: function () { return tree_1.default; } });
var bush_1 = require("./bush");
Object.defineProperty(exports, "Bush", { enumerable: true, get: function () { return bush_1.default; } });
var crate_1 = require("./crate");
Object.defineProperty(exports, "Crate", { enumerable: true, get: function () { return crate_1.default; } });
var mosin_tree_1 = require("./mosin_tree");
Object.defineProperty(exports, "MosinTree", { enumerable: true, get: function () { return mosin_tree_1.default; } });
var stone_1 = require("./stone");
Object.defineProperty(exports, "Stone", { enumerable: true, get: function () { return stone_1.default; } });
var soviet_crate_1 = require("./soviet_crate");
Object.defineProperty(exports, "SovietCrate", { enumerable: true, get: function () { return soviet_crate_1.default; } });
var grenade_crate_1 = require("./grenade_crate");
Object.defineProperty(exports, "GrenadeCrate", { enumerable: true, get: function () { return grenade_crate_1.default; } });
var awm_crate_1 = require("./awm_crate");
Object.defineProperty(exports, "AWMCrate", { enumerable: true, get: function () { return awm_crate_1.default; } });
var barrel_1 = require("./barrel");
Object.defineProperty(exports, "Barrel", { enumerable: true, get: function () { return barrel_1.default; } });
var ak47stone_1 = require("./ak47stone");
Object.defineProperty(exports, "AK47Stone", { enumerable: true, get: function () { return ak47stone_1.default; } });
function castCorrectObstacle(minObstacle) {
    var _a;
    return ((_a = exports.OBSTACLE_SUPPLIERS.get(minObstacle.type)) === null || _a === void 0 ? void 0 : _a.create(minObstacle)) || new obstacle_1.DummyObstacle(minObstacle);
}
exports.castCorrectObstacle = castCorrectObstacle;
function castMinObstacle(minMinObstacle) {
    const copy = minMinObstacle;
    return Object.assign(copy, { direction: math_1.Vec2.ONE, hitbox: new math_1.CircleHitbox(0), despawn: false, animations: [] });
}
exports.castMinObstacle = castMinObstacle;
//# sourceMappingURL=index.js.map