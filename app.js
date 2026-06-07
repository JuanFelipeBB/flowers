async function drawFromJson(jsonFile) {

    const response = await fetch(jsonFile);
    const regions = await response.json();

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    // Configuración para parecerse más a Turtle
    ctx.imageSmoothingEnabled = false;
    ctx.lineWidth = 0;
    ctx.strokeStyle = "transparent";

    // Fondo negro
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

    regions.forEach(region => {

        const color = `rgb(${Math.round(region.color[0])},
                           ${Math.round(region.color[1])},
                           ${Math.round(region.color[2])})`;

        const points = region.contour;

        if (!points || points.length < 3) {
            return;
        }

        ctx.beginPath();

        points.forEach((point, index) => {

            const x =
                (point[0] - centerX) * scale +
                canvas.width / 2;

            // Misma inversión Y que Turtle
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

        // NO usar stroke()
    });
}

drawFromJson("rosas.json");
