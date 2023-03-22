"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapPacket = exports.GamePacket = exports.AckPacket = exports.ReloadWeaponPacket = exports.SwitchWeaponPacket = exports.InteractPacket = exports.MouseMovePacket = exports.MouseReleasePacket = exports.MousePressPacket = exports.MovementReleasePacket = exports.MovementPressPacket = exports.PingPacket = void 0;
// Packet to ping the server
class PingPacket {
    constructor() {
        this.type = "ping";
    }
}
exports.PingPacket = PingPacket;
// Packet to notify movement key press
class MovementPressPacket {
    constructor(direction) {
        this.type = "movementpress";
        this.direction = direction;
    }
}
exports.MovementPressPacket = MovementPressPacket;
// Packet to notify movement key release
class MovementReleasePacket {
    constructor(direction) {
        this.type = "movementrelease";
        this.direction = direction;
    }
}
exports.MovementReleasePacket = MovementReleasePacket;
// Packet to notify mouse button press
class MousePressPacket {
    constructor(button) {
        this.type = "mousepress";
        this.button = button;
    }
}
exports.MousePressPacket = MousePressPacket;
// Packet to notify mouse button release
class MouseReleasePacket {
    constructor(button) {
        this.type = "mouserelease";
        this.button = button;
    }
}
exports.MouseReleasePacket = MouseReleasePacket;
// Packet to notify mouse movement
class MouseMovePacket {
    constructor(x, y) {
        this.type = "mousemove";
        this.x = x;
        this.y = y;
    }
}
exports.MouseMovePacket = MouseMovePacket;
// Packet to notify interaction (e.g. pickup)
class InteractPacket {
    constructor() {
        this.type = "interact";
    }
}
exports.InteractPacket = InteractPacket;
// Packet to notify weapon switching
class SwitchWeaponPacket {
    constructor(delta) {
        this.type = "switchweapon";
        this.delta = delta;
    }
}
exports.SwitchWeaponPacket = SwitchWeaponPacket;
// Packet to notify weapon reloading
class ReloadWeaponPacket {
    constructor() {
        this.type = "reloadweapon";
    }
}
exports.ReloadWeaponPacket = ReloadWeaponPacket;
/// Packet from server acknowledgement
class AckPacket {
    constructor() {
        this.type = "ack";
    }
}
exports.AckPacket = AckPacket;
/// Packet from server containing game data
class GamePacket {
    constructor() {
        this.type = "game";
    }
}
exports.GamePacket = GamePacket;
/// Packet from server containing map data
class MapPacket {
    constructor() {
        this.type = "map";
    }
}
exports.MapPacket = MapPacket;
//# sourceMappingURL=packet.js.map