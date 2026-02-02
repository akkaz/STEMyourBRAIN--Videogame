# 🎭 Guida ai Personaggi del Gioco

## Come funzionano i personaggi nel nostro gioco?

Nel gioco dei filosofi, ogni personaggio (Socrate, Platone, Aristotele...) può **muoversi** e **parlare**. Ma come fa il computer a farli camminare in modo fluido?

---

## 🎬 Il trucco dell'animazione

### Cos'è un'animazione?

Un'animazione è come un **flipbook** (quei librettini dove sfogliando veloce sembra che i disegni si muovano)!

**Esempio di camminata:**
```
Frame 1: 🚶  piede sinistro avanti
Frame 2: 🚶‍♂️ entrambi i piedi a terra
Frame 3: 🚶  piede destro avanti
Frame 4: 🚶‍♂️ entrambi i piedi a terra
```

Il gioco mostra questi disegni uno dopo l'altro **velocissimo** → sembra che il personaggio cammini davvero!

---

## 📦 I 2 file di ogni personaggio

Ogni filosofo ha 2 file nella sua cartella:

### 1. **atlas.png** - La "pellicola fotografica"
Un'immagine gigante con TUTTE le pose del personaggio!

**Esempio di atlas.png di Socrate:**
```
+----------+----------+----------+
| Socrate  | Socrate  | Socrate  | ← Cammina indietro
| indietro | indietro | indietro |
| frame 1  | frame 2  | frame 3  |
+----------+----------+----------+
| Socrate  | Socrate  | Socrate  | ← Cammina a sinistra
| sinistra | sinistra | sinistra |
| frame 1  | frame 2  | frame 3  |
+----------+----------+----------+
| Socrate  | Socrate  | Socrate  | ← Cammina davanti
| davanti  | davanti  | davanti  |
| frame 1  | frame 2  | frame 3  |
+----------+----------+----------+
```

L'atlas di Socrate è **832 pixel larghi × 3456 pixel alti**!
Dentro ci sono circa **200 disegni diversi**!

### 2. **atlas.json** - La "mappa del tesoro"
Un file che dice al gioco **dove trovare** ogni disegno nell'atlas.png!

**Esempio:**
```json
{
  "socrates-front-walk-0000": {
    "frame": {"x": 17, "y": 655, "w": 30, "h": 47}
  }
}
```

**Tradotto in italiano:**
- "Socrate che cammina verso di te, frame 1"
- Si trova alla posizione x=17, y=655
- È largo 30 pixel e alto 47 pixel

---

## 🎯 Le 4 direzioni

Ogni personaggio ha animazioni per 4 direzioni:

1. **front** - Cammina verso di te (⬇️)
2. **back** - Cammina lontano da te (⬆️)
3. **left** - Cammina verso sinistra (⬅️)
4. **right** - Cammina verso destra (➡️)

Ogni direzione ha **8-9 frame** per fare l'animazione fluida!

---

## 🔍 Come il gioco usa questi file

### Passo 1: Caricamento
```javascript
// Il gioco carica i 2 file
this.load.atlas("socrates",
  "characters/socrates/atlas.png",     // L'immagine
  "characters/socrates/atlas.json"     // Le coordinate
);
```

### Passo 2: Quando premi ⬆️ (su)
1. Il gioco sa: "Devo far camminare Socrate verso l'alto"
2. Cerca nel JSON: "socrates-back-walk"
3. Trova 9 frame: 0000, 0001, 0002... 0008
4. Mostra velocemente i frame uno dopo l'altro

### Passo 3: Animazione!
```
Frame 0 (0.1 secondi) → Frame 1 (0.1 secondi) → Frame 2...
```

Il cervello vede: "Socrate sta camminando!" 🧠✨

---

## 🎨 Anatomia di un nome nel JSON

I nomi nel file JSON seguono uno **schema preciso**:

```
socrates-front-walk-0003
   ↓       ↓      ↓     ↓
personaggio direzione azione numero_frame
```

**Altri esempi:**
- `socrates-left` = Socrate fermo guardando a sinistra
- `socrates-right-walk-0005` = Socrate che cammina a destra, frame 5
- `plato-front-walk-0000` = Platone che cammina verso di te, primo frame

---

## 🧪 Cosa succede dietro le quinte?

### Quando premi il tasto ➡️ (destra):

1. **Il tuo dito preme il tasto**
   ```
   Tasto ➡️ premuto!
   ```

2. **Il gioco lo capisce**
   ```javascript
   if (tasto_destra_premuto) {
     personaggio.cammina_a_destra();
   }
   ```

3. **Cerca l'animazione giusta**
   ```
   "Devo mostrare: socrates-right-walk"
   ```

4. **Legge il JSON**
   ```json
   "socrates-right-walk-0000": {
     "frame": {"x": 21, "y": 719, "w": 20, "h": 47}
   }
   ```

