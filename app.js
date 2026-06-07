async function drawFromJson(jsonFile) {

    const response = await fetch(jsonFile);
    const regions = await response.json();

    // Opcional: dibujar primero las regiones grandes
    regions.sort((a, b) => b.area - a.area);

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;
    ctx.lineWidth = 0;
    ctx.strokeStyle = "transparent";

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let minX = Infinity;
    let maxX = -Infinity;

    let minY = Infinity;
    let maxY = -Infinity;

    for (const region of regions) {

        for (const point of region.contour) {

            const x = point[0];
            const y = point[1];

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;

            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    }

    const width = maxX - minX;
    const height = maxY - minY;

    const scale = Math.min(
        600 / width,
        600 / height
    );

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Cantidad de regiones dibujadas por frame
    const POINTS_PER_FRAME = 20;

    let currentRegion = 0;
    let currentPoint = 0;

    function drawWrappedText(
        ctx,
        text,
        x,
        y,
        maxWidth,
        lineHeight
    ) {
        const words = text.split(" ");
        let line = "";
        let lines = [];

        for (let n = 0; n < words.length; n++) {

            const testLine = line + words[n] + " ";
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + " ";
            } else {
                line = testLine;
            }
        }

        lines.push(line);

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(
                lines[i],
                x,
                y + i * lineHeight
            );
        }
    }

    function animate() {

        if (currentRegion >= regions.length) {

            ctx.fillStyle = "white";
            ctx.font = "26px serif";
            ctx.textAlign = "center";
            drawWrappedText(
                ctx,
                "Sé que no todo lo tenemos resuelto, y que el momento que vivimos " + 
                "puede causar mucha incertidumbre, pero hay algo que siempre me alienta a no "+
                "querer renunciar a lo nuestro, por eso, esta rosa para ti, con todo mi amor, "+
                "mi estimada ❤️",
                canvas.width / 2,
                canvas.height - 180,
                canvas.width * 0.8,
                36
            );

            return;
        }

        const region = regions[currentRegion];
        const points = region.contour;

        if (!points || points.length < 2) {
            currentRegion++;
            currentPoint = 0;
            requestAnimationFrame(animate);
            return;
        }

        const color = `rgb(
            ${region.color[0]},
            ${region.color[1]},
            ${region.color[2]}
        )`;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        for (
            let i = 0;
            i < POINTS_PER_FRAME &&
            currentPoint < points.length - 1;
            i++
        ) {

            const p1 = points[currentPoint];
            const p2 = points[currentPoint + 1];

            const x1 =
                (p1[0] - centerX) * scale +
                canvas.width / 2;

            const y1 =
                (p1[1] - centerY) * scale +
                canvas.height / 2;

            const x2 =
                (p2[0] - centerX) * scale +
                canvas.width / 2;

            const y2 =
                (p2[1] - centerY) * scale +
                canvas.height / 2;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            currentPoint++;
        }

        if (currentPoint >= points.length - 1) {

            ctx.beginPath();

            for (let index = 0; index < points.length; index++) {

                const point = points[index];

                const x =
                    (point[0] - centerX) * scale +
                    canvas.width / 2;

                const y =
                    (point[1] - centerY) * scale +
                    canvas.height / 2;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            };

            ctx.closePath();

            ctx.fillStyle = color;
            ctx.fill();

            currentRegion++;
            currentPoint = 0;
        }

        requestAnimationFrame(animate);
    }

    animate();
}

document
.getElementById("startBtn")
.addEventListener("click", async () => {

    const music =
        document.getElementById("bgMusic");

    music.volume = 0.6;

    try {
        await music.play();
    } catch (err) {
        console.error(err);
    }

    document.getElementById("startBtn")
        .style.display = "none";

    drawFromJson("rosas.json");
});
