import ApiService from '../services/ApiService';
import WebSocketApiService from '../services/WebSocketApiService';

const SPEAKER_COLORS = {
  nicolo: '#60a5fa',
  akane: '#f87171',
  hiroshi: '#34d399',
  ryo: '#a78bfa',
  mei: '#f9a8d4',
  kaito: '#fbbf24',
  socrates: '#fcd34d'
};

const WAITING_PHRASES = {
  nicolo: [
    'Sorride enigmatico...',
    'Scruta Sophia con sguardo gentile...',
    'Sceglie con cura le parole...'
  ],
  akane: [
    'Sbuffa contrariata...',
    'Incrocia le braccia, infastidita...',
    'Borbotta qualcosa fra sé...',
    'Distoglie lo sguardo arrossendo...'
  ],
  hiroshi: [
    'Si liscia il mantello con sufficienza...',
    'Solleva il mento, compiaciuto...',
    'Soppesa la tua domanda con aria altezzosa...'
  ],
  ryo: [
    'Chiude gli occhi in meditazione...',
    'Resta in silenzio...',
    'Annuisce lentamente...'
  ],
  mei: [
    'Sfoglia un libro polveroso...',
    'Cerca tra antichi tomi...',
    'Sorride dolcemente prima di rispondere...'
  ],
  kaito: [
    'Tira una boccata dalla pipa...',
    'Scruta l\'orizzonte con occhi stanchi...',
    'Si aggiusta il berretto da marinaio...',
    'Sospira al ricordo del mare...'
  ],
  socrates: [
    'Strizza l\'occhio rompendo la quarta parete...',
    'Aggiusta gli occhiali con un sorriso...',
    'Si gratta il mento, pensieroso...'
  ]
};

const DEFAULT_WAITING_PHRASES = [
  'Sta riflettendo...',
  'Cerca le parole giuste...',
  'Consulta i suoi pensieri...'
];

class DialogueManager {
  constructor(scene) {
    // Core properties
    this.scene = scene;
    this.dialogueBox = null;
    this.activePhilosopher = null;

    // State management
    this.isTyping = false;
    this.isStreaming = false;
    this.currentMessage = '';
    this.streamingText = '';
    
    // Cursor properties
    this.cursorBlinkEvent = null;
    this.cursorVisible = true;
    
    // Connection management
    this.hasSetupListeners = false;
    this.disconnectTimeout = null;
  }

  // === Initialization ===
  
  initialize(dialogueBox) {
    this.dialogueBox = dialogueBox;
    
    if (!this.hasSetupListeners) {
      this.setupKeyboardListeners();
      this.hasSetupListeners = true;
    }
  }

  setupKeyboardListeners() {
    this.scene.input.keyboard.on('keydown', async (event) => {
      if (!this.isTyping) {
        if (event.key === 'Space' || event.key === ' ') {
          if (this.isStreaming) {
            this.skipStreaming();
          } else if (this.dialogueBox && this.dialogueBox.hasNextPage()) {
            this.dialogueBox.nextPage();
          }
        }
        return;
      }

      this.handleKeyPress(event);
    });
  }

  // === Input Handling ===
  
  async handleKeyPress(event) {
    if (event.key === 'Enter') {
      await this.handleEnterKey();
    } else if (event.key === 'Escape') {
      this.closeDialogue();
    } else if (event.key === 'Backspace') {
      this.currentMessage = this.currentMessage.slice(0, -1);
      this.updateDialogueText();
    } else if (event.key.length === 1) { // Single character keys
      if (!this.isTyping) {
        this.currentMessage = '';
        this.isTyping = true;
      }
      
      this.currentMessage += event.key;
      this.updateDialogueText();
    }
  }

  getSpeakerColor() {
    return SPEAKER_COLORS[this.activePhilosopher?.id] || '#ffffff';
  }

  async handleEnterKey() {
    if (this.currentMessage.trim() !== '') {
      this.stopCursorBlink();
      this.dialogueBox.showTypingIndicator(
        this.activePhilosopher.name,
        this.getSpeakerColor(),
        WAITING_PHRASES[this.activePhilosopher?.id] || DEFAULT_WAITING_PHRASES
      );
      
      if (this.activePhilosopher.defaultMessage) {
        await this.handleDefaultMessage();
      } else {
        await this.handleWebSocketMessage();
      }
      
      this.currentMessage = '';
      this.isTyping = false;
    } else if (!this.isTyping) {
      this.restartTypingPrompt();
    }
  }

  // === Message Processing ===
  
  async handleDefaultMessage() {
    const apiResponse = this.activePhilosopher.defaultMessage;
    this.dialogueBox.setSpeaker(this.activePhilosopher.name, this.getSpeakerColor());
    this.dialogueBox.show('', true);
    await this.streamText(apiResponse);
  }

  async handleWebSocketMessage() {
    this.isStreaming = true;
    this.streamingText = '';
    
    try {
      await this.processWebSocketMessage();
    } catch (error) {
      console.error('WebSocket error:', error);
      await this.fallbackToRegularApi();
    } finally {
      this.isTyping = false;
    }
  }

