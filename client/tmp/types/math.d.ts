import { Player } from "../store/entities";
import { MinLine, MinVec2 } from "./minimized";
export declare class Vec2 {
    static ZERO: Vec2;
    static ONE: Vec2;
    static fromMinVec2(minVec2: MinVec2): Vec2;
    x: number;
    y: number;
    constructor(x: number, y: number);
    magnitudeSqr(): number;
    magnitude(): number;
    inverse(): Vec2;
    unit(): Vec2;
    dot(vec: Vec2): number;
    angleBetween(vec: Vec2): number;
    angle(): number;
    addAngle(radian: number): Vec2;
    addVec(vec: Vec2): Vec2;
    addX(x: number): Vec2;
    addY(y: number): Vec2;
    scale(x: number, y: number): Vec2;
    scaleAll(ratio: number): Vec2;
    projectTo(vec: Vec2): Vec2;
    distanceSqrTo(vec: Vec2): number;
    distanceTo(vec: Vec2): number;
    perpendicular(): Vec2;
    equals(vec: Vec2): boolean;
    render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number, position: Vec2): void;
    renderPoint(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number, position: Vec2): void;
}
export declare class Line {
    static fromMinLine(minLine: MinLine): Line;
    static fromPointSlope(p: Vec2, m: number): Line;
    readonly a: Vec2;
    readonly b: Vec2;
    segment: boolean;
    constructor(a: Vec2, b: Vec2, segment?: boolean);
    direction(point: Vec2): number;
    distanceSqrTo(point: Vec2): number;
    distanceTo(point: Vec2): number;
    intersects(line: Line): boolean;
    passthrough(point: Vec2): boolean;
    leftTo(point: Vec2): boolean;
    rightTo(point: Vec2): boolean;
    slope(): number | undefined;
    yIntercept(): number | undefined;
    toVec(): Vec2;
    toParallel(distance: number, overrideSegment?: boolean): Line[];
    intersection(line: Line): Vec2 | undefined;
}
export declare class RectHitbox {
    static ZERO: RectHitbox;
    type: string;
    width: number;
    height: number;
    comparable: number;
    constructor(width: number, height: number);
}
export declare class CircleHitbox {
    static ZERO: CircleHitbox;
    type: string;
    radius: number;
    comparable: number;
    constructor(radius: number);
}
export declare type Hitbox = RectHitbox | CircleHitbox;
export declare enum MovementDirection {
    RIGHT = 0,
    UP = 1,
    LEFT = 2,
    DOWN = 3
}
