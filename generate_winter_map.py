#!/usr/bin/env python3
"""
Winter Map Generator for PhiloAgents Game
Generates a large 160x160 winter-themed tilemap JSON file
"""

import json
import random
from typing import List

# Map dimensions
WIDTH = 160
HEIGHT = 160
TILE_SIZE = 32

# Tile IDs from tilesets
# Tuxmon tileset (1-720): 24 columns
SNOW_GROUND = 126  # Snow/ice ground tile
SNOW_PATH = 150    # Lighter snow for paths
ICE_TILE = 174     # Ice/frozen water
WALL_TILE = 169    # Wall/collision tile
BUILDING_TILE = 193  # Building tile

# Plant tileset (1121-1289): 13 columns
EVERGREEN_TREE = 1121  # Evergreen tree (good for winter)
TREE_VARIANT_1 = 1122
TREE_VARIANT_2 = 1135

# Ancient Greece tileset (721-1120): 20 columns
GREECE_BUILDING = 721  # Building with possible snow
COLUMN = 740

def create_empty_layer(width: int, height: int, fill_value: int = 0) -> List[int]:
    """Create an empty layer filled with a specific tile ID"""
    return [fill_value] * (width * height)

def set_tile(layer: List[int], x: int, y: int, width: int, tile_id: int):
    """Set a tile at specific coordinates"""
    if 0 <= x < width and 0 <= y < HEIGHT:
        layer[y * width + x] = tile_id

def get_tile(layer: List[int], x: int, y: int, width: int) -> int:
    """Get tile at specific coordinates"""
    if 0 <= x < width and 0 <= y < HEIGHT:
        return layer[y * width + x]
    return 0

def fill_rect(layer: List[int], x: int, y: int, w: int, h: int, width: int, tile_id: int):
    """Fill a rectangular area with a tile"""
    for dy in range(h):
        for dx in range(w):
            set_tile(layer, x + dx, y + dy, width, tile_id)

