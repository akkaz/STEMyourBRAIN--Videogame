import { Scene } from 'phaser';
import Character from '../classes/Character';
import DialogueBox from '../classes/DialogueBox';
import DialogueManager from '../classes/DialogueManager';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
        this.controls = null;
        this.player = null;
        this.cursors = null;
        this.dialogueBox = null;
        this.spaceKey = null;
        this.activePhilosopher = null;
        this.dialogueManager = null;
        this.philosophers = [];
        this.labelsVisible = true;
        this.tutorialActive = true;
        this.victoryActive = false;
        this.gameWon = false;
    }

    create ()
    {
        const map = this.createTilemap();
        const tileset = this.addTileset(map);
        const layers = this.createLayers(map, tileset);
        let screenPadding = 20;
        let maxDialogueHeight = 200;

        this.createPhilosophers(map, layers);

        this.setupPlayer(map, layers.worldLayer);
        const camera = this.setupCamera(map);

        this.setupControls(camera);

        this.setupDialogueSystem();

        this.dialogueBox = new DialogueBox(this);
        this.dialogueText = this.add
            .text(60, this.game.config.height - maxDialogueHeight - screenPadding + screenPadding, '', {
            font: "18px monospace",
            fill: "#ffffff",
            padding: { x: 20, y: 10 },
            wordWrap: { width: 680 },
            lineSpacing: 6,
            maxLines: 5
            })
            .setScrollFactor(0)
            .setDepth(30)
            .setVisible(false);

        this.spaceKey = this.input.keyboard.addKey('SPACE');
        
        // Initialize the dialogue manager
        this.dialogueManager = new DialogueManager(this);
        this.dialogueManager.initialize(this.dialogueBox);

        // Show tutorial overlay
        this.showTutorial();
    }

    createPhilosophers(map, layers) {
        const philosopherConfigs = [
            // === BABILONIA: IL SEGRETO DI BOBBY ===

            // Nicolò (Bobby) - La Guida al Portale (con Tutorial) - Sta fermo vicino allo spawn
            {
                id: "nicolo",
                name: "Nicolò",
                spawnName: "Nicolo",
                defaultDirection: "front",
                roamRadius: 30,
                moveSpeed: 10
            },

            // Akane - La Mercante Tsundere (Mercato delle Ombre) - Lettera B
            {
                id: "akane",
                name: "Akane",
                spawnName: "Akane",
                defaultDirection: "front",
                roamRadius: 150
            },

            // Hiroshi - Il Giardiniere Superbo (Giardini Pensili) - Lettera O
            {
                id: "hiroshi",
                name: "Hiroshi",
                spawnName: "Hiroshi",
                defaultDirection: "front",
                roamRadius: 200
            },

            // Ryo - Il Monaco Eremita (Tempio Diroccato) - Lettera B
            {
                id: "ryo",
                name: "Ryo",
                spawnName: "Ryo",
                defaultDirection: "front",
                roamRadius: 80,
                moveSpeed: 20
            },

            // Mei - La Bibliotecaria Dolce (Biblioteca Infestata) - Lettera B
            {
                id: "mei",
                name: "Mei",
                spawnName: "Mei",
                defaultDirection: "front",
                roamRadius: 120
            },

            // Kaito - Il Vecchio Marinaio (Porto Dimenticato) - Lettera Y
            {
                id: "kaito",
                name: "Kaito",
                spawnName: "Kaito",
                defaultDirection: "front",
                roamRadius: 180
            },

            // === EASTER EGG ===
            {
                id: "socrates",
                name: "Gio Marco Baglioni",
                spawnName: "GioMarco",
                defaultDirection: "right",
                roamRadius: 300
            }
        ];

        this.philosophers = [];
        
        philosopherConfigs.forEach(config => {
            const spawnPoint = map.findObject("Objects", (obj) => obj.name === (config.spawnName || config.name));
            
            this[config.id] = new Character(this, {
                id: config.id,
                name: config.name,
                spawnPoint: spawnPoint,
                atlas: config.id,
                defaultDirection: config.defaultDirection,
                worldLayer: layers.worldLayer,
                defaultMessage: config.defaultMessage,
                roamRadius: config.roamRadius,
                moveSpeed: config.moveSpeed || 40,
                pauseChance: config.pauseChance || 0.2,
                directionChangeChance: config.directionChangeChance || 0.3,
                handleCollisions: true
            });
            
            this.philosophers.push(this[config.id]);
        });

        // Make all philosopher labels visible initially
        this.togglePhilosopherLabels(true);

        // Add collisions between philosophers
        for (let i = 0; i < this.philosophers.length; i++) {
            for (let j = i + 1; j < this.philosophers.length; j++) {
                this.physics.add.collider(
                    this.philosophers[i].sprite, 
                    this.philosophers[j].sprite
                );
            }
        }
    }

    checkPhilosopherInteraction() {
        let nearbyPhilosopher = null;

        for (const philosopher of this.philosophers) {
            if (philosopher.isPlayerNearby(this.player)) {
                nearbyPhilosopher = philosopher;
                break;
            }
        }
        
        if (nearbyPhilosopher) {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                if (!this.dialogueBox.isVisible()) {
                    this.dialogueManager.startDialogue(nearbyPhilosopher);
                } else if (!this.dialogueManager.isTyping) {
                    this.dialogueManager.continueDialogue();
                }
            }
            
            if (this.dialogueBox.isVisible()) {
                nearbyPhilosopher.facePlayer(this.player);
            }
        } else if (this.dialogueBox.isVisible()) {
            this.dialogueManager.closeDialogue();
        }
    }

    createTilemap() {
        return this.make.tilemap({ key: "map" });
    }

    addTileset(map) {
        const tuxmonTileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tuxmon-tiles");
        const greeceTileset = map.addTilesetImage("ancient_greece_tileset", "greece-tiles");
        const plantTileset = map.addTilesetImage("plant", "plant-tiles");

        return [tuxmonTileset, greeceTileset, plantTileset];
    }

    createLayers(map, tilesets) {
        const belowLayer = map.createLayer("Below Player", tilesets, 0, 0);
        const worldLayer = map.createLayer("World", tilesets, 0, 0);
        const aboveLayer = map.createLayer("Above Player", tilesets, 0, 0);
        worldLayer.setCollisionByProperty({ collides: true });
        aboveLayer.setDepth(10);
        return { belowLayer, worldLayer, aboveLayer };
    }

    setupPlayer(map, worldLayer) {
        const spawnPoint = map.findObject("Objects", (obj) => obj.name === "Spawn Point");
        this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "sophia", "sophia-front")
            .setSize(30, 40)
            .setOffset(0, 6);

        this.physics.add.collider(this.player, worldLayer);
        
        this.philosophers.forEach(philosopher => {
            this.physics.add.collider(this.player, philosopher.sprite);
        });

        this.createPlayerAnimations();

        // Set world bounds for physics
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBoundsCollision(true, true, true, true);
    }

    createPlayerAnimations() {
        const anims = this.anims;
        const animConfig = [
            { key: "sophia-left-walk", prefix: "sophia-left-walk-" },
            { key: "sophia-right-walk", prefix: "sophia-right-walk-" },
            { key: "sophia-front-walk", prefix: "sophia-front-walk-" },
            { key: "sophia-back-walk", prefix: "sophia-back-walk-" }
        ];
        
        animConfig.forEach(config => {
            anims.create({
                key: config.key,
                frames: anims.generateFrameNames("sophia", { prefix: config.prefix, start: 0, end: 8, zeroPad: 4 }),
                frameRate: 10,
                repeat: -1,
            });
        });
    }

    setupCamera(map) {
        const camera = this.cameras.main;
        camera.startFollow(this.player);
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        return camera;
    }

    setupControls(camera) {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
            camera: camera,
            left: this.cursors.left,
            right: this.cursors.right,
            up: this.cursors.up,
            down: this.cursors.down,
            speed: 0.5,
        });
        
        this.labelsVisible = true;
        
        // Add ESC key for pause menu
        this.input.keyboard.on('keydown-ESC', () => {
            if (!this.dialogueBox.isVisible()) {
                this.scene.pause();
                this.scene.launch('PauseMenu');
            }
        });
    }

    setupDialogueSystem() {
        const screenPadding = 20;
        const maxDialogueHeight = 200;
        
        this.dialogueBox = new DialogueBox(this);
        this.dialogueText = this.add
            .text(60, this.game.config.height - maxDialogueHeight - screenPadding + screenPadding, '', {
                font: "18px monospace",
                fill: "#ffffff",
                padding: { x: 20, y: 10 },
                wordWrap: { width: 680 },
                lineSpacing: 6,
                maxLines: 5
            })
            .setScrollFactor(0)
            .setDepth(30)
            .setVisible(false);

        this.spaceKey = this.input.keyboard.addKey('SPACE');
        
        this.dialogueManager = new DialogueManager(this);
        this.dialogueManager.initialize(this.dialogueBox);
    }

    update(time, delta) {
        const isInDialogue = this.dialogueBox.isVisible();

        if (!isInDialogue && !this.tutorialActive && !this.victoryActive) {
            this.updatePlayerMovement();
        }
        
        this.checkPhilosopherInteraction();
        
        this.philosophers.forEach(philosopher => {
            philosopher.update(this.player, isInDialogue);
        });
        
        if (this.controls) {
            this.controls.update(delta);
        }
    }

    updatePlayerMovement() {
        const speed = 175;
        const prevVelocity = this.player.body.velocity.clone();
        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(speed);
        }

        this.player.body.velocity.normalize().scale(speed);

        const currentVelocity = this.player.body.velocity.clone();
        const isMoving = Math.abs(currentVelocity.x) > 0 || Math.abs(currentVelocity.y) > 0;
        
        if (this.cursors.left.isDown && isMoving) {
            this.player.anims.play("sophia-left-walk", true);
        } else if (this.cursors.right.isDown && isMoving) {
            this.player.anims.play("sophia-right-walk", true);
        } else if (this.cursors.up.isDown && isMoving) {
            this.player.anims.play("sophia-back-walk", true);
        } else if (this.cursors.down.isDown && isMoving) {
            this.player.anims.play("sophia-front-walk", true);
        } else {
            this.player.anims.stop();
            if (prevVelocity.x < 0) this.player.setTexture("sophia", "sophia-left");
            else if (prevVelocity.x > 0) this.player.setTexture("sophia", "sophia-right");
            else if (prevVelocity.y < 0) this.player.setTexture("sophia", "sophia-back");
            else if (prevVelocity.y > 0) this.player.setTexture("sophia", "sophia-front");
            else {
                // If prevVelocity is zero, maintain current direction
                // Get current texture frame name
                const currentFrame = this.player.frame.name;
                
                // Extract direction from current animation or texture
                let direction = "front"; // Default
                
                // Check if the current frame name contains direction indicators
                if (currentFrame.includes("left")) direction = "left";
                else if (currentFrame.includes("right")) direction = "right";
                else if (currentFrame.includes("back")) direction = "back";
                else if (currentFrame.includes("front")) direction = "front";
                
                // Set the static texture for that direction
                this.player.setTexture("sophia", `sophia-${direction}`);
            }
        }
    }

    togglePhilosopherLabels(visible) {
        this.philosophers.forEach(philosopher => {
            if (philosopher.nameLabel) {
                philosopher.nameLabel.setVisible(visible);
            }
        });
    }

    showTutorial() {
        this.tutorialPage = 1;
        this.createTutorialBase();
        this.showTutorialPage1();
    }

    createTutorialBase() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Overlay scuro
        this.tutorialOverlay = this.add.graphics();
        this.tutorialOverlay.fillStyle(0x000000, 0.85);
        this.tutorialOverlay.fillRect(0, 0, width, height);
        this.tutorialOverlay.setScrollFactor(0).setDepth(100);

        // Pannello
        this.tutorialPanel = this.add.graphics();
        this.tutorialPanel.fillStyle(0x1a1a2e, 1);
        this.tutorialPanel.fillRoundedRect(centerX - 250, centerY - 200, 500, 400, 20);
        this.tutorialPanel.lineStyle(3, 0xeab308, 1);
        this.tutorialPanel.strokeRoundedRect(centerX - 250, centerY - 200, 500, 400, 20);
        this.tutorialPanel.setScrollFactor(0).setDepth(101);

        // Click handler
        this.tutorialOverlay.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, width, height),
            Phaser.Geom.Rectangle.Contains
        );
        this.tutorialOverlay.on('pointerdown', () => this.nextTutorialPage());

        this.tutorialTexts = [];
    }

    showTutorialPage1() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Titolo
        this.tutorialTexts.push(this.add.text(centerX, centerY - 170, '🏛️ BABILONIA 🏛️', {
            fontSize: '28px', fontFamily: 'Arial', color: '#eab308', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102));

        // Sottotitolo
        this.tutorialTexts.push(this.add.text(centerX, centerY - 135, 'Il Segreto di Bobby', {
            fontSize: '18px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'italic'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102));

        // Storia (origin top-center per evitare sovrapposizioni)
        const story = `Nell'antica città di Babilonia, il Capo-città
Giacomo è stato misteriosamente rapito!

Tu sei Sophia, una giovane investigatrice
che deve scoprire la verità.

Esplora la città, parla con gli abitanti
e risolvi gli enigmi che nascondono.

Solo raccogliendo tutti gli indizi potrai
scoprire il nome del colpevole.`;

        this.tutorialTexts.push(this.add.text(centerX, centerY - 100, story, {
            fontSize: '15px', fontFamily: 'Arial', color: '#d1d5db', align: 'center', lineSpacing: 4
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(102));

        // Indicatore pagina e bottone
        this.tutorialTexts.push(this.add.text(centerX, centerY + 155, '[ Clicca per continuare ]', {
            fontSize: '18px', fontFamily: 'Arial', color: '#eab308', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102));

        this.tutorialTexts.push(this.add.text(centerX, centerY + 180, '1 / 2', {
            fontSize: '14px', fontFamily: 'Arial', color: '#888888'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102));
    }

    showTutorialPage2() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Titolo
        this.tutorialTexts.push(this.add.text(centerX, centerY - 170, '🎮 CONTROLLI 🎮', {
            fontSize: '28px', fontFamily: 'Arial', color: '#eab308', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102));

        // Controlli con layout a tabella
        const controls = [
            { icon: '↑ ↓ ← →', key: 'FRECCE', desc: 'Muoviti nella mappa' },
            { icon: '▭', key: 'SPAZIO', desc: 'Parla con i personaggi' },
            { icon: '⏎', key: 'INVIO', desc: 'Invia la tua risposta' },
            { icon: '✕', key: 'ESC', desc: 'Chiudi il dialogo' }
        ];

        const startY = centerY - 100;
        const rowHeight = 55;

        controls.forEach((ctrl, i) => {
            const y = startY + (i * rowHeight);

            // Icona (centrata in una colonna fissa)
            this.tutorialTexts.push(this.add.text(centerX - 170, y, ctrl.icon, {
                fontSize: '22px', fontFamily: 'Arial', color: '#eab308'
            }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(102));

            // Tasto
            this.tutorialTexts.push(this.add.text(centerX - 70, y, ctrl.key, {
                fontSize: '18px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(102));

            // Descrizione
            this.tutorialTexts.push(this.add.text(centerX + 60, y, ctrl.desc, {
                fontSize: '16px', fontFamily: 'Arial', color: '#d1d5db'
            }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(102));
        });

        // Indicatore pagina e bottone
        this.tutorialTexts.push(this.add.text(centerX, centerY + 155, '[ Clicca per iniziare ]', {
            fontSize: '18px', fontFamily: 'Arial', color: '#eab308', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102));

        this.tutorialTexts.push(this.add.text(centerX, centerY + 180, '2 / 2', {
            fontSize: '14px', fontFamily: 'Arial', color: '#888888'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102));
    }

    clearTutorialTexts() {
        this.tutorialTexts.forEach(t => t.destroy());
        this.tutorialTexts = [];
    }

    nextTutorialPage() {
        if (this.tutorialPage === 1) {
            this.clearTutorialTexts();
            this.tutorialPage = 2;
            this.showTutorialPage2();
        } else {
            this.closeTutorial();
        }
    }

    closeTutorial() {
        this.tutorialOverlay.destroy();
        this.tutorialPanel.destroy();
        this.tutorialTexts.forEach(t => t.destroy());
        this.tutorialActive = false;
    }

    // === GAME EVENTS ===

    handleGameEvent(event) {
        if (event === 'victory' && !this.gameWon) {
            this.gameWon = true;
            // Show victory screen after a short delay to let dialogue finish
            this.time.delayedCall(2000, () => {
                this.showVictory();
            });
        }
    }

    showVictory() {
        this.victoryActive = true;
        this.victoryPage = 1;
        this.createVictoryBase();
        this.showVictoryPage1();
    }

    createVictoryBase() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Dark overlay
        this.victoryOverlay = this.add.graphics();
        this.victoryOverlay.fillStyle(0x000000, 0.9);
        this.victoryOverlay.fillRect(0, 0, width, height);
        this.victoryOverlay.setScrollFactor(0).setDepth(200);

        // Victory panel with gold border
        this.victoryPanel = this.add.graphics();
        this.victoryPanel.fillStyle(0x1a1a2e, 1);
        this.victoryPanel.fillRoundedRect(centerX - 280, centerY - 220, 560, 440, 20);
        this.victoryPanel.lineStyle(4, 0xffd700, 1);
        this.victoryPanel.strokeRoundedRect(centerX - 280, centerY - 220, 560, 440, 20);
        this.victoryPanel.setScrollFactor(0).setDepth(201);

        // Click handler
        this.victoryOverlay.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, width, height),
            Phaser.Geom.Rectangle.Contains
        );
        this.victoryOverlay.on('pointerdown', () => this.nextVictoryPage());

        this.victoryTexts = [];
    }

    showVictoryPage1() {
        const width = this.cameras.main.width;
        const centerX = width / 2;
        const centerY = this.cameras.main.height / 2;

        // Victory title with crown emoji
        this.victoryTexts.push(this.add.text(centerX, centerY - 180, '👑 VITTORIA! 👑', {
            fontSize: '36px', fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202));

        // Subtitle
        this.victoryTexts.push(this.add.text(centerX, centerY - 135, 'Il Mistero è Stato Risolto!', {
            fontSize: '20px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'italic'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202));

        // Victory story
        const story = `Complimenti, investigatrice Sophia!

Hai scoperto la verità su Bobby, il rapitore
che si nascondeva proprio sotto i tuoi occhi,
travestito da guida spirituale.

Grazie al tuo ingegno e alla tua perseveranza,
il Capo-città Giacomo può finalmente tornare
a guidare Babilonia.

La città ti è eternamente grata!`;

        this.victoryTexts.push(this.add.text(centerX, centerY - 90, story, {
            fontSize: '16px', fontFamily: 'Arial', color: '#d1d5db', align: 'center', lineSpacing: 6
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(202));

        // Continue prompt
        this.victoryTexts.push(this.add.text(centerX, centerY + 165, '[ Clicca per continuare ]', {
            fontSize: '18px', fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202));

        this.victoryTexts.push(this.add.text(centerX, centerY + 195, '1 / 2', {
            fontSize: '14px', fontFamily: 'Arial', color: '#888888'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202));
    }

    showVictoryPage2() {
        const width = this.cameras.main.width;
        const centerX = width / 2;
        const centerY = this.cameras.main.height / 2;

        // Credits title
        this.victoryTexts.push(this.add.text(centerX, centerY - 180, '🎮 GRAZIE PER AVER GIOCATO 🎮', {
            fontSize: '24px', fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202));

        // Credits
        const credits = `BABILONIA: Il Segreto di Bobby

Un gioco narrativo con personaggi AI

━━━━━━━━━━━━━━━━━━━━━━

Sviluppato con passione
usando Phaser 3 e LangChain

━━━━━━━━━━━━━━━━━━━━━━

Vuoi rigiocare?
Premi il pulsante qui sotto per ricominciare
una nuova avventura a Babilonia!`;

        this.victoryTexts.push(this.add.text(centerX, centerY - 130, credits, {
            fontSize: '15px', fontFamily: 'Arial', color: '#d1d5db', align: 'center', lineSpacing: 5
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(202));

        // New Game button
        const buttonY = centerY + 140;
        const buttonWidth = 200;
        const buttonHeight = 45;

        this.newGameButton = this.add.graphics();
        this.newGameButton.fillStyle(0xffd700, 1);
        this.newGameButton.fillRoundedRect(centerX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 10);
        this.newGameButton.setScrollFactor(0).setDepth(202);

        this.newGameButtonText = this.add.text(centerX, buttonY, '🔄 NUOVA PARTITA', {
            fontSize: '16px', fontFamily: 'Arial', color: '#1a1a2e', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(203);

        // Make button interactive
        this.newGameButton.setInteractive(
            new Phaser.Geom.Rectangle(centerX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight),
            Phaser.Geom.Rectangle.Contains
        );
        this.newGameButton.on('pointerdown', () => this.restartGame());
        this.newGameButton.on('pointerover', () => {
            this.newGameButton.clear();
            this.newGameButton.fillStyle(0xffc000, 1);
            this.newGameButton.fillRoundedRect(centerX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 10);
        });
        this.newGameButton.on('pointerout', () => {
            this.newGameButton.clear();
            this.newGameButton.fillStyle(0xffd700, 1);
            this.newGameButton.fillRoundedRect(centerX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 10);
        });

        this.victoryTexts.push(this.add.text(centerX, centerY + 195, '2 / 2', {
            fontSize: '14px', fontFamily: 'Arial', color: '#888888'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202));
    }

    clearVictoryTexts() {
        this.victoryTexts.forEach(t => t.destroy());
        this.victoryTexts = [];
    }

    nextVictoryPage() {
        if (this.victoryPage === 1) {
            this.clearVictoryTexts();
            this.victoryPage = 2;
            this.showVictoryPage2();
        }
        // Page 2 has buttons, so clicking outside does nothing
    }

    closeVictory() {
        if (this.victoryOverlay) this.victoryOverlay.destroy();
        if (this.victoryPanel) this.victoryPanel.destroy();
        if (this.newGameButton) this.newGameButton.destroy();
        if (this.newGameButtonText) this.newGameButtonText.destroy();
        this.victoryTexts.forEach(t => t.destroy());
        this.victoryActive = false;
    }

    async restartGame() {
        // Close victory screen
        this.closeVictory();

        // Reset game state
        this.gameWon = false;

        // Call API to reset memory
        try {
            const response = await fetch(`${this.getApiUrl()}/reset-memory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                console.error('Failed to reset memory:', response.statusText);
            }
        } catch (error) {
            console.error('Error resetting memory:', error);
        }

        // Restart the scene
        this.scene.restart();
    }

    getApiUrl() {
        // Check for build-time API_URL (Railway deployment)
        if (process.env.API_URL) {
            return process.env.API_URL;
        }
        // Fallback to auto-detection for local dev
        const isHttps = window.location.protocol === 'https:';
        if (isHttps) {
            const currentHostname = window.location.hostname;
            return `https://${currentHostname.replace('8080', '8000')}`;
        }
        return 'http://localhost:8000';
    }
}
