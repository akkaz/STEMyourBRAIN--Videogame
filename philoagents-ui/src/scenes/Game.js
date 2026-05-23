import { Scene } from 'phaser';
import Character from '../classes/Character';
import DialogueBox from '../classes/DialogueBox';
import DialogueManager from '../classes/DialogueManager';
import ApiService from '../services/ApiService';

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
        this.nicoloMenuActive = false;
        this.solutionFormActive = false;
        this.apiConnected = false;
        this.statusDot = null;
        this.healthPollEvent = null;
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

        // API connection status indicator
        this.createStatusIndicator();
        this.startHealthPolling();
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
                if (this.nicoloMenuActive || this.solutionFormActive) {
                    // already in Nicolò menu/form, ignore space
                } else if (!this.dialogueBox.isVisible()) {
                    if (nearbyPhilosopher.id === 'nicolo') {
                        this.showNicoloMenu(nearbyPhilosopher);
                    } else {
                        this.dialogueManager.startDialogue(nearbyPhilosopher);
                    }
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

        if (!isInDialogue && !this.tutorialActive && !this.victoryActive && !this.nicoloMenuActive && !this.solutionFormActive) {
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

    // === API STATUS INDICATOR ===

    createStatusIndicator() {
        this.statusDot = this.add.graphics();
        this.statusDot.setScrollFactor(0);
        this.statusDot.setDepth(50);
        this.drawStatusDot(false);
    }

    drawStatusDot(connected) {
        const x = this.cameras.main.width - 30;
        const y = 20;

        this.statusDot.clear();
        this.statusDot.fillStyle(connected ? 0x166534 : 0x7f1d1d, 0.5);
        this.statusDot.fillCircle(x, y, 10);
        this.statusDot.fillStyle(connected ? 0x22c55e : 0xef4444, 1);
        this.statusDot.fillCircle(x, y, 8);
    }

    async pollHealth() {
        const wasConnected = this.apiConnected;
        this.apiConnected = await ApiService.checkHealth();
        this.drawStatusDot(this.apiConnected);

        if (wasConnected !== this.apiConnected && this.healthPollEvent) {
            this.healthPollEvent.remove();
            this.healthPollEvent = this.time.addEvent({
                delay: this.apiConnected ? 30000 : 5000,
                callback: () => this.pollHealth(),
                loop: true
            });
        }
    }

    async startHealthPolling() {
        await this.pollHealth();
        this.healthPollEvent = this.time.addEvent({
            delay: this.apiConnected ? 30000 : 5000,
            callback: () => this.pollHealth(),
            loop: true
        });
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

        // Victory panel - taller to fit content (560x540)
        this.victoryPanel = this.add.graphics();
        this.victoryPanel.fillStyle(0x1a1a2e, 1);
        this.victoryPanel.fillRoundedRect(centerX - 280, centerY - 270, 560, 540, 20);
        this.victoryPanel.lineStyle(4, 0xffd700, 1);
        this.victoryPanel.strokeRoundedRect(centerX - 280, centerY - 270, 560, 540, 20);
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
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const top = centerY - 250;

        // Victory title
        this.victoryTexts.push(this.add.text(centerX, top, '👑 VITTORIA! 👑', {
            fontSize: '36px', fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202));

        // Subtitle
        this.victoryTexts.push(this.add.text(centerX, top + 50, 'Il Mistero è Stato Risolto!', {
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

        this.victoryTexts.push(this.add.text(centerX, top + 90, story, {
            fontSize: '16px', fontFamily: 'Arial', color: '#d1d5db', align: 'center', lineSpacing: 6
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(202));

        // Continue prompt - anchored to panel bottom
        this.victoryTexts.push(this.add.text(centerX, centerY + 220, '[ Clicca per continuare ]', {
            fontSize: '18px', fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202));

        this.victoryTexts.push(this.add.text(centerX, centerY + 248, '1 / 2', {
            fontSize: '14px', fontFamily: 'Arial', color: '#888888'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202));
    }

    showVictoryPage2() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const top = centerY - 250;

        // Credits title
        this.victoryTexts.push(this.add.text(centerX, top, '🎮 GRAZIE PER AVER GIOCATO 🎮', {
            fontSize: '24px', fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202));

        // Credits - more compact
        const credits = `BABILONIA: Il Segreto di Bobby
Un gioco narrativo con personaggi AI

━━━━━━━━━━━━━━━━━━━━━━

Sviluppato con passione
usando Phaser 3 e LangChain

━━━━━━━━━━━━━━━━━━━━━━`;

        this.victoryTexts.push(this.add.text(centerX, top + 50, credits, {
            fontSize: '15px', fontFamily: 'Arial', color: '#d1d5db', align: 'center', lineSpacing: 5
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(202));

        // New Game button - anchored to panel bottom
        const buttonY = centerY + 170;
        const buttonWidth = 250;
        const buttonHeight = 50;

        this.newGameButton = this.add.graphics();
        this.newGameButton.fillStyle(0xffd700, 1);
        this.newGameButton.fillRoundedRect(centerX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 12);
        this.newGameButton.setScrollFactor(0).setDepth(202);

        this.newGameButtonText = this.add.text(centerX, buttonY, '🔄 NUOVA PARTITA', {
            fontSize: '18px', fontFamily: 'Arial', color: '#1a1a2e', fontStyle: 'bold'
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
            this.newGameButton.fillRoundedRect(centerX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 12);
        });
        this.newGameButton.on('pointerout', () => {
            this.newGameButton.clear();
            this.newGameButton.fillStyle(0xffd700, 1);
            this.newGameButton.fillRoundedRect(centerX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 12);
        });

        this.victoryTexts.push(this.add.text(centerX, centerY + 248, '2 / 2', {
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

    // === NICOLÒ MENU (Tutorial / Soluzione) ===

    showNicoloMenu(nicoloChar) {
        if (this.nicoloMenuActive) return;
        this.nicoloMenuActive = true;
        this._nicoloChar = nicoloChar;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const cx = width / 2;
        const cy = height / 2;

        const nm = {};
        nm.overlay = this.add.graphics().setScrollFactor(0).setDepth(150);
        nm.overlay.fillStyle(0x000000, 0.75);
        nm.overlay.fillRect(0, 0, width, height);

        nm.panel = this.add.graphics().setScrollFactor(0).setDepth(151);
        nm.panel.fillStyle(0x1a1a2e, 1);
        nm.panel.fillRoundedRect(cx - 240, cy - 160, 480, 320, 20);
        nm.panel.lineStyle(3, 0x60a5fa, 1);
        nm.panel.strokeRoundedRect(cx - 240, cy - 160, 480, 320, 20);

        nm.title = this.add.text(cx, cy - 120, 'Nicolò', {
            fontSize: '28px', fontFamily: 'Arial', color: '#60a5fa', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(152);

        nm.subtitle = this.add.text(cx, cy - 85, 'Cosa vuoi fare?', {
            fontSize: '18px', fontFamily: 'Arial', color: '#d1d5db', fontStyle: 'italic'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(152);

        nm.buttons = [];
        nm.buttons.push(this.createMenuButton(cx, cy - 20, 'Tutorial', () => {
            this.closeNicoloMenu();
            this.playNicoloTutorial();
        }));
        nm.buttons.push(this.createMenuButton(cx, cy + 50, 'Fornisci soluzione', () => {
            this.closeNicoloMenu();
            this.showSolutionForm();
        }));
        nm.buttons.push(this.createMenuButton(cx, cy + 120, 'Annulla', () => {
            this.closeNicoloMenu();
        }, 0x6b7280));

        this._nicoloMenu = nm;

        nm.escHandler = (e) => {
            if (e.key === 'Escape') this.closeNicoloMenu();
        };
        this.input.keyboard.on('keydown', nm.escHandler);
    }

    createMenuButton(x, y, text, callback, baseColor = 0x60a5fa) {
        const w = 320, h = 50, r = 12;
        const btn = this.add.graphics().setScrollFactor(0).setDepth(152);
        const draw = (color) => {
            btn.clear();
            btn.fillStyle(color, 1);
            btn.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
            btn.lineStyle(2, 0xffffff, 0.4);
            btn.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
        };
        draw(baseColor);
        btn.setInteractive(
            new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h),
            Phaser.Geom.Rectangle.Contains
        );
        const label = this.add.text(x, y, text, {
            fontSize: '20px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(153);
        btn.on('pointerover', () => draw(Phaser.Display.Color.IntegerToColor(baseColor).brighten(20).color));
        btn.on('pointerout', () => draw(baseColor));
        btn.on('pointerdown', callback);
        return { btn, label };
    }

    closeNicoloMenu() {
        if (!this._nicoloMenu) return;
        const nm = this._nicoloMenu;
        nm.overlay.destroy();
        nm.panel.destroy();
        nm.title.destroy();
        nm.subtitle.destroy();
        nm.buttons.forEach(b => { b.btn.destroy(); b.label.destroy(); });
        if (nm.escHandler) this.input.keyboard.off('keydown', nm.escHandler);
        this._nicoloMenu = null;
        this.nicoloMenuActive = false;
    }

    async playNicoloTutorial() {
        const tutorial = "Benvenuta a Babilonia, Sophia. Il nostro Capo-città Giacomo è stato rapito! Esplora la città, parla con i suoi abitanti e risolvi i loro enigmi: ognuno ti darà una lettera. Mettile insieme e tornerai da me per rivelare il nome del colpevole. Buona fortuna!";
        await this.dialogueManager.showAgentMessage(this._nicoloChar, tutorial);
    }

    // === SOLUTION FORM ===

    showSolutionForm() {
        if (this.solutionFormActive) return;
        this.solutionFormActive = true;

        const SOLUTION = 'BOBBY';
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const cx = width / 2;
        const cy = height / 2;

        const sf = {
            solution: SOLUTION,
            letters: ['', '', '', '', ''],
            correct: [false, false, false, false, false],
            cursor: 0,
            submitted: false
        };

        sf.overlay = this.add.graphics().setScrollFactor(0).setDepth(160);
        sf.overlay.fillStyle(0x000000, 0.85);
        sf.overlay.fillRect(0, 0, width, height);

        sf.panel = this.add.graphics().setScrollFactor(0).setDepth(161);
        sf.panel.fillStyle(0x1a1a2e, 1);
        sf.panel.fillRoundedRect(cx - 320, cy - 200, 640, 400, 20);
        sf.panel.lineStyle(3, 0xeab308, 1);
        sf.panel.strokeRoundedRect(cx - 320, cy - 200, 640, 400, 20);

        sf.title = this.add.text(cx, cy - 160, 'Chi è il rapitore?', {
            fontSize: '26px', fontFamily: 'Arial', color: '#eab308', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(162);

        sf.hint = this.add.text(cx, cy - 125, 'Inserisci le 5 lettere del suo nome', {
            fontSize: '16px', fontFamily: 'Arial', color: '#d1d5db', fontStyle: 'italic'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(162);

        // 5 caselle
        const boxSize = 70, gap = 14;
        const totalW = boxSize * 5 + gap * 4;
        const startX = cx - totalW / 2;
        const boxY = cy - 50;
        sf.boxes = [];
        sf.boxTexts = [];
        for (let i = 0; i < 5; i++) {
            const bx = startX + i * (boxSize + gap);
            const g = this.add.graphics().setScrollFactor(0).setDepth(162);
            sf.boxes.push(g);
            const t = this.add.text(bx + boxSize / 2, boxY + boxSize / 2, '', {
                fontSize: '40px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(163);
            sf.boxTexts.push(t);
            g._x = bx; g._y = boxY; g._size = boxSize;
        }

        sf.feedback = this.add.text(cx, cy + 50, '', {
            fontSize: '18px', fontFamily: 'Arial', color: '#f87171', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(162);

        sf.submitBtn = this.createMenuButton(cx - 110, cy + 120, 'Conferma', () => this.submitSolution(), 0x10b981);
        sf.closeBtn = this.createMenuButton(cx + 110, cy + 120, 'Chiudi', () => this.closeSolutionForm(), 0x6b7280);

        this._solutionForm = sf;
        this.redrawSolutionBoxes();

        sf.keyHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeSolutionForm();
                return;
            }
            if (e.key === 'Enter') {
                this.submitSolution();
                return;
            }
            if (e.key === 'Backspace') {
                if (sf.cursor > 0) {
                    sf.cursor--;
                    sf.letters[sf.cursor] = '';
                    sf.correct[sf.cursor] = false;
                    sf.submitted = false;
                    sf.feedback.setText('');
                    this.redrawSolutionBoxes();
                }
                return;
            }
            if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                // skip already-correct slots (after a submit)
                while (sf.cursor < 5 && sf.correct[sf.cursor]) sf.cursor++;
                if (sf.cursor < 5) {
                    sf.letters[sf.cursor] = e.key.toUpperCase();
                    sf.cursor++;
                    while (sf.cursor < 5 && sf.correct[sf.cursor]) sf.cursor++;
                    sf.submitted = false;
                    sf.feedback.setText('');
                    this.redrawSolutionBoxes();
                }
            }
        };
        this.input.keyboard.on('keydown', sf.keyHandler);
    }

    redrawSolutionBoxes() {
        const sf = this._solutionForm;
        if (!sf) return;
        for (let i = 0; i < 5; i++) {
            const g = sf.boxes[i];
            const isCursor = (i === sf.cursor) && !sf.submitted;
            const fillColor = sf.correct[i] ? 0x10b981 : 0x111827;
            const borderColor = sf.correct[i] ? 0x10b981 : (isCursor ? 0xeab308 : 0x4b5563);
            g.clear();
            g.fillStyle(fillColor, 1);
            g.fillRoundedRect(g._x, g._y, g._size, g._size, 10);
            g.lineStyle(3, borderColor, 1);
            g.strokeRoundedRect(g._x, g._y, g._size, g._size, 10);
            sf.boxTexts[i].setText(sf.letters[i]);
        }
    }

    submitSolution() {
        const sf = this._solutionForm;
        if (!sf) return;
        if (sf.letters.some(l => !l)) {
            sf.feedback.setColor('#f87171');
            sf.feedback.setText('Inserisci tutte e 5 le lettere');
            return;
        }
        sf.submitted = true;
        const sol = sf.solution;
        let allRight = true;
        for (let i = 0; i < 5; i++) {
            sf.correct[i] = (sf.letters[i] === sol[i]);
            if (!sf.correct[i]) allRight = false;
        }
        this.redrawSolutionBoxes();

        if (allRight) {
            sf.feedback.setColor('#10b981');
            sf.feedback.setText('Esatto! Hai svelato il mistero...');
            this.time.delayedCall(1500, () => {
                this.closeSolutionForm();
                this.handleGameEvent('victory');
            });
        } else {
            sf.feedback.setColor('#f87171');
            sf.feedback.setText('Non è il nome giusto. Le lettere verdi sono al posto corretto.');
            sf.cursor = sf.correct.findIndex(c => !c);
            if (sf.cursor === -1) sf.cursor = 0;
            this.redrawSolutionBoxes();
        }
    }

    closeSolutionForm() {
        const sf = this._solutionForm;
        if (!sf) return;
        sf.overlay.destroy();
        sf.panel.destroy();
        sf.title.destroy();
        sf.hint.destroy();
        sf.feedback.destroy();
        sf.boxes.forEach(b => b.destroy());
        sf.boxTexts.forEach(t => t.destroy());
        sf.submitBtn.btn.destroy(); sf.submitBtn.label.destroy();
        sf.closeBtn.btn.destroy(); sf.closeBtn.label.destroy();
        if (sf.keyHandler) this.input.keyboard.off('keydown', sf.keyHandler);
        this._solutionForm = null;
        this.solutionFormActive = false;
    }
}
