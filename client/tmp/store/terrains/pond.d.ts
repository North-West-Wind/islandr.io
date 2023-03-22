import { MinTerrain, MinVec2 } from "../../types/minimized";
import { BorderedTerrain } from "../../types/extenstions";
import { DotTerrain } from "../../types/terrain";
import { Player } from "../entities";
interface AdditionalTerrain {
    position: MinVec2;
    radius: number;
}
export default class Pond extends DotTerrain implements BorderedTerrain {
    static readonly ID = "pond";
    id: string;
    color: number;
    secondaryColor: number;
    constructor(minTerrain: MinTerrain & AdditionalTerrain);
    renderLayerN1(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
    renderMapLayerN1(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}
export {};
