class DialogueBox {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.awaitingInput = false;

        // Pagination state
        this.fullMessage = '';
        this.pages = [];
        this.currentPage = 0;
        this.maxLines = 6;

        // Set default configuration values
        const {
            x = 100,
            y = 500,
            width = 824,
            height = 200,
            backgroundColor = 0x000000,
            backgroundAlpha = 0.7,
            borderColor = 0xffffff,
            borderWidth = 2,
            textConfig = {
                font: '24px Arial',
                fill: '#ffffff',
                wordWrap: { width: 784 }
            },
            depth = 30
        } = config;

        this.textConfig = textConfig;
        this.boxWidth = width;
        this.boxX = x;
        this.boxY = y;

        // Create background
        const graphics = scene.add.graphics();
        graphics.fillStyle(backgroundColor, backgroundAlpha);
        graphics.fillRect(x, y, width, height);
        graphics.lineStyle(borderWidth, borderColor);
        graphics.strokeRect(x, y, width, height);

        // Create text with padding
        this.text = scene.add.text(x + 20, y + 20, '', textConfig);

        // Page indicator (e.g. "▼ SPAZIO per continuare")
        this.pageIndicator = scene.add.text(x + width - 20, y + height - 15, '', {
            font: '14px Arial',
            fill: '#eab308',
            fontStyle: 'bold'
        }).setOrigin(1, 1);

        // Group elements
        this.container = scene.add.container(0, 0, [graphics, this.text, this.pageIndicator]);
        this.container.setDepth(depth);
        this.container.setScrollFactor(0);
        this.hide();
    }

    show(message, awaitInput = false, streaming = false) {
        this.fullMessage = message;
        this.awaitingInput = awaitInput;
        this.container.setVisible(true);

        if (streaming) {
            // During streaming, show raw text without pagination
            this.text.setText(message);
            this.pageIndicator.setText('');
            this.pages = [];
            this.currentPage = 0;
        } else {
            // Paginate the final message
            this.pages = this.paginateText(message);
            this.currentPage = 0;
            this.showCurrentPage();
        }
    }

    showCurrentPage() {
        if (this.pages.length === 0) {
            this.text.setText(this.fullMessage);
            this.pageIndicator.setText('');
            return;
        }

        this.text.setText(this.pages[this.currentPage]);

        if (this.hasNextPage()) {
            this.pageIndicator.setText('▼ SPAZIO');
        } else {
            this.pageIndicator.setText('');
        }
    }

    paginateText(message) {
        if (!message) return [message];

        // Use a hidden text object to measure line wrapping
        const measureText = this.scene.add.text(0, -9999, message, this.textConfig);
        measureText.setVisible(false);

        const wrappedLines = measureText.getWrappedText(message);
        measureText.destroy();

        if (wrappedLines.length <= this.maxLines) {
            return [message];
        }

        // Split into pages of maxLines each
        const pages = [];
        for (let i = 0; i < wrappedLines.length; i += this.maxLines) {
            const pageLines = wrappedLines.slice(i, i + this.maxLines);
            pages.push(pageLines.join('\n'));
        }

        return pages;
    }

    hasNextPage() {
        return this.currentPage < this.pages.length - 1;
    }

    nextPage() {
        if (this.hasNextPage()) {
            this.currentPage++;
            this.showCurrentPage();
            return true;
        }
        return false;
    }

    hide() {
        this.container.setVisible(false);
        this.awaitingInput = false;
        this.pages = [];
        this.currentPage = 0;
    }

    isVisible() {
        return this.container.visible;
    }

    isAwaitingInput() {
        return this.awaitingInput;
    }
}

export default DialogueBox;
