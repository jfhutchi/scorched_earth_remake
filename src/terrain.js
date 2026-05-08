// Terrain represented as a height map: heights[x] = top-of-ground y for each x.
// Smaller y = higher peak (canvas y grows downward).

export class Terrain {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.heights = new Float32Array(width);
        this.color = '#6b4f2c';      // dirt
        this.grassColor = '#3aa853'; // grass cap
        this.generate();
    }

    // Layered sine waves + small random jitter produce a hilly silhouette.
    generate() {
        const w = this.width;
        const h = this.height;
        const baseline = h * 0.7;
        const amp1 = h * 0.10;
        const amp2 = h * 0.05;
        const amp3 = h * 0.03;
        const phase1 = Math.random() * Math.PI * 2;
        const phase2 = Math.random() * Math.PI * 2;
        const phase3 = Math.random() * Math.PI * 2;
        const freq1 = (Math.PI * 2) / w * (1.5 + Math.random());
        const freq2 = (Math.PI * 2) / w * (3.5 + Math.random() * 2);
        const freq3 = (Math.PI * 2) / w * (8 + Math.random() * 4);

        for (let x = 0; x < w; x++) {
            const y =
                baseline -
                Math.sin(x * freq1 + phase1) * amp1 -
                Math.sin(x * freq2 + phase2) * amp2 -
                Math.sin(x * freq3 + phase3) * amp3 +
                (Math.random() - 0.5) * 4;
            // Clamp so terrain is always on screen with some sky.
            this.heights[x] = Math.max(h * 0.25, Math.min(h - 20, y));
        }

        // Light smoothing pass to soften jitter without losing hill shape.
        const smooth = new Float32Array(w);
        for (let x = 0; x < w; x++) {
            const a = this.heights[Math.max(0, x - 1)];
            const b = this.heights[x];
            const c = this.heights[Math.min(w - 1, x + 1)];
            smooth[x] = (a + b + c) / 3;
        }
        this.heights = smooth;
    }

    // Sample height at any x (clamped + interpolated).
    heightAt(x) {
        if (x < 0) return this.heights[0];
        if (x >= this.width - 1) return this.heights[this.width - 1];
        const xi = Math.floor(x);
        const t = x - xi;
        return this.heights[xi] * (1 - t) + this.heights[xi + 1] * t;
    }

    // Carve a circular crater centered at (cx, cy). For each x in the blast,
    // the circle's lower intersection with that column is bottomOfHole; we
    // collapse the ground top down to that y. Heightmaps can't represent
    // overhangs, so material above an air pocket falls in — same simplification
    // most artillery games make and it reads as a clean crater.
    explode(cx, cy, radius) {
        const xMin = Math.max(0, Math.floor(cx - radius));
        const xMax = Math.min(this.width - 1, Math.ceil(cx + radius));
        for (let x = xMin; x <= xMax; x++) {
            const dx = x - cx;
            const inside = radius * radius - dx * dx;
            if (inside <= 0) continue;
            const halfChord = Math.sqrt(inside);
            const bottomOfHole = cy + halfChord;
            if (bottomOfHole > this.heights[x]) {
                this.heights[x] = Math.min(this.height, bottomOfHole);
            }
        }
    }

    draw(ctx) {
        const w = this.width;
        const h = this.height;

        // Filled ground polygon.
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, this.heights[0]);
        for (let x = 1; x < w; x++) {
            ctx.lineTo(x, this.heights[x]);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();

        // Grass strip on top.
        ctx.beginPath();
        ctx.moveTo(0, this.heights[0]);
        for (let x = 1; x < w; x++) {
            ctx.lineTo(x, this.heights[x]);
        }
        ctx.strokeStyle = this.grassColor;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
}
