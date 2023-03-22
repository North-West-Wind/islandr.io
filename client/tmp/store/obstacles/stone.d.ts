import { Obstacle } from "../../types/obstacle";
import { Player } from "../entities";
export default class Stone extends Obstacle {
    static readonly TYPE = "stone";
    type: string;
    render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
    renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}