5. **Ritaglia il pezzo dall'atlas.png**
   ```
   Prendi dall'immagine:
   - Partendo dal punto x=21, y=719
   - Un rettangolo di 20×47 pixel
   ```

6. **Lo disegna sullo schermo**
   ```
   Ecco Socrate che cammina! 🚶‍♂️
   ```

7. **Ripete con il frame successivo**
   ```
   Dopo 0.1 secondi → mostra frame 0001
   Dopo 0.1 secondi → mostra frame 0002
   ... e così via!
   ```

---

## 🛠️ Software per creare personaggi

Ci sono programmi speciali per creare questi atlas:

### 1. **Aseprite** (il più usato)
- Permette di disegnare pixel art
- Crei ogni frame dell'animazione
- Esporta automaticamente atlas.png + atlas.json

### 2. **Texture Packer**
- Prendi tanti disegni separati
- Lui li mette tutti insieme in un atlas
- Crea il JSON per te

### 3. **Photoshop o GIMP**
- Puoi creare l'atlas "a mano"
- Poi devi scrivere il JSON da solo (faticoso!)

---

## 📐 Dimensioni e numeri

### Un personaggio tipico:
- **Altezza**: 46-48 pixel (circa 1.5 tile)
- **Larghezza**: 20-30 pixel (meno di 1 tile)
- **Frame per animazione**: 8-9 frame
- **Direzioni**: 4 (su, giù, sinistra, destra)
- **Totale frame**: circa 32-36 frame (4 direzioni × 8 frame)

### L'atlas di Socrate:
- **Dimensione**: 832 × 3456 pixel
- **Frame totali**: ~200 (include anche altre pose speciali!)
- **Memoria**: circa 250 KB

---

## 🎮 Mini-esercizio: Leggi il JSON!

Apri il file `socrates/atlas.json` e cerca:

### Esercizio 1: Trova la camminata frontale
Cerca: `"socrates-front-walk"`
Quanti frame ci sono? (Conta da 0000 a 0008 = 9 frame!)

### Esercizio 2: Confronta le dimensioni
Guarda:
- `socrates-left-walk-0000` → width: ??? height: ???
- `socrates-front-walk-0000` → width: ??? height: ???

Quale è più largo? (Quello frontale! Perché le spalle si vedono di più)

### Esercizio 3: Trova Socrate fermo
Cerca: `"socrates-front"`  (senza "-walk")
Questo è Socrate che sta fermo guardando verso di te!

---

## 💡 Trucchi e curiosità

### Perché l'atlas è così grande?
Per avere **animazioni fluide**! Più frame = movimento più realistico.

### Perché non un video?
Un video sarebbe troppo pesante! Con un atlas:
- ✅ File piccolo
- ✅ Controllo totale su ogni frame
- ✅ Puoi mixare animazioni diverse

### Il trucco del "mirror"
Spesso destra e sinistra sono **la stessa immagine specchiata**!
Il gioco fa: "flip orizzontale" → risparmio di spazio!

### FPS dell'animazione
FPS = Frame Per Secondo
- Camminata: circa 8-12 FPS
- Gioco intero: 60 FPS

---

## 🎨 Crea il tuo personaggio!

### Passo 1: Disegna i frame
Usando Aseprite o carta e matita:
- Frame 1: piede sinistro avanti
- Frame 2: piedi uniti
- Frame 3: piede destro avanti
- Ripeti per le 4 direzioni

### Passo 2: Organizza l'atlas
Metti tutti i disegni in una griglia:
```
[Front1][Front2][Front3]
[Back1 ][Back2 ][Back3 ]
[Left1 ][Left2 ][Left3 ]
[Right1][Right2][Right3]
```

### Passo 3: Crea il JSON
Per ogni frame scrivi:
```json
"nome-frame": {
  "frame": {
    "x": posizione_x,
    "y": posizione_y,
    "w": larghezza,
    "h": altezza
  }
}
```

---

## 🎓 Parole da ricordare

- **Atlas** = Immagine grande con tutti i frame
- **Frame** = Un singolo disegno dell'animazione
- **Sprite** = Un personaggio o oggetto nel gioco
- **Animation** = Sequenza di frame mostrati velocemente
- **JSON** = File con le coordinate dei frame
- **FPS** = Frame Per Secondo (velocità dell'animazione)

---

## 🚀 Challenge finale!

1. Apri `socrates/atlas.png` in un visualizzatore di immagini
2. Fai zoom e cerca di vedere i singoli frame
3. Apri `socrates/atlas.json` in un editor di testo
4. Trova le coordinate di `socrates-front`
5. Nell'immagine, vai alla posizione x e y che hai trovato
6. Vedi Socrate? 🎉

**Bonus:** Confronta l'atlas di Socrate con quello di Platone!
Sono diversi? Come?

---

**Buon divertimento! 🎭**

*Ricorda: anche i grandi videogiochi come Super Mario usano questo sistema!*
