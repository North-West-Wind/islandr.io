import { Entity, Inventory, PartialInventory } from "../../types/entity";
import { MinEntity, MinInventory } from "../../types/minimized";
interface AdditionalEntity {
    id: string;
    username: string;
    boost: number;
    scope: number;
    inventory: MinInventory | Inventory;
    canInteract?: boolean;
    reloadTicks: number;
    maxReloadTicks: number;
}
export default class Player extends Entity {
    static readonly TYPE = "player";
    type: string;
    id: string;
    username: string;
    inventory: PartialInventory | Inventory;
    zIndex: number;
    constructor(minEntity: MinEntity & AdditionalEntity);
    copy(minEntity: MinEntity & AdditionalEntity): void;
    render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;
}
export declare class PartialPlayer extends Player {
    inventory: PartialInventory;
}
export declare class FullPlayer extends Player {
    inventory: Inventory;
    boost: number;
    scope: number;
    canInteract?: boolean;
    reloadTicks: number;
    maxReloadTicks: number;
    copy(minEntity: MinEntity & AdditionalEntity): void;
}
export {};
