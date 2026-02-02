import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    preload ()
    {
        this.load.setPath('assets');

        // General assets
        this.load.image('background', 'babilonia_cover.jpg');
        this.load.image('logo', 'logo.png');

        // Tilesets
        this.load.image("tuxmon-tiles", "tilesets/tuxmon-sample-32px-extruded.png");
        this.load.image("greece-tiles", "tilesets/ancient_greece_tileset.png");
        this.load.image("plant-tiles", "tilesets/plant.png");

        // Tilemap
        this.load.tilemapTiledJSON("map", "tilemaps/philoagents-town2.json");

        // Character assets - Player
        this.load.atlas("sophia", "characters/sophia/atlas.png", "characters/sophia/atlas.json");

        // BABILONIA Characters
        this.load.atlas("nicolo", "characters/nicolo/atlas.png", "characters/nicolo/atlas.json");     // Guide (Bobby)
        this.load.atlas("akane", "characters/akane/atlas.png", "characters/akane/atlas.json");       // Merchant
        this.load.atlas("hiroshi", "characters/hiroshi/atlas.png", "characters/hiroshi/atlas.json"); // Gardener
        this.load.atlas("ryo", "characters/ryo/atlas.png", "characters/ryo/atlas.json");             // Monk
        this.load.atlas("mei", "characters/mei/atlas.png", "characters/mei/atlas.json");             // Librarian
        this.load.atlas("kaito", "characters/kaito/atlas.png", "characters/kaito/atlas.json");       // Sailor

        // Easter Egg
        this.load.atlas("socrates", "characters/socrates/atlas.png", "characters/socrates/atlas.json"); 
    }

    create ()
    {
        this.scene.start('MainMenu');
    }
}
