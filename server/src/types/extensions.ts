import { Player } from "../store/entities";

export interface PickupableEntity {
	// Return: Successfully picked up or not
	picked(player: Player): boolean;
}

export interface BorderedTerrain {
	border: number;
}