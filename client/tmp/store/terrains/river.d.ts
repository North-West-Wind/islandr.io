import { MinTerrain, MinLine, MinVec2 } from "../../types/minimized";
import { BorderedTerrain } from "../../types/extenstions";
import { LineTerrain, PiecewiseTerrain } from "../../types/terrain";
import { Player } from "../entities";
export declare class RiverSegment extends LineTerrain implements BorderedTerrain {
    static readonly ID = "river_segment";
    id: string;
    color: number;
    secondaryColor: number;
    renderLayerN1(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
    renderMapLayerN1(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}
export default class River extends PiecewiseTerrain implements BorderedTerrain {
    static readonly ID = "river";
    id: string;
    color: number;
    secondaryColor: number;
    constructor(minTerrain: MinTerrain & {
        lines: (MinTerrain & {
            line: MinLine;
            range: number;
            boundary: MinVec2[];
        })[];
    });
    renderLayerN1(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
    renderMapLayerN1(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}
