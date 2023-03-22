"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiverSegment = void 0;
const math_1 = require("../../types/math");
const terrain_1 = require("../../types/terrain");
const _1 = require(".");
class RiverSegmentSupplier {
    create(minTerrain) {
        return new RiverSegment(minTerrain);
    }
}
class RiverSupplier {
    create(minTerrain) {
        return new River(minTerrain);
    }
}
class RiverSegment extends terrain_1.LineTerrain {
    constructor() {
        super(...arguments);
        this.id = RiverSegment.ID;
        this.color = 0x3481ab;
        this.secondaryColor = 0x905e26;
    }
    renderLayerN1(you, canvas, ctx, scale) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-you.position.x, -you.position.y);
        const lines = this.line.toParallel(this.range + this.border, false);
        const start = new math_1.Line(this.line.a, this.boundary.start.addVec(this.line.a), false);
        const end = new math_1.Line(this.line.b, this.boundary.end.addVec(this.line.b), false);
        const a = lines[0].intersection(start);
        if (!a)
            return;
        const b = lines[0].intersection(end);
        if (!b)
            return;
        const c = lines[1].intersection(end);
        if (!c)
            return;
        const d = lines[1].intersection(start);
        if (!d)
            return;
        ctx.fillStyle = this.colorToHex(this.secondaryColor);
        ctx.beginPath();
        ctx.moveTo(a.x - 1 / scale, a.y - 1 / scale);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(d.x - 1 / scale, d.y - 1 / scale);
        ctx.closePath();
        ctx.fill();
        ctx.resetTransform();
    }
    renderMapLayerN1(_canvas, ctx, scale) {
        ctx.scale(scale, scale);
        const lines = this.line.toParallel(this.range + this.border, false);
        const start = new math_1.Line(this.line.a, this.boundary.start.addVec(this.line.a), false);
        const end = new math_1.Line(this.line.b, this.boundary.end.addVec(this.line.b), false);
        const a = lines[0].intersection(start);
        if (!a)
            return;
        const b = lines[0].intersection(end);
        if (!b)
            return;
        const c = lines[1].intersection(end);
        if (!c)
            return;
        const d = lines[1].intersection(start);
        if (!d)
            return;
        ctx.fillStyle = this.colorToHex(this.secondaryColor);
        ctx.beginPath();
        ctx.moveTo(a.x - 1 / scale, a.y - 1 / scale);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(d.x - 1 / scale, d.y - 1 / scale);
        ctx.closePath();
        ctx.fill();
        ctx.resetTransform();
    }
}
exports.RiverSegment = RiverSegment;
RiverSegment.ID = "river_segment";
(() => {
    _1.TERRAIN_SUPPLIERS.set(RiverSegment.ID, new RiverSegmentSupplier());
})();
class River extends terrain_1.PiecewiseTerrain {
    constructor(minTerrain) {
        super(minTerrain);
        this.id = River.ID;
        this.color = 0xFF3481ab;
        this.secondaryColor = 0xFF905e26;
    }
    renderLayerN1(you, canvas, ctx, scale) {
        this.lines.forEach(line => line.renderLayerN1(you, canvas, ctx, scale));
    }
    renderMapLayerN1(canvas, ctx, scale) {
        this.lines.forEach(line => line.renderMapLayerN1(canvas, ctx, scale));
    }
}
exports.default = River;
River.ID = "river";
(() => {
    _1.TERRAIN_SUPPLIERS.set(River.ID, new RiverSupplier());
})();
//# sourceMappingURL=river.js.map