export declare function wait(ms: number): Promise<unknown>;
export declare function clamp(val: number, min: number, max: number): number;
export declare function circleFromCenter(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, fill?: boolean, stroke?: boolean): void;
export declare function lineBetween(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, stroke?: boolean): void;
export declare function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number | {
    tl?: number;
    tr?: number;
    br?: number;
    bl?: number;
}, fill?: boolean, stroke?: boolean): void;
export declare function toDegrees(radian: number): number;
