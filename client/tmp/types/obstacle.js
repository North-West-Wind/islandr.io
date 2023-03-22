"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyObstacle = exports.Obstacle = void 0;
const math_1 = require("./math");
const animations_1 = require("../store/animations");
// Obstacles inside the game
class Obstacle {
    constructor(minObstacle) {
        this.animations = [];
        this.zIndex = 0;
        this.copy(minObstacle);
    }
    copy(minObstacle) {
        this.id = minObstacle.id;
        this.type = minObstacle.type;
        this.position = new math_1.Vec2(minObstacle.position.x, minObstacle.position.y);
        this.direction = new math_1.Vec2(minObstacle.direction.x, minObstacle.direction.y);
        if (minObstacle.hitbox.type === "rect") {
            const rect = minObstacle.hitbox;
            this.hitbox = new math_1.RectHitbox(rect.width, rect.height);
        }
        else {
            const circle = minObstacle.hitbox;
            this.hitbox = new math_1.CircleHitbox(circle.radius);
        }
        this.despawn = minObstacle.despawn;
        for (const anim of minObstacle.animations)
            if (animations_1.DEFINED_ANIMATIONS.has(anim))
                this.animations.push({ id: anim, duration: animations_1.DEFINED_ANIMATIONS.get(anim).duration });
    }
    renderTick(time) {
        const removable = [];
        for (let ii = 0; ii < this.animations.length; ii++) {
            this.animations[ii].duration -= time;
            if (this.animations[ii].duration <= 0)
                removable.push(ii);
        }
        for (let ii = removable.length - 1; ii >= 0; ii--)
            this.animations.splice(removable[ii], 1);
    }
}
exports.Obstacle = Obstacle;
// Dummy obstacle for default casting
class DummyObstacle extends Obstacle {
    render(_you, _canvas, _ctx, _scale) { }
    renderMap(_canvas, _ctx, _scale) { }
}
exports.DummyObstacle = DummyObstacle;
//# sourceMappingURL=obstacle.js.map