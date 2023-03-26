import * as fs from "fs";
import { Ammo, Grenade, Gun } from "../store/entities";
import Backpack from "../store/entities/backpack";
import { WEAPON_SUPPLIERS } from "../store/weapons";
import { LootTableData, TypeLootTableData } from "./data";
import { Entity } from "./entity";
import { GrenadeWeapon, GunWeapon, WeaponType } from "./weapon";

class TypeLootTable {
	static readonly MAX_RARITY = 5;
	entries: Map<string, { weight: number, amount: number }>[] = [];

	constructor(data: TypeLootTableData) {
		for (let ii = 0; ii <= TypeLootTable.MAX_RARITY; ii++) {
			const map = new Map<string, { weight: number, amount: number }>();
			for (const [key, value] of Object.entries(data))
				if (value.rarity == ii)
					map.set(key, { weight: value.weight, amount: value.amount || 1 });
			this.entries.push(map);
		}
	}

	roll(rarity = 0) {
		var keys: string[] = [];
		var values: { weight: number, amount: number }[] = [];
		while (!keys.length) {
			keys = [];
			values = [];
			for (let ii = rarity; ii <= TypeLootTable.MAX_RARITY; ii++)
				for (const [key, value] of this.entries[ii].entries()) {
					keys.push(key);
					values.push({ weight: value.weight, amount: value.amount || 1 });
				}
			rarity--;
		}

		// https://stackoverflow.com/questions/43566019/how-to-choose-a-weighted-random-array-element-in-javascript
		var i;
		var weights = [values[0].weight];
		for (i = 1; i < values.length; i++)
			weights[i] = values[i].weight + weights[i - 1];
		const random = Math.random() * weights[weights.length - 1];
		for (i = 0; i < weights.length; i++)
			if (weights[i] > random)
				break;
		return { id: keys[i], amount: values[i].amount };
	}
}

const TYPE_LOOT_TABLES = new Map<string, TypeLootTable>();
for (const file of fs.readdirSync("../data/loot_tables/type_loot_tables")) {
	if (file.startsWith(".") || !file.endsWith(".json")) continue;
	const table = new TypeLootTable(<TypeLootTableData>JSON.parse(fs.readFileSync("../data/loot_tables/type_loot_tables/" + file, { encoding: "utf8" })));
	TYPE_LOOT_TABLES.set(file.split(".")[0], table);
}

class LootTable {
	rolls: number;
	rarity: number;
	entries: string[];

	constructor(data: LootTableData) {
		this.rolls = data.rolls;
		this.rarity = data.rarity;
		this.entries = data.entries;
	}

	roll() {
		const entities: Entity[] = [];
		for (let ii = 0; ii < this.rolls; ii++) {
			const entry = this.entries[Math.floor(Math.random() * this.entries.length)];
			const table = TYPE_LOOT_TABLES.get(entry);
			if (!table) continue;
			const result = table.roll(this.rarity);
			switch (entry) {
				case "gun": {
					const supplier = WEAPON_SUPPLIERS.get(result.id);
					if (supplier) {
						const weapon = supplier.create();
						if (weapon.type != WeaponType.GUN) break;
						const gun = <GunWeapon>weapon;
						const entity = new Gun(gun.id, gun.color);
						const halfAmmo = Math.round(gun.ammo / 2);
						const ammo0 = new Ammo(halfAmmo, gun.color);
						const ammo1 = new Ammo(gun.ammo - halfAmmo, gun.color);
						entities.push(entity, ammo0, ammo1);
					}
					break;
				}
				case "backpack": {
					entities.push(new Backpack(parseInt(result.id)));
					break;
				}
				case "grenade": {
					const supplier = WEAPON_SUPPLIERS.get(result.id);
					if (supplier) {
						const weapon = supplier.create();
						if (weapon.type != WeaponType.GRENADE) break;
						entities.push(new Grenade((<GrenadeWeapon>weapon).id, result.amount));
						break;
					}
				}
			}
		}
		return entities;
	}
}

export const LOOT_TABLES = new Map<string, LootTable>();
for (const file of fs.readdirSync("../data/loot_tables")) {
	if (file.startsWith(".") || !file.endsWith(".json")) continue;
	const table = new LootTable(<LootTableData>JSON.parse(fs.readFileSync("../data/loot_tables/" + file, { encoding: "utf8" })));
	LOOT_TABLES.set(file.split(".")[0], table);
}