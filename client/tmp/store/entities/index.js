"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.castCorrectEntity = exports.FullPlayer = exports.PartialPlayer = exports.Player = exports.Gun = exports.Grenade = exports.Bullet = exports.Ammo = exports.ENTITY_SUPPLIERS = void 0;
const entity_1 = require("../../types/entity");
exports.ENTITY_SUPPLIERS = new Map();
var ammo_1 = require("./ammo");
Object.defineProperty(exports, "Ammo", { enumerable: true, get: function () { return ammo_1.default; } });
var bullet_1 = require("./bullet");
Object.defineProperty(exports, "Bullet", { enumerable: true, get: function () { return bullet_1.default; } });
var grenade_1 = require("./grenade");
Object.defineProperty(exports, "Grenade", { enumerable: true, get: function () { return grenade_1.default; } });
var gun_1 = require("./gun");
Object.defineProperty(exports, "Gun", { enumerable: true, get: function () { return gun_1.default; } });
var player_1 = require("./player");
Object.defineProperty(exports, "Player", { enumerable: true, get: function () { return player_1.default; } });
var player_2 = require("./player");
Object.defineProperty(exports, "PartialPlayer", { enumerable: true, get: function () { return player_2.PartialPlayer; } });
Object.defineProperty(exports, "FullPlayer", { enumerable: true, get: function () { return player_2.FullPlayer; } });
// This still need hard-coding unfortunately
function castCorrectEntity(minEntity) {
    var _a;
    return ((_a = exports.ENTITY_SUPPLIERS.get(minEntity.type)) === null || _a === void 0 ? void 0 : _a.create(minEntity)) || new entity_1.DummyEntity(minEntity);
}
exports.castCorrectEntity = castCorrectEntity;
//# sourceMappingURL=index.js.map