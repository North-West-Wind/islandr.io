import { TracerData } from "../../types/data";
import { Entity } from "../../types/entity";
import { MinEntity } from "../../types/minimized";
import Player from "./player";
interface AdditionalEntity {
    tracer: TracerData;
}
export default class Bullet extends Entity {
    static readonly TYPE = "bullet";
    type: string;
    tracer: TracerData;
    constructor(minEntity: MinEntity & AdditionalEntity);
    copy(minEntity: MinEntity & AdditionalEntity): void;
    render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}
export {};
