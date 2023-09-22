// This file records the state of things

import { KeyBind } from "./constants";

const keyPressed = new Map<string, boolean>();
export function isKeyPressed(key: KeyBind | string) { return !!keyPressed.get(key); }
export function addKeyPressed(key: KeyBind | string) { keyPressed.set(key, true); }
export function removeKeyPressed(key: KeyBind | string) { keyPressed.delete(key); }
const mousePressed = new Map<number, boolean>();
export function isMousePressed(button: number) { return !!mousePressed.get(button); }
export function addMousePressed(button: number) { mousePressed.set(button, true); }
export function removeMousePressed(button: number) { mousePressed.delete(button); }

var menuHidden = true;
export function isMenuHidden() { return menuHidden; }
export function toggleMenu() { menuHidden = !menuHidden; }

var hudHidden = false;
export function isHudHidden() { return hudHidden; }
export function toggleHud() {
	hudHidden = !hudHidden;
	if (hudHidden) document.getElementById("hud")!.classList.add("hidden");
	else document.getElementById("hud")!.classList.remove("hidden");
}

var mapOpened = false;
export function isMapOpened() { return mapOpened; }
export function toggleMap() { mapOpened = !mapOpened; }

var mapHidden = false;
export function isMapHidden() { return mapHidden; }
export function toggleMinimap() { mapHidden = !mapHidden; }

var bigMap = false;
export function isBigMap() { return bigMap; }
export function toggleBigMap() { bigMap = !bigMap; }


var mouseDisabled = false;
export function isMouseDisabled() { return mouseDisabled; }
export function toggleMouseDisabled() { mouseDisabled = !mouseDisabled; }

// Used when cookies are not accepted
var username: string;
export function getUsername() { return username; }
export function setUsername(u: string) { return username = u; }

export var  token: string | undefined;
export function getToken() { return token; }
export function setToken(t?: string) { token = t; return token = t; }