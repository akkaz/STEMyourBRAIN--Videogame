#!/usr/bin/env python3
"""
Winter Map Generator V3 - Simple & Clean
Uses only verified tiles from the tuxmon tileset
"""

import json
import random

WIDTH = 160
HEIGHT = 160
TILE_SIZE = 32

# Verified tuxmon tiles from original map analysis
GROUND = 126          # Snow ground

# Path bordered rectangle tiles
PATH_TL = 149
PATH_T = 150
PATH_TR = 151
PATH_L = 173
PATH_C = 174
PATH_R = 175
PATH_BL = 197
PATH_B = 198
PATH_BR = 199

# Wall/collision tiles (for buildings)
WALL_1 = 169
WALL_2 = 170
WALL_3 = 193
WALL_4 = 194

# Plant tileset - VERIFIED
# Column 0 in plant tileset starts at 1121
# We need to count: column * 13 + row
# Evergreen tree is in column 0, rows 0-1
TREE_TOP = 1121      # First tile of plant tileset
TREE_BOTTOM = 1121 + 13  # Next row (13 tiles per row)

def create_layer(fill=0):
    return [fill] * (WIDTH * HEIGHT)

def set_tile(layer, x, y, tile):
    if 0 <= x < WIDTH and 0 <= y < HEIGHT:
        layer[y * WIDTH + x] = tile

def get_tile(layer, x, y):
    if 0 <= x < WIDTH and 0 <= y < HEIGHT:
        return layer[y * WIDTH + x]
    return 0

def bordered_rect(layer, x, y, w, h):
    """Create properly bordered rectangle"""
    if w < 3 or h < 3:
        return

    # Top row
    set_tile(layer, x, y, PATH_TL)
    for i in range(1, w-1):
        set_tile(layer, x+i, y, PATH_T)
    set_tile(layer, x+w-1, y, PATH_TR)

    # Middle rows
    for j in range(1, h-1):
        set_tile(layer, x, y+j, PATH_L)
        for i in range(1, w-1):
            set_tile(layer, x+i, y+j, PATH_C)
        set_tile(layer, x+w-1, y+j, PATH_R)

    # Bottom row
    set_tile(layer, x, y+h-1, PATH_BL)
    for i in range(1, w-1):
        set_tile(layer, x+i, y+h-1, PATH_B)
    set_tile(layer, x+w-1, y+h-1, PATH_BR)

def simple_building(world_layer, x, y, w, h):
    """Create simple building with walls"""
    if w < 3 or h < 3:
        return

    # Fill with alternating wall tiles
    for j in range(h):
        for i in range(w):
            # Checkerboard pattern of walls
            if (i + j) % 2 == 0:
                set_tile(world_layer, x+i, y+j, WALL_3)
            else:
                set_tile(world_layer, x+i, y+j, WALL_4)

    # Border with different walls
    for i in range(w):
        set_tile(world_layer, x+i, y, WALL_1)
        set_tile(world_layer, x+i, y+h-1, WALL_1)
    for j in range(h):
        set_tile(world_layer, x, y+j, WALL_2)
        set_tile(world_layer, x+w-1, y+j, WALL_2)

def place_tree(above_layer, x, y):
    """Place a 2-tile evergreen tree"""
    if y > 0:
        set_tile(above_layer, x, y-1, TREE_TOP)
        set_tile(above_layer, x, y, TREE_BOTTOM)

print("❄️ Generating Simple Winter Map...")

below = create_layer(GROUND)
world = create_layer(0)
above = create_layer(0)

cx, cy = WIDTH//2, HEIGHT//2

# Central town square
print("Creating town square...")
bordered_rect(below, cx-25, cy-25, 50, 50)

# Main cross paths
print("Creating paths...")
# Horizontal
bordered_rect(below, 10, cy-4, WIDTH-20, 8)
# Vertical
bordered_rect(below, cx-4, 10, 8, HEIGHT-20)

# Corner plazas
for px, py in [(25, 25), (WIDTH-45, 25), (25, HEIGHT-45), (WIDTH-45, 25)]:
    bordered_rect(below, px, py, 20, 20)

# Buildings
print("Creating buildings...")
buildings = [
    (cx-35, cy-35, 15, 12),
    (cx+20, cy-35, 15, 12),
    (cx-35, cy+23, 15, 12),
    (cx+20, cy+23, 15, 12),
]
for bx, by, bw, bh in buildings:
    simple_building(world, bx, by, bw, bh)

# Trees in corners
print("Planting trees...")
forest_areas = [
    (10, 10, 12, 12),
    (WIDTH-22, 10, 12, 12),
    (10, HEIGHT-22, 12, 12),
    (WIDTH-22, HEIGHT-22, 12, 12),
]

for fx, fy, fw, fh in forest_areas:
    for ty in range(fy+2, fy+fh-1, 2):
        for tx in range(fx+2, fx+fw-1, 2):
            if random.random() > 0.2:
                place_tree(above, tx, ty)

