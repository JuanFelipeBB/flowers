import turtle
import json

def draw_from_json(json_file):
    screen = turtle.Screen()
    screen.bgcolor("black")
    screen.setup(800,800)
    t = turtle.Turtle()
    t.speed(0)
    screen.tracer(0)

    with open(json_file) as f:
        regions = json.load(f)

    all_points = [(p[0], p[1]) for r in regions
                    for p in r['contour']]
    min_x = min(p[0] for p in all_points)
    max_x = max(p[0] for p in all_points)
    min_y = min(p[1] for p in all_points)
    max_y = max(p[1] for p in all_points)

    width = max_x - min_x
    height = max_y - min_y
    scale = min(600 / width, 600 / height)
    center_x = (min_x + max_x) / 2 
    center_y = (min_y + max_y) / 2

    for region in regions:
        color = '#{:02x}{:02x}{:02x}'.format(
            int(region['color'][0]),
            int(region['color'][1]),
            int(region['color'][2])
        )
        t.color(color, color)

        points = region['contour']
        t.begin_fill()
        t.penup()

        x = (points[0][0] - center_x) * scale
        y = (center_y - points[0][1]) * scale
        t.goto(x, y)
        t.pendown()

        for point in points[1:]:
            x = (point[0] - center_x) * scale
            y = (center_y - point[1]) * scale
            t.goto(x, y)

        t.goto((points[0][0] - center_x) * scale,
                (center_y - points[0][1]) * scale)
        t.end_fill()
        screen.update()

    screen.mainloop()

if __name__ == "__main__":
    draw_from_json("rosas.json")