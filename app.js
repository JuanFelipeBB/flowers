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

    const allPoints = [];

    regions.forEach(region => {
        region.contour.forEach(point => {
            allPoints.push(point);
        });
    });

    const minX = Math.min(...allPoints.map(p => p[0]));
    const maxX = Math.max(...allPoints.map(p => p[0]));

    const minY = Math.min(...allPoints.map(p => p[1]));
    const maxY = Math.max(...allPoints.map(p => p[1]));

    const width = maxX - minX;
    const height = maxY - minY;

    const scale = Math.min(
        600 / width,
        600 / height
    );

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Cantidad de regiones dibujadas por frame
    const POINTS_PER_FRAME = 30;

    let currentRegion = 0;
    let currentPoint = 0;

    function animate() {

        if (currentRegion >= regions.length) {
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

            points.forEach((point, index) => {

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
            });

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

drawFromJson("rosas.json");
