"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementDirection = exports.CircleHitbox = exports.RectHitbox = exports.Line = exports.Vec2 = void 0;
// Linear algebra paid off! (2D vector)
class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static fromMinVec2(minVec2) {
        return new Vec2(minVec2.x, minVec2.y);
    }
    magnitudeSqr() {
        return this.x * this.x + this.y * this.y;
    }
    magnitude() {
        return Math.sqrt(this.magnitudeSqr());
    }
    inverse() {
        return new Vec2(-this.x, -this.y);
    }
    unit() {
        const mag = this.magnitude();
        if (mag === 0)
            return Vec2.ZERO;
        return new Vec2(this.x / mag, this.y / mag);
    }
    dot(vec) {
        return this.x * vec.x + this.y * vec.y;
    }
    angleBetween(vec) {
        return Math.acos(this.dot(vec) / (this.magnitude() * vec.magnitude()));
    }
    angle() {
        // Magnitude of unit vector is 1
        const angle = Math.acos((this.x) / (this.magnitude()));
        if (this.y > 0)
            return angle;
        else
            return -angle;
    }
    addAngle(radian) {
        const angle = this.angle() + radian;
        const mag = this.magnitude();
        return new Vec2(mag * Math.cos(angle), mag * Math.sin(angle));
    }
    addVec(vec) {
        return new Vec2(this.x + vec.x, this.y + vec.y);
    }
    addX(x) {
        return new Vec2(this.x + x, this.y);
    }
    addY(y) {
        return new Vec2(this.x, this.y + y);
    }
    scale(x, y) {
        return new Vec2(this.x * x, this.y * y);
    }
    scaleAll(ratio) {
        return this.scale(ratio, ratio);
    }
    projectTo(vec) {
        return vec.scaleAll(this.dot(vec) / vec.magnitudeSqr());
    }
    distanceSqrTo(vec) {
        return this.addVec(vec.inverse()).magnitudeSqr();
    }
    distanceTo(vec) {
        return Math.sqrt(this.distanceSqrTo(vec));
    }
    perpendicular() {
        return new Vec2(this.y, -this.x);
    }
    equals(vec) {
        return this.x === vec.x && this.y === vec.y;
    }
    // For debug purposes
    render(you, canvas, ctx, scale, position) {
        const relative = position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.x * scale, this.y * scale);
        ctx.stroke();
        ctx.resetTransform();
    }
    renderPoint(you, canvas, ctx, scale, position) {
        const relative = position.addVec(you.position.inverse());
        ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo((this.x - position.x) * scale, (this.y - position.y) * scale);
        ctx.stroke();
        ctx.resetTransform();
    }
}
exports.Vec2 = Vec2;
Vec2.ZERO = new Vec2(0, 0);
Vec2.ONE = new Vec2(1, 0);
class Line {
    constructor(a, b, segment) {
        // Making sure b is always right of a
        if (a.x < b.x) {
            this.a = a;
            this.b = b;
        }
        else {
            this.a = b;
            this.b = a;
        }
        if (segment === undefined)
            this.segment = true;
        else
            this.segment = segment;
    }
    static fromMinLine(minLine) {
        return new Line(Vec2.fromMinVec2(minLine.a), Vec2.fromMinVec2(minLine.b), minLine.segment);
    }
    static fromPointSlope(p, m) {
        const b = new Vec2(p.x + 1, (p.y + 1) * m);
        return new Line(p, b, false);
    }
    direction(point) {
        return (this.b.y - this.a.y) * (point.x - this.b.x) - (this.b.x - this.a.x) * (point.y - this.b.y);
    }
    distanceSqrTo(point) {
        const ab = this.toVec();
        const ae = point.addVec(this.a.inverse());
        if (this.segment) {
            const be = point.addVec(this.b.inverse());
            const abbe = ab.dot(be);
            const abae = ab.dot(ae);
            if (abbe > 0)
                return be.magnitude();
            if (abae < 0)
                return ae.magnitude();
            const a = this.b.y - this.a.y;
            const b = this.a.x - this.b.x;
            const c = (this.b.x - this.a.x) * this.a.y - (this.b.y - this.a.y) * this.a.x;
            return Math.pow(a * point.x + b * point.y + c, 2) / (a * a + b * b);
        }
        else
            return ae.projectTo(ab.perpendicular()).magnitudeSqr();
    }
    distanceTo(point) {
        return Math.sqrt(this.distanceSqrTo(point));
    }
    intersects(line) {
        const dir1 = line.direction(this.a);
        const dir2 = line.direction(this.b);
        const dir3 = this.direction(line.a);
        const dir4 = this.direction(line.b);
        if (dir1 != dir2 && dir3 != dir4)
            return true;
        if (dir1 == 0 && line.passthrough(this.a))
            return true;
        if (dir2 == 0 && line.passthrough(this.b))
            return true;
        if (dir3 == 0 && line.passthrough(line.a))
            return true;
        if (dir4 == 0 && line.passthrough(line.b))
            return true;
        return false;
    }
    passthrough(point) {
        const m = this.slope();
        // This is a vertical line
        if (m === undefined) {
            if (point.x != this.a.x)
                return false;
            if (this.segment && (point.y < Math.min(this.a.y, this.b.y) || point.y > Math.max(this.a.y, this.b.y)))
                return false;
            return true;
        }
        // y = mx + c
        const c = this.a.y - m * this.a.x;
        if (point.y != m * point.x + c)
            return false;
        if (this.segment && (point.x < this.a.x || point.x > this.b.x || point.y < Math.min(this.a.y, this.b.y) || point.y > Math.max(this.a.y, this.b.y)))
            return false;
        return true;
    }
    leftTo(point) {
        const m = this.slope();
        if (m === undefined)
            return point.x < this.a.x;
        // x = (y - c) / m
        const c = this.a.y - m * this.a.x;
        return point.x < (point.y - c) / m;
    }
    rightTo(point) {
        const m = this.slope();
        if (m === undefined)
            return point.x > this.a.x;
        // x = (y - c) / m
        const c = this.a.y - m * this.a.x;
        return point.x > (point.y - c) / m;
    }
    slope() {
        if (this.b.x - this.a.x == 0)
            return undefined;
        return (this.b.y - this.a.y) / (this.b.x - this.a.x);
    }
    yIntercept() {
        const m = this.slope();
        if (m === undefined)
            return undefined;
        return this.a.y - m * this.a.x;
    }
    toVec() {
        return this.b.addVec(this.a.inverse());
    }
    toParallel(distance, overrideSegment) {
        if (overrideSegment === undefined)
            overrideSegment = this.segment;
        var per = this.toVec().perpendicular().unit().scaleAll(distance);
        const line1 = new Line(this.a.addVec(per), this.b.addVec(per), overrideSegment);
        per = per.inverse();
        const line2 = new Line(this.a.addVec(per), this.b.addVec(per), overrideSegment);
        return [line1, line2];
    }
    intersection(line) {
        if (this.a.equals(line.a) && this.b.equals(line.b))
            return undefined;
        if (this.yIntercept() === undefined && line.yIntercept() === undefined)
            return undefined;
        else if (this.yIntercept() === undefined)
            return new Vec2(this.a.x, line.slope() * this.a.x + line.yIntercept());
        else if (line.yIntercept() === undefined)
            return new Vec2(line.a.x, this.slope() * line.a.x + this.yIntercept());
        const x = (line.yIntercept() - this.yIntercept()) / (this.slope() - line.slope());
        const point = new Vec2(x, this.slope() * x + this.yIntercept());
        if (this.segment && !this.passthrough(point) || line.segment && !line.passthrough(point))
            return undefined;
        return point;
    }
}
exports.Line = Line;
// Rectangle hitbox with a width and height
class RectHitbox {
    constructor(width, height) {
        this.type = "rect";
        this.width = width;
        this.height = height;
        this.comparable = Math.sqrt(Math.pow(this.width / 2, 2) + Math.pow(this.height / 2, 2));
    }
}
exports.RectHitbox = RectHitbox;
RectHitbox.ZERO = new RectHitbox(0, 0);
// Circular hitbox with a radius
class CircleHitbox {
    constructor(radius) {
        this.type = "circle";
        this.comparable = this.radius = radius;
    }
}
exports.CircleHitbox = CircleHitbox;
CircleHitbox.ZERO = new CircleHitbox(0);
var MovementDirection;
(function (MovementDirection) {
    MovementDirection[MovementDirection["RIGHT"] = 0] = "RIGHT";
    MovementDirection[MovementDirection["UP"] = 1] = "UP";
    MovementDirection[MovementDirection["LEFT"] = 2] = "LEFT";
    MovementDirection[MovementDirection["DOWN"] = 3] = "DOWN";
})(MovementDirection = exports.MovementDirection || (exports.MovementDirection = {}));
//# sourceMappingURL=math.js.map