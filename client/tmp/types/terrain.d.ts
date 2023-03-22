import { Player } from "../store/entities";
import { Entity } from "./entity";
import { Line, Vec2 } from "./math";
import { MinEntity, MinLine, MinObstacle, MinTerrain, MinVec2 } from "./minimized";
import { Obstacle } from "./obstacle";
import { Renderable, RenderableMap } from "./extenstions";
export declare class World {
    size: Vec2;
    entities: Entity[];
    obstacles: Obstacle[];
    defaultTerrain: Terrain;
    terrains: Terrain[];
    constructor(size?: Vec2, defaultTerrain?: Terrain);
    updateEntities(entities: MinEntity[]): void;
    updateObstacles(obstacles: MinObstacle[]): void;
}
export declare abstract class Terrain implements Renderable, RenderableMap {
    id: string;
    border: number;
    type: string;
    color: number;
    constructor(minTerrain: MinTerrain);
    colorToHex(color?: number): string;
    abstract render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
    abstract renderMap(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}
export declare class DotTerrain extends Terrain {
    type: string;
    position: Vec2;
    radius: number;
    constructor(minTerrain: MinTerrain & {
        position: MinVec2;
        radius: number;
    });
    render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
    renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}
export declare class LineTerrain extends Terrain {
    type: string;
    line: Line;
    range: number;
    boundary: {
        start: Vec2;
        end: Vec2;
    };
    constructor(minTerrain: MinTerrain & {
        line: MinLine;
        range: number;
        boundary: MinVec2[];
    });
    render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
    renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}
export declare class PiecewiseTerrain extends Terrain {
    type: string;
    lines: LineTerrain[];
    constructor(minTerrain: MinTerrain & {
        lines: (MinTerrain & {
            line: MinLine;
            range: number;
            boundary: MinVec2[];
        })[];
    });
    render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
    renderMap(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}
