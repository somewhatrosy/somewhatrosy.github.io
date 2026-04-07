const canvas = document.getElementById("word-canvas");
const ctx    = canvas.getContext("2d");

const word       = "rose";
const fontFamily = "Arial";

const passes = [
    // { count: 40,  min: 28, max: 42, alphaMin: 0.25, alphaMax: 0.40 },
    // 5{ count: 90,  min: 18, max: 28, alphaMin: 0.45, alphaMax: 0.70 },
    { count: 1000, min: 18, max: 18, alphaMin: 0.90, alphaMax: 0.90 }
];

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function inside(data, width, height, x, y) {
    x = Math.floor(x);
    y = Math.floor(y);

    if (x < 0 || x >= width || y < 0 || y >= height) {
        return false;
    }

    const i = (y * width + x) * 4;
    return data[i + 3] > 10;
}

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr  = window.devicePixelRatio || 1;

    canvas.width  = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    draw();
}

function draw() {
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#e6b7f0";
    ctx.fillRect(0, 0, W, H);

    const bigFontSize = H * 0.52;

    const maskCanvas  = document.createElement("canvas");
    maskCanvas.width  = W;
    maskCanvas.height = H;
    
    const mctx = maskCanvas.getContext("2d");
    mctx.fillStyle    = "black";
    mctx.textAlign    = "left";
    mctx.textBaseline = "top";
    mctx.font         = `700 ${bigFontSize}px ${fontFamily}`;

    const wordMetrics = mctx.measureText(word);
    const startX      = -wordMetrics.actualBoundingBoxLeft;
    const startY      = 0;

    mctx.fillText(word, startX, startY);
    const maskData = mctx.getImageData(0, 0, W, H).data;

    let x = startX;

    for (const ch of word) {
        const metrics = mctx.measureText(ch);

        const left   = x;
        const right  = x + metrics.width;
        const top    = 0;
        const bottom = bigFontSize;

        for (const pass of passes) {
            for (let i = 0; i < pass.count; i++) {
                let px = 0;
                let py = 0;
                let found = false;

                for (let tries = 0; tries < 100 && !found; tries++) {
                    px = rand(left, right);
                    py = rand(top, bottom);

                    found = inside(maskData, W, H, px, py);
                }

                if (!found) {
                    continue;
                }

                const size = rand(
                    pass.min * (bigFontSize / 260),
                    pass.max * (bigFontSize / 260)
                );
                const alpha = 1.0; // rand(pass.alphaMin, pass.alphaMax)
                const angle = rand(-0.2, 0.2);

                ctx.save();
                ctx.translate(px, py);
                // ctx.rotate(angle);
                
                ctx.globalAlpha = alpha;
                ctx.font        = `700 ${size}px ${fontFamily}`;
                ctx.lineWidth   = Math.max(1.2, size * 0.08);
                ctx.strokeStyle = "black";
                ctx.strokeText(ch, 0, 0);

                ctx.fillStyle = "red";
                ctx.fillText(ch, 0, 0);
                ctx.restore();
            }
        }

        x += metrics.width;
    }
}

let resizeTimeout = null;

window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 100);
});

setInterval(() => {
  draw();
}, 333);

resizeCanvas();