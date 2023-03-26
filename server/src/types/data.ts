import { GunColor } from "./misc"

export interface BulletStats {
	damage: number
	objDamage?: number
	falloff: number
	speed: number
	range: number[]
	suppressed: boolean
	noClip?: boolean
}

interface GunStats {
	capacity: number
	reload: {
		bullets?: number
		time: number
	}
	delay: {
		switch: number
		firing: number
		burst?: number
	}
	spread: {
		still: number
		move: number
	}
	bullets: number
	bursts?: number
	speed: {
		equip: number
		attack: number
	}
	headshot: number
	recoil?: number
	bullet: BulletStats
}

export interface TracerData {
	type: string
	width: number
	length: number
}

export type GunData = {
	[key: string]: Partial<GunStats>
} & {
	name: string
	color: GunColor
	ammo: number
	dual: boolean
	auto?: boolean
	length: number
	droppable: boolean
	normal: GunStats
	visuals: {
		tracer: TracerData
		animations: string[]
		image: string
	}
}

interface MeleeStats {
	noArmor?: boolean
	noStone?: boolean
	cleave?: boolean
	damage: number
	multiplier: {
		headshot: number
		obstacle: number
	},
	damageDelay: number
	cooldown: number
	offset: {
		x: number
		y: number
	},
	radius: number
	speed: {
		equip: number
		attack: number
	}
}

export type MeleeData = {
	[key: string]: Partial<MeleeStats>
} & {
	name: string
	reflective?: boolean
	auto?: boolean
	droppable: boolean
	normal: MeleeStats
	visuals: {
		animations: string[]
	}
}

interface TracerColor {
	color: {
		regular: string;
		saturated: string;
		chambered: string;
	}
}

export type TracerColorData = {
	[key: string]: TracerColor;
}

interface TypeLootTableEntry {
	rarity: number;
	weight: number;
	amount?: number;
}

export type TypeLootTableData = {
	[key: string]: TypeLootTableEntry;
}

export type LootTableData = {
	rolls: number;
	rarity: number;
	entries: string[];
}