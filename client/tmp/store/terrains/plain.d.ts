import { MinTerrain } from "../../types/minimized";
import { Terrain } from "../../types/terrain";
import { Player } from "../entities";
export default class Plain extends Terrain {
    static readonly ID = "plain";
    id: string;
    color: number;
    constructor(minTerrain: MinTerrain);
    render(_you: Player, _canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number): void;
    renderMap(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number): void;
}
