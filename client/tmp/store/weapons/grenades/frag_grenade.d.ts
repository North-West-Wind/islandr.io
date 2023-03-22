import { GrenadeWeapon } from "../../../types/weapon";
import { Player } from "../../entities";
export default class FragGrenade extends GrenadeWeapon {
    static readonly ID = "frag_grenade";
    constructor();
    render(player: Player, _canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}
