#!/usr/bin/env python3
"""
Winter Map Generator V2 - With Proper Tile Patterns
Generates a beautiful 160x160 winter-themed tilemap using correct tile borders
"""

import json
import random
from typing import List, Tuple

# Map dimensions
WIDTH = 160
HEIGHT = 160
TILE_SIZE = 32

# Tuxmon tileset tiles (analyzed from original map)
GROUND = 126  # Base snow ground

# Path/area bordered tiles (these create nice rectangles with borders)
PATH_TOP_LEFT = 149
PATH_TOP = 150
PATH_TOP_RIGHT = 151

PATH_LEFT = 173
PATH_CENTER = 174
PATH_RIGHT = 175

PATH_BOTTOM_LEFT = 197
PATH_BOTTOM = 198
PATH_BOTTOM_RIGHT = 199

# Building/structure tiles
BUILDING_TOP_LEFT = 217
BUILDING_TOP = 218
BUILDING_TOP_RIGHT = 219

BUILDING_LEFT = 241
BUILDING_CENTER = 0  # Interior
BUILDING_RIGHT = 243

BUILDING_BOTTOM_LEFT = 265
BUILDING_BOTTOM = 266
BUILDING_BOTTOM_RIGHT = 267

# Wall tiles (for collision)
WALL_TILE = 193

# Plant tileset
EVERGREEN_BASE = 1121  # Bottom of tree
EVERGREEN_TOP = 1108   # Top of tree (row above)

def create_empty_layer(width: int, height: int, fill_value: int = 0) -> List[int]:
    """Create an empty layer"""
    return [fill_value] * (width * height)

def set_tile(layer: List[int], x: int, y: int, width: int, tile_id: int):
    """Set a tile at coordinates"""
    if 0 <= x < width and 0 <= y < HEIGHT:
        layer[y * width + x] = tile_id

def get_tile(layer: List[int], x: int, y: int, width: int) -> int:
    """Get tile at coordinates"""
    if 0 <= x < width and 0 <= y < HEIGHT:
        return layer[y * width + x]
    return 0

def fill_bordered_rect(layer: List[int], x: int, y: int, w: int, h: int, width: int):
    """Fill a rectangle with proper borders (like paths in original map)"""
    # Top border
    set_tile(layer, x, y, width, PATH_TOP_LEFT)
    for i in range(1, w - 1):
        set_tile(layer, x + i, y, width, PATH_TOP)
    set_tile(layer, x + w - 1, y, width, PATH_TOP_RIGHT)

    # Middle rows
    for j in range(1, h - 1):
        set_tile(layer, x, y + j, width, PATH_LEFT)
        for i in range(1, w - 1):
            set_tile(layer, x + i, y + j, width, PATH_CENTER)
        set_tile(layer, x + w - 1, y + j, width, PATH_RIGHT)

    # Bottom border
    set_tile(layer, x, y + h - 1, width, PATH_BOTTOM_LEFT)
    for i in range(1, w - 1):
        set_tile(layer, x + i, y + h - 1, width, PATH_BOTTOM)
    set_tile(layer, x + w - 1, y + h - 1, width, PATH_BOTTOM_RIGHT)

def create_building_bordered(world_layer: List[int], x: int, y: int, w: int, h: int, width: int):
    """Create a building with proper borders and collision"""
    # Top border
    set_tile(world_layer, x, y, width, BUILDING_TOP_LEFT)
    for i in range(1, w - 1):
        set_tile(world_layer, x + i, y, width, BUILDING_TOP)
    set_tile(world_layer, x + w - 1, y, width, BUILDING_TOP_RIGHT)

    # Middle rows
    for j in range(1, h - 1):
        set_tile(world_layer, x, y + j, width, BUILDING_LEFT)
        for i in range(1, w - 1):
            set_tile(world_layer, x + i, y + j, width, WALL_TILE)  # Collision interior
        set_tile(world_layer, x + w - 1, y + j, width, BUILDING_RIGHT)

    # Bottom border
    set_tile(world_layer, x, y + h - 1, width, BUILDING_BOTTOM_LEFT)
    for i in range(1, w - 1):
        set_tile(world_layer, x + i, y + h - 1, width, BUILDING_BOTTOM)
    set_tile(world_layer, x + w - 1, y + h - 1, width, BUILDING_BOTTOM_RIGHT)

def place_evergreen_tree(above_layer: List[int], x: int, y: int, width: int):
    """Place a properly formed evergreen tree (2 tiles tall)"""
    if y > 0:  # Make sure there's room for top
        set_tile(above_layer, x, y - 1, width, EVERGREEN_TOP)  # Top part
        set_tile(above_layer, x, y, width, EVERGREEN_BASE)      # Bottom part

