async function drawFromJson(jsonFile) {

    const response = await fetch(jsonFile);
    const regions = await response.json();

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const allPoints = [];

    regions.forEach(region => {
        region.contour.forEach(point => {
            allPoints.push(point);
        });
    });

    const xs = allPoints.map(p => p[0]);
    const ys = allPoints.map(p => p[1]);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);

    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;

    const scale = Math.min(
        600 / width,
        600 / height
    );

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    regions.forEach(region => {

        const color = `rgb(
            ${Math.round(region.color[0])},
            ${Math.round(region.color[1])},
            ${Math.round(region.color[2])}
        )`;

        ctx.beginPath();

        region.contour.forEach((point, index) => {

            const x =
                (point[0] - centerX) * scale +
                canvas.width / 2;

            const y =
                (centerY - point[1]) * scale +
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
    });
}

drawFromJson("lirio.json");