import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.add.image(0, 0, 'background').setOrigin(0, 0);

        const centerX = this.cameras.main.width / 2;
        const startY = 524;
        const buttonSpacing = 70;

        this.createButton(centerX, startY, 'Gioca!', () => {
            this.scene.start('Game');
        });

        this.createButton(centerX, startY + buttonSpacing, 'Istruzioni', () => {
            this.showInstructions();
        });

        this.createButton(centerX, startY + buttonSpacing * 2, 'Crediti', () => {
            window.open('https://github.com/neural-maze/philoagents-course', '_blank');
        });
    }

    createButton(x, y, text, callback) {
        const buttonWidth = 350;
        const buttonHeight = 60;
        const cornerRadius = 20;
        const maxFontSize = 28;
        const padding = 10;

        const shadow = this.add.graphics();
        shadow.fillStyle(0x666666, 1);
        shadow.fillRoundedRect(x - buttonWidth / 2 + 4, y - buttonHeight / 2 + 4, buttonWidth, buttonHeight, cornerRadius);

        const button = this.add.graphics();
        button.fillStyle(0xffffff, 1);
        button.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, cornerRadius);
        button.setInteractive(
            new Phaser.Geom.Rectangle(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight),
            Phaser.Geom.Rectangle.Contains
        );

        let fontSize = maxFontSize;
        let buttonText;
        do {
            if (buttonText) buttonText.destroy();
            
            buttonText = this.add.text(x, y, text, {
                fontSize: `${fontSize}px`,
                fontFamily: 'Arial',
                color: '#000000',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            fontSize -= 1;
        } while (buttonText.width > buttonWidth - padding && fontSize > 10);

        button.on('pointerover', () => {
            this.updateButtonStyle(button, shadow, x, y, buttonWidth, buttonHeight, cornerRadius, true);
            buttonText.y -= 2;
        });

        button.on('pointerout', () => {
            this.updateButtonStyle(button, shadow, x, y, buttonWidth, buttonHeight, cornerRadius, false);
            buttonText.y += 2;
        });

        button.on('pointerdown', callback);
        
        return { button, shadow, text: buttonText };
    }

    updateButtonStyle(button, shadow, x, y, width, height, radius, isHover) {
        button.clear();
        shadow.clear();
        
        if (isHover) {
            button.fillStyle(0x87CEEB, 1);
            shadow.fillStyle(0x888888, 1);
            shadow.fillRoundedRect(x - width / 2 + 2, y - height / 2 + 2, width, height, radius);
        } else {
            button.fillStyle(0xffffff, 1);
            shadow.fillStyle(0x666666, 1);
            shadow.fillRoundedRect(x - width / 2 + 4, y - height / 2 + 4, width, height, radius);
        }
        
        button.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    }

    showInstructions() {
        this.instructionPage = 1;
        this.instructionElements = [];
        this.createInstructionBase();
        this.showInstructionPage1();
    }

    createInstructionBase() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Dark overlay (same as in-game tutorial)
        this.instrOverlay = this.add.graphics();
        this.instrOverlay.fillStyle(0x000000, 0.85);
        this.instrOverlay.fillRect(0, 0, width, height);

        // Panel (same style as in-game tutorial)
        this.instrPanel = this.add.graphics();
        this.instrPanel.fillStyle(0x1a1a2e, 1);
        this.instrPanel.fillRoundedRect(centerX - 250, centerY - 200, 500, 400, 20);
        this.instrPanel.lineStyle(3, 0xeab308, 1);
        this.instrPanel.strokeRoundedRect(centerX - 250, centerY - 200, 500, 400, 20);

        // Click handler
        this.instrOverlay.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, width, height),
            Phaser.Geom.Rectangle.Contains
        );
        this.instrOverlay.on('pointerdown', () => this.nextInstructionPage());
    }

    showInstructionPage1() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.instructionElements.push(this.add.text(centerX, centerY - 170, '🏛️ BABILONIA 🏛️', {
            fontSize: '28px', fontFamily: 'Arial', color: '#eab308', fontStyle: 'bold'
        }).setOrigin(0.5));

        this.instructionElements.push(this.add.text(centerX, centerY - 135, 'Il Segreto di Bobby', {
            fontSize: '18px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'italic'
        }).setOrigin(0.5));

        const story = `Nell'antica città di Babilonia, il Capo-città
Giacomo è stato misteriosamente rapito!

Tu sei Sophia, una giovane investigatrice
che deve scoprire la verità.

Esplora la città, parla con gli abitanti
e risolvi gli enigmi che nascondono.

Solo raccogliendo tutti gli indizi potrai
scoprire il nome del colpevole.`;

        this.instructionElements.push(this.add.text(centerX, centerY - 100, story, {
            fontSize: '15px', fontFamily: 'Arial', color: '#d1d5db', align: 'center', lineSpacing: 4
        }).setOrigin(0.5, 0));

        this.instructionElements.push(this.add.text(centerX, centerY + 155, '[ Clicca per continuare ]', {
            fontSize: '18px', fontFamily: 'Arial', color: '#eab308', fontStyle: 'bold'
        }).setOrigin(0.5));

        this.instructionElements.push(this.add.text(centerX, centerY + 180, '1 / 2', {
            fontSize: '14px', fontFamily: 'Arial', color: '#888888'
        }).setOrigin(0.5));
    }

    showInstructionPage2() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.instructionElements.push(this.add.text(centerX, centerY - 170, '🎮 CONTROLLI 🎮', {
            fontSize: '28px', fontFamily: 'Arial', color: '#eab308', fontStyle: 'bold'
        }).setOrigin(0.5));

        const controls = [
            { icon: '↑ ↓ ← →', key: 'FRECCE', desc: 'Muoviti nella mappa' },
            { icon: '▭', key: 'SPAZIO', desc: 'Parla con i personaggi' },
            { icon: '⏎', key: 'INVIO', desc: 'Invia la tua risposta' },
            { icon: '✕', key: 'ESC', desc: 'Chiudi il dialogo' }
        ];

        const startY = centerY - 100;
        controls.forEach((ctrl, i) => {
            const y = startY + (i * 55);
            this.instructionElements.push(this.add.text(centerX - 170, y, ctrl.icon, {
                fontSize: '22px', fontFamily: 'Arial', color: '#eab308'
            }).setOrigin(0.5, 0.5));
            this.instructionElements.push(this.add.text(centerX - 70, y, ctrl.key, {
                fontSize: '18px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5, 0.5));
            this.instructionElements.push(this.add.text(centerX + 60, y, ctrl.desc, {
                fontSize: '16px', fontFamily: 'Arial', color: '#d1d5db'
            }).setOrigin(0, 0.5));
        });

        this.instructionElements.push(this.add.text(centerX, centerY + 155, '[ Clicca per chiudere ]', {
            fontSize: '18px', fontFamily: 'Arial', color: '#eab308', fontStyle: 'bold'
        }).setOrigin(0.5));

        this.instructionElements.push(this.add.text(centerX, centerY + 180, '2 / 2', {
            fontSize: '14px', fontFamily: 'Arial', color: '#888888'
        }).setOrigin(0.5));
    }

    nextInstructionPage() {
        if (this.instructionPage === 1) {
            this.instructionElements.forEach(t => t.destroy());
            this.instructionElements = [];
            this.instructionPage = 2;
            this.showInstructionPage2();
        } else {
            this.closeInstructions();
        }
    }

    closeInstructions() {
        this.instrOverlay.destroy();
        this.instrPanel.destroy();
        this.instructionElements.forEach(t => t.destroy());
    }
}
