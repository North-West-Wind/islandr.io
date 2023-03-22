import { Vec2 } from "./math";
export interface Animation {
    id: string;
    duration: number;
}
export declare class DefinedAnimation {
    id: string;
    positions: Vec2[];
    rotations: Vec2[];
    keyframes: number[];
    duration: number;
    constructor(id: string, positions: Vec2[], rotations: Vec2[], keyframes: number[], duration: number);
}