  async processWebSocketMessage() {
    await WebSocketApiService.connect();

    const callbacks = {
      onMessage: () => {
        this.finishStreaming();
      },
      onChunk: (chunk) => {
        if (this.streamingText === '') {
          this.dialogueBox.setSpeaker(this.activePhilosopher.name, this.getSpeakerColor());
        }
        this.streamingText += chunk;
        this.dialogueBox.show(this.streamingText, true, true);
      },
      onStreamingStart: () => {
        this.isStreaming = true;
      },
      onStreamingEnd: () => {
        this.finishStreaming();
      },
      onGameEvent: (event) => {
        // Notify the scene about game events (e.g., victory)
        if (this.scene && typeof this.scene.handleGameEvent === 'function') {
          this.scene.handleGameEvent(event);
        }
      }
    };

    await WebSocketApiService.sendMessage(
      this.activePhilosopher,
      this.currentMessage,
      callbacks
    );

    while (this.isStreaming) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.currentMessage = '';
    WebSocketApiService.disconnect();
  }

  finishStreaming() {
    this.isStreaming = false;
    this.dialogueBox.show(this.streamingText, true);
  }

  async fallbackToRegularApi() {
    const apiResponse = await ApiService.sendMessage(
      this.activePhilosopher,
      this.currentMessage
    );
    this.dialogueBox.setSpeaker(this.activePhilosopher.name, this.getSpeakerColor());
    await this.streamText(apiResponse);
  }

  // === UI Management ===
  
  updateDialogueText() {
    const displayText = this.currentMessage + (this.cursorVisible ? '|' : '');
    this.dialogueBox.show(displayText, true);
  }

  restartTypingPrompt() {
    this.currentMessage = '';
    this.dialogueBox.setSpeaker(null);
    this.dialogueBox.show('|', true);
    
    this.stopCursorBlink();
    this.cursorVisible = true;
    this.startCursorBlink();
    
    this.updateDialogueText();
  }

  // === Cursor Management ===
  
  startCursorBlink() {
    this.cursorBlinkEvent = this.scene.time.addEvent({
      delay: 300,  
      callback: () => {
        if (this.dialogueBox.isVisible() && this.isTyping) {
          this.cursorVisible = !this.cursorVisible;
          this.updateDialogueText();
        }
      },
      loop: true
    });
  }

  stopCursorBlink() {
    if (this.cursorBlinkEvent) {
      this.cursorBlinkEvent.remove();
      this.cursorBlinkEvent = null;
    }
  }

  // === Dialogue Flow Control ===
  
  startDialogue(philosopher) {
    this.cancelDisconnectTimeout();
    
    this.activePhilosopher = philosopher;
    this.isTyping = true;
    this.currentMessage = '';

    this.dialogueBox.setSpeaker(null);
    this.dialogueBox.show('|', true);
    this.stopCursorBlink();
    
    this.cursorVisible = true;
    this.startCursorBlink();
  }

  closeDialogue() {
    this.dialogueBox.hide();
    this.isTyping = false;
    this.currentMessage = '';
    this.isStreaming = false;

    this.stopCursorBlink();
    this.scheduleDisconnect();
  }

  async showAgentMessage(philosopher, text) {
    this.cancelDisconnectTimeout();
    this.activePhilosopher = philosopher;
    this.isTyping = false;
    this.currentMessage = '';
    this.stopCursorBlink();

    this.dialogueBox.setSpeaker(philosopher.name, SPEAKER_COLORS[philosopher.id] || '#ffffff');
    this.dialogueBox.show('', false);
    await this.streamText(text);
  }

  isInDialogue() {
    return this.dialogueBox && this.dialogueBox.isVisible();
  }

  continueDialogue() {
    if (!this.dialogueBox.isVisible()) return;

    if (this.isStreaming) {
      this.skipStreaming();
    } else if (this.dialogueBox.hasNextPage()) {
      this.dialogueBox.nextPage();
    } else if (!this.isTyping) {
      this.isTyping = true;
      this.currentMessage = '';
      this.dialogueBox.show('', false);
      this.restartTypingPrompt();
    }
  }

  // === Text Streaming ===
  
  async streamText(text, speed = 30) {
    this.isStreaming = true;
    let displayedText = '';
    
    this.stopCursorBlink();
    
    for (let i = 0; i < text.length; i++) {
      displayedText += text[i];
      this.dialogueBox.show(displayedText, true);
      
      await new Promise(resolve => setTimeout(resolve, speed));
      
      if (!this.isStreaming) break;
    }
    
    if (this.isStreaming) {
      this.dialogueBox.show(text, true);
    }
    
    this.isStreaming = false;
    return true;
  }

  skipStreaming() {
    this.isStreaming = false;
  }

  // === Connection Management ===
  
  cancelDisconnectTimeout() {
    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = null;
    }
  }

  scheduleDisconnect() {
    this.cancelDisconnectTimeout();
    
    this.disconnectTimeout = setTimeout(() => {
      WebSocketApiService.disconnect();
    }, 5000);
  }
}

export default DialogueManager; 
