from PIL import Image
import numpy as np
import cv2
import json


def image_to_turtle_json(
        image_path,
        output_json,
        max_colors=18,
        min_area=30,
        min_brightness=40):

    print("Cargando imagen...")

    img = Image.open(image_path).convert("RGB")
    img = np.array(img)

    # Suavizado para eliminar ruido
    img = cv2.GaussianBlur(img, (5, 5), 0)

    # Mantiene formas pero reduce detalles agresivos
    img = cv2.bilateralFilter(
        img,
        d=9,
        sigmaColor=75,
        sigmaSpace=75
    )

    print("Cuantizando colores...")

    pixels = img.reshape((-1, 3))
    pixels = np.float32(pixels)

    criteria = (
        cv2.TERM_CRITERIA_EPS +
        cv2.TERM_CRITERIA_MAX_ITER,
        100,
        0.2
    )

    _, labels, centers = cv2.kmeans(
        pixels,
        max_colors,
        None,
        criteria,
        10,
        cv2.KMEANS_RANDOM_CENTERS
    )

    centers = np.uint8(centers)

    segmented = centers[labels.flatten()]
    segmented = segmented.reshape(img.shape)

    regions = []

    print("Extrayendo regiones...")

    for color in centers:

        r = int(color[0])
        g = int(color[1])
        b = int(color[2])

        brightness = (r + g + b) / 3

        # Ignorar colores muy oscuros
        if brightness < min_brightness:
            continue

        mask = cv2.inRange(
            segmented,
            color,
            color
        )

        contours, _ = cv2.findContours(
            mask,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        for contour in contours:

            area = cv2.contourArea(contour)

            if area < min_area:
                continue

            # Simplificar contorno
            epsilon = 0.02 * cv2.arcLength(contour, True)

            contour = cv2.approxPolyDP(
                contour,
                epsilon,
                True
            )

            contour_points = [
                [int(pt[0][0]), int(pt[0][1])]
                for pt in contour
            ]

            if len(contour_points) < 3:
                continue

            M = cv2.moments(contour)

            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
            else:
                cx = 0
                cy = 0

            regions.append({
                "color": [r, g, b],
                "contour": contour_points,
                "center": [cx, cy],
                "area": float(area)
            })

    # Ordenar por área para que las regiones grandes
    # se dibujen primero y las pequeñas encima
    regions.sort(
        key=lambda x: x["area"],
        reverse=True
    )

    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(
            regions,
            f,
            ensure_ascii=False
        )

    print()
    print(f"JSON generado: {output_json}")
    print(f"Regiones exportadas: {len(regions)}")


if __name__ == "__main__":

    image_to_turtle_json(
        image_path="lirio.png",
        output_json="lirio.json",

        # 12-20 suele dar buenos resultados
        max_colors=16,

        # elimina regiones pequeñas
        min_area=40,

        # elimina colores oscuros
        min_brightness=90
    )