import { Entity } from "./entity";
import { MinEntity, MinObstacle, MinTerrain } from "./minimized";
import { Obstacle } from "./obstacle";
import { Terrain } from "./terrain";
import { Weapon } from "./weapon";
interface Supplier<T> {
    create(...arg: any[]): T;
}
export interface EntitySupplier extends Supplier<Entity> {
    create(minEntity: MinEntity & any): Entity;
}
export interface ObstacleSupplier extends Supplier<Obstacle> {
    create(minObstacle: MinObstacle & any): Obstacle;
}
export interface TerrainSupplier extends Supplier<Terrain> {
    create(minTerrain: MinTerrain & any): Terrain;
}
export interface WeaponSupplier extends Supplier<Weapon> {
    create(...arg: any[]): Weapon;
}
export {};
