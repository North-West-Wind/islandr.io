import { Player } from "../store/entities";

export interface Renderable {
	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}

export interface RenderableLayerN1 {
	renderLayerN1(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}

export interface RenderableMap {
	renderMap(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}

export interface RenderableMapLayerN1 {
	renderMapLayerN1(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}

export interface BorderedTerrain extends RenderableLayerN1, RenderableMapLayerN1 {
	border: number;
	secondaryColor: number;
}