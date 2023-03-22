import { FullPlayer } from "../store/entities";
import { Obstacle } from "../types/obstacle";
export declare function initMap(obstacles: Obstacle[]): void;
export declare function drawMap(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void;
export declare function drawMinimap(player: FullPlayer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void;
