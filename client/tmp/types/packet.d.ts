import { MovementDirection } from "./math";
import { MinEntity, MinObstacle, MinMinObstacle, MinTerrain } from "./minimized";
export declare class PingPacket {
    type: string;
}
export declare class MovementPressPacket {
    type: string;
    direction: MovementDirection;
    constructor(direction: MovementDirection);
}
export declare class MovementReleasePacket {
    type: string;
    direction: MovementDirection;
    constructor(direction: MovementDirection);
}
export declare class MousePressPacket {
    type: string;
    button: number;
    constructor(button: number);
}
export declare class MouseReleasePacket {
    type: string;
    button: number;
    constructor(button: number);
}
export declare class MouseMovePacket {
    type: string;
    x: number;
    y: number;
    constructor(x: number, y: number);
}
export declare class InteractPacket {
    type: string;
}
export declare class SwitchWeaponPacket {
    type: string;
    delta: number;
    constructor(delta: number);
}
export declare class ReloadWeaponPacket {
    type: string;
}
export declare class AckPacket {
    type: string;
    id: string;
    tps: number;
    size: number[];
    terrain: MinTerrain;
}
export declare class GamePacket {
    type: string;
    entities: MinEntity[];
    obstacles: MinObstacle[];
    player: any;
}
export declare class MapPacket {
    type: string;
    obstacles: MinMinObstacle[];
    terrains: MinTerrain[];
}