def generate_winter_map_v2():
    """Generate beautiful winter map with proper tile patterns"""
    print("❄️  Generating Winter Map V2 with proper tile patterns...")

    # Create layers filled with ground
    below_layer = create_empty_layer(WIDTH, HEIGHT, GROUND)
    world_layer = create_empty_layer(WIDTH, HEIGHT, 0)
    above_layer = create_empty_layer(WIDTH, HEIGHT, 0)

    center_x, center_y = WIDTH // 2, HEIGHT // 2

    # Create central town square (large bordered area)
    print("Creating town square...")
    square_size = 40
    fill_bordered_rect(below_layer, center_x - square_size//2, center_y - square_size//2,
                      square_size, square_size, WIDTH)

    # Create paths connecting to edges
    print("Creating main paths...")
    # Horizontal path
    fill_bordered_rect(below_layer, 10, center_y - 3, WIDTH - 20, 6, WIDTH)

    # Vertical path
    fill_bordered_rect(below_layer, center_x - 3, 10, 6, HEIGHT - 20, WIDTH)

    # Create buildings around town square
    print("Building structures...")
    buildings = [
        (center_x - 30, center_y - 30, 12, 10),
        (center_x + 18, center_y - 30, 12, 10),
        (center_x - 30, center_y + 20, 12, 10),
        (center_x + 18, center_y + 20, 12, 10),
    ]

    for bx, by, bw, bh in buildings:
        create_building_bordered(world_layer, bx, by, bw, bh, WIDTH)

    # Create smaller plazas in corners
    print("Creating corner plazas...")
    plazas = [
        (30, 30, 20, 20),
        (WIDTH - 50, 30, 20, 20),
        (30, HEIGHT - 50, 20, 20),
        (WIDTH - 50, HEIGHT - 50, 20, 20),
    ]

    for px, py, pw, ph in plazas:
        fill_bordered_rect(below_layer, px, py, pw, ph, WIDTH)

    # Place evergreen trees in a nice pattern (not random chaos)
    print("Planting evergreen forest...")

    # Forest areas (avoid paths and buildings)
    forest_areas = [
        (10, 10, 15, 15),
        (WIDTH - 25, 10, 15, 15),
        (10, HEIGHT - 25, 15, 15),
        (WIDTH - 25, HEIGHT - 25, 15, 15),
    ]

    for fx, fy, fw, fh in forest_areas:
        # Plant trees in a semi-regular pattern with some randomness
        for ty in range(fy + 2, fy + fh - 2, 3):
            for tx in range(fx + 2, fx + fw - 2, 3):
                # Add some randomness to avoid perfect grid
                if random.random() > 0.3:
                    offset_x = random.randint(-1, 1)
                    offset_y = random.randint(-1, 1)
                    place_evergreen_tree(above_layer, tx + offset_x, ty + offset_y, WIDTH)

    # Scattered trees throughout map (avoiding paths)
    print("Adding scattered trees...")
    for _ in range(300):
        x = random.randint(5, WIDTH - 5)
        y = random.randint(5, HEIGHT - 5)

        # Only place if on ground (not on paths)
        if get_tile(below_layer, x, y, WIDTH) == GROUND:
            # Check if not too close to other trees
            has_nearby_tree = False
            for dy in range(-2, 3):
                for dx in range(-2, 3):
                    if get_tile(above_layer, x + dx, y + dy, WIDTH) != 0:
                        has_nearby_tree = True
                        break
                if has_nearby_tree:
                    break

            if not has_nearby_tree:
                place_evergreen_tree(above_layer, x, y, WIDTH)

    # Create spawn points
    print("Adding spawn points...")
    spawn_points = [
        {"name": "Spawn Point", "x": center_x * TILE_SIZE, "y": center_y * TILE_SIZE},
        {"name": "Socrates", "x": (center_x - 8) * TILE_SIZE, "y": (center_y - 8) * TILE_SIZE},
        {"name": "Plato", "x": (center_x + 8) * TILE_SIZE, "y": (center_y - 8) * TILE_SIZE},
        {"name": "Aristotle", "x": (center_x - 8) * TILE_SIZE, "y": (center_y + 8) * TILE_SIZE},
        {"name": "Descartes", "x": (center_x + 8) * TILE_SIZE, "y": (center_y + 8) * TILE_SIZE},
        {"name": "Leibniz", "x": 40 * TILE_SIZE, "y": 40 * TILE_SIZE},
        {"name": "Ada Lovelace", "x": (WIDTH - 40) * TILE_SIZE, "y": 40 * TILE_SIZE},
        {"name": "Turing", "x": 40 * TILE_SIZE, "y": (HEIGHT - 40) * TILE_SIZE},
        {"name": "Chomsky", "x": (WIDTH - 40) * TILE_SIZE, "y": (HEIGHT - 40) * TILE_SIZE},
        {"name": "Searle", "x": (center_x - 15) * TILE_SIZE, "y": center_y * TILE_SIZE},
        {"name": "Dennett", "x": (center_x + 15) * TILE_SIZE, "y": center_y * TILE_SIZE},
        {"name": "Miguel", "x": center_x * TILE_SIZE, "y": (center_y - 15) * TILE_SIZE},
        {"name": "Paul", "x": center_x * TILE_SIZE, "y": (center_y + 15) * TILE_SIZE},
        {"name": "Zombie", "x": (center_x + 12) * TILE_SIZE, "y": (center_y + 12) * TILE_SIZE},
    ]

    objects_layer = []
    for i, sp in enumerate(spawn_points):
        objects_layer.append({
            "height": 0,
            "id": 275 + i,
            "name": sp["name"],
            "point": True,
            "rotation": 0,
            "type": "",
            "visible": True,
            "width": 0,
            "x": sp["x"],
            "y": sp["y"]
        })

    # Build JSON
    print("Assembling map...")
    tilemap = {
        "compressionlevel": -1,
        "height": HEIGHT,
        "infinite": False,
        "layers": [
            {
                "data": below_layer,
                "height": HEIGHT,
                "id": 1,
                "name": "Below Player",
                "opacity": 1,
                "type": "tilelayer",
                "visible": True,
                "width": WIDTH,
                "x": 0,
                "y": 0
            },
            {
                "data": world_layer,
                "height": HEIGHT,
                "id": 2,
                "name": "World",
                "opacity": 1,
                "type": "tilelayer",
                "visible": True,
                "width": WIDTH,
                "x": 0,
                "y": 0
            },
            {
                "data": above_layer,
                "height": HEIGHT,
                "id": 3,
                "name": "Above Player",
                "opacity": 1,
                "type": "tilelayer",
                "visible": True,
                "width": WIDTH,
                "x": 0,
                "y": 0
            },
            {
                "draworder": "topdown",
                "id": 4,
                "name": "Objects",
                "objects": objects_layer,
                "opacity": 1,
                "type": "objectgroup",
                "visible": True,
                "x": 0,
                "y": 0
            }
        ],
        "nextlayerid": 5,
        "nextobjectid": 290,
        "orientation": "orthogonal",
        "renderorder": "right-down",
        "tiledversion": "1.10.2",
        "tileheight": TILE_SIZE,
        "tilewidth": TILE_SIZE,
        "tilesets": [
            {
                "columns": 24,
                "firstgid": 1,
                "image": "../tilesets/tuxmon-sample-32px-extruded.png",
                "imageheight": 1020,
                "imagewidth": 816,
                "margin": 1,
                "name": "tuxmon-sample-32px-extruded",
                "spacing": 2,
                "tilecount": 720,
                "tileheight": 32,
                "tilewidth": 32,
                "tiles": [
                    {"id": 192, "properties": [{"name": "collides", "type": "bool", "value": True}]},
                    {"id": 193, "properties": [{"name": "collides", "type": "bool", "value": True}]},
                    {"id": 216, "properties": [{"name": "collides", "type": "bool", "value": True}]},
                    {"id": 217, "properties": [{"name": "collides", "type": "bool", "value": True}]},
                ]
            },
            {
                "columns": 20,
                "firstgid": 721,
                "image": "../tilesets/ancient_greece_tileset.png",
                "imageheight": 640,
                "imagewidth": 640,
                "margin": 0,
                "name": "ancient_greece_tileset",
                "spacing": 0,
                "tilecount": 400,
                "tileheight": 32,
                "tilewidth": 32
            },
            {
                "columns": 13,
                "firstgid": 1121,
                "image": "../tilesets/plant.png",
                "imageheight": 416,
                "imagewidth": 416,
                "margin": 0,
                "name": "plant",
                "spacing": 0,
                "tilecount": 169,
                "tileheight": 32,
                "tilewidth": 32
            }
        ],
        "type": "map",
        "version": "1.10",
        "width": WIDTH
    }

    output_path = "philoagents-ui/public/assets/tilemaps/philoagents-winter.json"
    print(f"💾 Saving to {output_path}...")

    with open(output_path, 'w') as f:
        json.dump(tilemap, f, separators=(',', ':'))

    print(f"✅ Beautiful winter map generated!")
    print(f"🎄 Features:")
    print(f"   - Central town square with proper borders")
    print(f"   - Clean bordered paths")
    print(f"   - 4 buildings with collision")
    print(f"   - Corner plazas")
    print(f"   - Natural-looking evergreen forests")
    print(f"   - 14 character spawn points")

if __name__ == "__main__":
    generate_winter_map_v2()
