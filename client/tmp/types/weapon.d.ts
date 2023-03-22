import { Player } from "../store/entities";
import { MinWeapon } from "./minimized";
import { Renderable } from "./extenstions";
import { GunData, MeleeData } from "./data";
import { GunColor } from "../constants";
export declare enum WeaponType {
    MELEE = "melee",
    GUN = "gun",
    GRENADE = "grenade"
}
export declare abstract class Weapon implements MinWeapon, Renderable {
    type: WeaponType;
    id: string;
    name: string;
    constructor(id: string, name: string);
    abstract render(player: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}
export declare class MeleeWeapon extends Weapon {
    type: WeaponType;
    static readonly FIST_ANIMATIONS: string[];
    constructor(id: string, data: MeleeData);
    render(player: Player, _canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}
export declare class GunWeapon extends Weapon {
    type: WeaponType;
    color: GunColor;
    length: number;
    magazine: number;
    constructor(id: string, data: GunData, magazine?: number);
    render(player: Player, _canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}
export declare abstract class GrenadeWeapon extends Weapon {
    type: WeaponType;
}
export declare class DummyWeapon extends Weapon {
    render(_player: Player, _canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number): void;
}
