export enum CollisionType {
	// No intersection
	NONE = 0,
	// Circle-circle intersection
	CIRCLE_CIRCLE = 1,
	// Rectangle-rectangle intersection
	RECT_RECT = 2,
	// Circle-rectangle intersection, with the circle's center inside the rectangle
	CIRCLE_RECT_CENTER_INSIDE = 3,
	// Circle-rectangle intersection, with point(s) of the rectangle inside the circle
	CIRCLE_RECT_POINT_INSIDE = 4,
	// Circle-rectangle intersection, with line(s) of the rectangle inside the circle
	CIRCLE_RECT_LINE_INSIDE = 5
}

// The 4 movement directions
export enum MovementDirection {
	RIGHT = 0,
	UP = 1,
	LEFT = 2,
	DOWN = 3
}

export enum GunColor {
	YELLOW = 0, // 9mm
	RED = 1, // 12 gauge
	BLUE = 2, // 7.62mm
	GREEN = 3, // 5.56mm
	BLACK = 4, // .50 AE
	OLIVE = 5, // .308 Subsonic
	ORANGE = 6, // Flare
	PURPLE = 7, // .45 ACP
	TEAL = 8, // 40mm
	BROWN = 9, // potato
	PINK = 10, // Heart
	PURE_BLACK = 11, // Rainbow
	CURSED = 12,
	BUGLE = 13,
}
//for the reverse.
export enum ReverseGunColour {
	a0 = "9mm", // 9mm
	a1 = "12 gauge", // 12 gauge
	a2 = "7.62mm", // 7.62mm
	a3 = "5.56mm", // 5.56mm
	a4 = ".50 AE", // .50 AE
	a5 = ".308 subsonic", // .308 Subsonic
	a6 = "Flare", // Flare
	a7 = ".45 ACP", // .45 ACP
	a8 = "40mm", // 40mm
	a9 = "Potatoes", // potato
	a10 = "Hearts", // Heart
	a11 = "Rainbow", // Rainbow
	a12 = "Cursed",
	a13 = "Bugle",
}

export type CountableString = {
	[key: string]: number;
}