def create_path(layer: List[int], x1: int, y1: int, x2: int, y2: int, width: int, path_tile: int, path_width: int = 3):
    """Create a winding path between two points"""
    x, y = x1, y1

    while x != x2 or y != y2:
        # Draw path at current position
        for offset in range(-path_width // 2, path_width // 2 + 1):
            set_tile(layer, x + offset, y, width, path_tile)
            set_tile(layer, x, y + offset, width, path_tile)

        # Move towards destination
        if x < x2:
            x += 1
        elif x > x2:
            x -= 1

        if y < y2:
            y += 1
        elif y > y2:
            y -= 1

def place_trees_randomly(layer: List[int], width: int, height: int, count: int, tree_tiles: List[int]):
    """Place trees randomly across the map, avoiding paths"""
    placed = 0
    attempts = 0
    max_attempts = count * 10

    while placed < count and attempts < max_attempts:
        x = random.randint(5, width - 5)
        y = random.randint(5, height - 5)

        # Check if area is empty (snow ground)
        if get_tile(layer, x, y, width) == SNOW_GROUND:
            tree_tile = random.choice(tree_tiles)
            set_tile(layer, x, y, width, tree_tile)
            placed += 1

        attempts += 1

def create_building(world_layer: List[int], above_layer: List[int], x: int, y: int, w: int, h: int, width: int):
    """Create a simple building with collision"""
    # Walls (collision)
    for i in range(w):
        set_tile(world_layer, x + i, y, width, WALL_TILE)  # Top wall
        set_tile(world_layer, x + i, y + h - 1, width, WALL_TILE)  # Bottom wall

    for i in range(h):
        set_tile(world_layer, x, y + i, width, WALL_TILE)  # Left wall
        set_tile(world_layer, x + w - 1, y + i, width, WALL_TILE)  # Right wall

    # Fill interior
    for dy in range(1, h - 1):
        for dx in range(1, w - 1):
            set_tile(world_layer, x + dx, y + dy, width, BUILDING_TILE)

    # Roof in above layer (for depth)
    for dy in range(-2, h):
        for dx in range(w):
            if dy < 0:  # Roof overhang
                set_tile(above_layer, x + dx, y + dy, width, GREECE_BUILDING)

def create_frozen_lake(layer: List[int], cx: int, cy: int, radius: int, width: int):
    """Create a circular frozen lake"""
    for y in range(cy - radius, cy + radius):
        for x in range(cx - radius, cx + radius):
            dx = x - cx
            dy = y - cy
            if dx * dx + dy * dy <= radius * radius:
                set_tile(layer, x, y, width, ICE_TILE)

def generate_winter_map():
    """Generate the complete winter map"""
    print("🎄 Generating 160x160 Winter Map...")

    # Create layers
    print("Creating base layers...")
    below_layer = create_empty_layer(WIDTH, HEIGHT, SNOW_GROUND)
    world_layer = create_empty_layer(WIDTH, HEIGHT, 0)
    above_layer = create_empty_layer(WIDTH, HEIGHT, 0)

    # Create main paths
    print("Creating snowy paths...")
    # Horizontal path across middle
    fill_rect(below_layer, 0, HEIGHT // 2 - 2, WIDTH, 4, WIDTH, SNOW_PATH)

    # Vertical path across middle
    fill_rect(below_layer, WIDTH // 2 - 2, 0, 4, HEIGHT, WIDTH, SNOW_PATH)

    # Diagonal paths
    create_path(below_layer, 20, 20, WIDTH - 20, HEIGHT - 20, WIDTH, SNOW_PATH)
    create_path(below_layer, WIDTH - 20, 20, 20, HEIGHT - 20, WIDTH, SNOW_PATH)

    # Create central town square
    print("Building winter town square...")
    center_x, center_y = WIDTH // 2, HEIGHT // 2
    fill_rect(below_layer, center_x - 15, center_y - 15, 30, 30, WIDTH, SNOW_PATH)

    # Add buildings around town square
    buildings = [
        (center_x - 25, center_y - 25, 8, 8),
        (center_x + 17, center_y - 25, 8, 8),
        (center_x - 25, center_y + 17, 8, 8),
        (center_x + 17, center_y + 17, 8, 8),
        (center_x - 10, center_y - 30, 20, 10),  # Large building north
        (center_x - 10, center_y + 20, 20, 10),  # Large building south
    ]

    for bx, by, bw, bh in buildings:
        create_building(world_layer, above_layer, bx, by, bw, bh, WIDTH)

    # Create frozen lakes
    print("Creating frozen lakes...")
    lakes = [
        (40, 40, 15),
        (WIDTH - 40, 40, 12),
        (40, HEIGHT - 40, 10),
        (WIDTH - 40, HEIGHT - 40, 14),
    ]

    for lx, ly, radius in lakes:
        create_frozen_lake(below_layer, lx, ly, radius, WIDTH)

    # Place evergreen trees
    print("Planting evergreen forest...")
    tree_tiles = [EVERGREEN_TREE, TREE_VARIANT_1, TREE_VARIANT_2]

    # Dense forest in corners
    for _ in range(200):
        x = random.randint(5, 35)
        y = random.randint(5, 35)
        if get_tile(below_layer, x, y, WIDTH) == SNOW_GROUND:
            set_tile(above_layer, x, y, WIDTH, random.choice(tree_tiles))

    # Trees throughout map
    place_trees_randomly(above_layer, WIDTH, HEIGHT, 800, tree_tiles)

    # Create spawn points
    print("Adding character spawn points...")
    spawn_points = [
        {"name": "Spawn Point", "x": center_x * TILE_SIZE, "y": center_y * TILE_SIZE},
        {"name": "Socrates", "x": (center_x - 10) * TILE_SIZE, "y": (center_y - 10) * TILE_SIZE},
        {"name": "Plato", "x": (center_x + 10) * TILE_SIZE, "y": (center_y - 10) * TILE_SIZE},
        {"name": "Aristotle", "x": (center_x - 10) * TILE_SIZE, "y": (center_y + 10) * TILE_SIZE},
        {"name": "Descartes", "x": (center_x + 10) * TILE_SIZE, "y": (center_y + 10) * TILE_SIZE},
        {"name": "Leibniz", "x": 50 * TILE_SIZE, "y": 50 * TILE_SIZE},
        {"name": "Ada Lovelace", "x": (WIDTH - 50) * TILE_SIZE, "y": 50 * TILE_SIZE},
        {"name": "Turing", "x": 50 * TILE_SIZE, "y": (HEIGHT - 50) * TILE_SIZE},
        {"name": "Chomsky", "x": (WIDTH - 50) * TILE_SIZE, "y": (HEIGHT - 50) * TILE_SIZE},
        {"name": "Searle", "x": (center_x - 20) * TILE_SIZE, "y": center_y * TILE_SIZE},
        {"name": "Dennett", "x": (center_x + 20) * TILE_SIZE, "y": center_y * TILE_SIZE},
        {"name": "Miguel", "x": center_x * TILE_SIZE, "y": (center_y - 20) * TILE_SIZE},
        {"name": "Paul", "x": center_x * TILE_SIZE, "y": (center_y + 20) * TILE_SIZE},
        {"name": "Zombie", "x": (center_x + 15) * TILE_SIZE, "y": (center_y + 15) * TILE_SIZE},
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

    # Build final JSON structure
    print("Assembling final map structure...")
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
                    {"id": 168, "properties": [{"name": "collides", "type": "bool", "value": True}]},
                    {"id": 169, "properties": [{"name": "collides", "type": "bool", "value": True}]},
                    {"id": 192, "properties": [{"name": "collides", "type": "bool", "value": True}]},
                    {"id": 193, "properties": [{"name": "collides", "type": "bool", "value": True}]},
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

    # Save to file
    output_path = "philoagents-ui/public/assets/tilemaps/philoagents-winter.json"
    print(f"💾 Saving to {output_path}...")

    with open(output_path, 'w') as f:
        json.dump(tilemap, f, separators=(',', ':'))

    file_size = len(json.dumps(tilemap)) / 1024 / 1024
    print(f"✅ Winter map generated successfully!")
    print(f"📊 Map size: {WIDTH}x{HEIGHT} ({WIDTH * HEIGHT * 4:,} total tiles)")
    print(f"📄 File size: {file_size:.2f} MB")
    print(f"🎄 Features:")
    print(f"   - Central town square with buildings")
    print(f"   - {len(lakes)} frozen lakes")
    print(f"   - ~1000 evergreen trees")
    print(f"   - Snowy paths connecting all areas")
    print(f"   - {len(spawn_points)} character spawn points")

if __name__ == "__main__":
    generate_winter_map()
