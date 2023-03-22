"use strict";
// This file records the state of things
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleBigMap = exports.isBigMap = exports.toggleMinimap = exports.isMapHidden = exports.toggleMap = exports.isMapOpened = exports.toggleHud = exports.isHudHidden = exports.toggleMenu = exports.isMenuHidden = exports.removeMousePressed = exports.addMousePressed = exports.isMousePressed = exports.removeKeyPressed = exports.addKeyPressed = exports.isKeyPressed = void 0;
const keyPressed = new Map();
function isKeyPressed(key) { return !!keyPressed.get(key); }
exports.isKeyPressed = isKeyPressed;
function addKeyPressed(key) { keyPressed.set(key, true); }
exports.addKeyPressed = addKeyPressed;
function removeKeyPressed(key) { keyPressed.delete(key); }
exports.removeKeyPressed = removeKeyPressed;
const mousePressed = new Map();
function isMousePressed(button) { return !!mousePressed.get(button); }
exports.isMousePressed = isMousePressed;
function addMousePressed(button) { mousePressed.set(button, true); }
exports.addMousePressed = addMousePressed;
function removeMousePressed(button) { mousePressed.delete(button); }
exports.removeMousePressed = removeMousePressed;
var menuHidden = true;
function isMenuHidden() { return menuHidden; }
exports.isMenuHidden = isMenuHidden;
function toggleMenu() { menuHidden = !menuHidden; }
exports.toggleMenu = toggleMenu;
var hudHidden = false;
function isHudHidden() { return hudHidden; }
exports.isHudHidden = isHudHidden;
function toggleHud() { hudHidden = !hudHidden; }
exports.toggleHud = toggleHud;
var mapOpened = false;
function isMapOpened() { return mapOpened; }
exports.isMapOpened = isMapOpened;
function toggleMap() { mapOpened = !mapOpened; }
exports.toggleMap = toggleMap;
var mapHidden = false;
function isMapHidden() { return mapHidden; }
exports.isMapHidden = isMapHidden;
function toggleMinimap() { mapHidden = !mapHidden; }
exports.toggleMinimap = toggleMinimap;
var bigMap = false;
function isBigMap() { return bigMap; }
exports.isBigMap = isBigMap;
function toggleBigMap() { bigMap = !bigMap; }
exports.toggleBigMap = toggleBigMap;
//# sourceMappingURL=states.js.map