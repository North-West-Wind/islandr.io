import { Player } from "../store/entities";
import { Hitbox, Vec2 } from "./math";
import { MinObstacle } from "./minimized";
import { Renderable, RenderableMap } from "./extenstions";
import { Animation } from "./animation";
export declare abstract class Obstacle implements Renderable, RenderableMap {
    id: string;
    type: string;
    position: Vec2;
    direction: Vec2;
    hitbox: Hitbox;
    despawn: boolean;
    animations: Animation[];
    zIndex: number;
    constructor(minObstacle: MinObstacle);
    copy(minObstacle: MinObstacle): void;
    abstract render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
    abstract renderMap(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
    renderTick(time: number): void;
}
export declare class DummyObstacle extends Obstacle {
    render(_you: Player, _canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number): void;
    renderMap(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number): void;
}