# Scattered trees
for _ in range(250):
    x = random.randint(10, WIDTH-10)
    y = random.randint(10, HEIGHT-10)
    if get_tile(below, x, y) == GROUND and get_tile(above, x, y) == 0:
        # Check spacing
        ok = True
        for dy in range(-3, 4):
            for dx in range(-3, 4):
                if get_tile(above, x+dx, y+dy) != 0:
                    ok = False
        if ok:
            place_tree(above, x, y)

# Spawn points
spawns = [
    {"name": "Spawn Point", "x": cx*32, "y": cy*32},
    {"name": "Socrates", "x": (cx-10)*32, "y": (cy-10)*32},
    {"name": "Plato", "x": (cx+10)*32, "y": (cy-10)*32},
    {"name": "Aristotle", "x": (cx-10)*32, "y": (cy+10)*32},
    {"name": "Descartes", "x": (cx+10)*32, "y": (cy+10)*32},
    {"name": "Leibniz", "x": 35*32, "y": 35*32},
    {"name": "Ada Lovelace", "x": (WIDTH-35)*32, "y": 35*32},
    {"name": "Turing", "x": 35*32, "y": (HEIGHT-35)*32},
    {"name": "Chomsky", "x": (WIDTH-35)*32, "y": (HEIGHT-35)*32},
    {"name": "Searle", "x": (cx-18)*32, "y": cy*32},
    {"name": "Dennett", "x": (cx+18)*32, "y": cy*32},
    {"name": "Miguel", "x": cx*32, "y": (cy-18)*32},
    {"name": "Paul", "x": cx*32, "y": (cy+18)*32},
    {"name": "Zombie", "x": (cx+14)*32, "y": (cy+14)*32},
]

objects = []
for i, sp in enumerate(spawns):
    objects.append({
        "height": 0, "id": 275+i, "name": sp["name"], "point": True,
        "rotation": 0, "type": "", "visible": True, "width": 0,
        "x": sp["x"], "y": sp["y"]
    })

# Build map
tilemap = {
    "compressionlevel": -1, "height": HEIGHT, "infinite": False,
    "layers": [
        {"data": below, "height": HEIGHT, "id": 1, "name": "Below Player",
         "opacity": 1, "type": "tilelayer", "visible": True, "width": WIDTH, "x": 0, "y": 0},
        {"data": world, "height": HEIGHT, "id": 2, "name": "World",
         "opacity": 1, "type": "tilelayer", "visible": True, "width": WIDTH, "x": 0, "y": 0},
        {"data": above, "height": HEIGHT, "id": 3, "name": "Above Player",
         "opacity": 1, "type": "tilelayer", "visible": True, "width": WIDTH, "x": 0, "y": 0},
        {"draworder": "topdown", "id": 4, "name": "Objects", "objects": objects,
         "opacity": 1, "type": "objectgroup", "visible": True, "x": 0, "y": 0}
    ],
    "nextlayerid": 5, "nextobjectid": 290,
    "orientation": "orthogonal", "renderorder": "right-down",
    "tiledversion": "1.10.2", "tileheight": 32, "tilewidth": 32,
    "tilesets": [
        {"columns": 24, "firstgid": 1, "image": "../tilesets/tuxmon-sample-32px-extruded.png",
         "imageheight": 1020, "imagewidth": 816, "margin": 1,
         "name": "tuxmon-sample-32px-extruded", "spacing": 2, "tilecount": 720,
         "tileheight": 32, "tilewidth": 32,
         "tiles": [
             {"id": 168, "properties": [{"name": "collides", "type": "bool", "value": True}]},
             {"id": 169, "properties": [{"name": "collides", "type": "bool", "value": True}]},
             {"id": 192, "properties": [{"name": "collides", "type": "bool", "value": True}]},
             {"id": 193, "properties": [{"name": "collides", "type": "bool", "value": True}]},
         ]},
        {"columns": 20, "firstgid": 721, "image": "../tilesets/ancient_greece_tileset.png",
         "imageheight": 640, "imagewidth": 640, "margin": 0,
         "name": "ancient_greece_tileset", "spacing": 0, "tilecount": 400,
         "tileheight": 32, "tilewidth": 32},
        {"columns": 13, "firstgid": 1121, "image": "../tilesets/plant.png",
         "imageheight": 416, "imagewidth": 416, "margin": 0,
         "name": "plant", "spacing": 0, "tilecount": 169,
         "tileheight": 32, "tilewidth": 32}
    ],
    "type": "map", "version": "1.10", "width": WIDTH
}

output = "philoagents-ui/public/assets/tilemaps/philoagents-winter.json"
print(f"💾 Saving to {output}...")
with open(output, 'w') as f:
    json.dump(tilemap, f, separators=(',', ':'))

print("✅ Clean winter map generated!")
print(f"   - Proper bordered paths and plazas")
print(f"   - 4 solid buildings with collision")
print(f"   - Evergreen trees (2-tile sprites)")
print(f"   - All 14 spawn points")
