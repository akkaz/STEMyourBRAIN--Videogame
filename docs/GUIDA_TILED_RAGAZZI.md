# 🗺️ Guida Tiled Map Editor per Ragazzi

## Cos'è Tiled?

Tiled è un programma per creare **mappe** per i videogiochi! È come un enorme foglio a quadretti dove puoi disegnare il mondo del gioco usando dei "mattoncini" (chiamati **tiles**).

---

## 🎮 Come funziona il nostro gioco

Nel gioco dei filosofi, la mappa è il mondo dove camminano i personaggi. È fatta tutta di **quadratini** da 32x32 pixel (un pixel è un puntino sullo schermo).

### I 3 ingredienti di una mappa

1. **📄 File JSON** - Il "cervello" della mappa (es: `philoagents-winter.json`)
2. **🎨 Sprite Sheet** - I fogli con tutti i disegni (es: `tuxmon-sample-32px-extruded.png`)
3. **🛠️ Tiled** - Il programma per metterli insieme

---

## 🧩 Cosa sono le Sprite Sheet?

Immagina un foglio di adesivi: invece di avere un adesivo alla volta, ne hai tantissimi tutti insieme su un foglio!

**Esempio:**
```
+-------+-------+-------+
| erba  | neve  | sabbia|
+-------+-------+-------+
| muro  | porta | albero|
+-------+-------+-------+
```

Nel nostro gioco usiamo 3 sprite sheet:
- **tuxmon** - neve, sentieri, terreno
- **ancient_greece** - edifici e decorazioni greche
- **plant** - alberi e piante

---

## 🔢 Il segreto dei numeri

Ogni quadratino ha un **numero ID**. Il gioco usa questi numeri per sapere cosa disegnare!

### Come funziona:

1. **Tile 126** = Terreno innevato
2. **Tile 174** = Centro di un sentiero
3. **Tile 1121** = Cima di un albero

**Esempio pratico:**
```
La mappa dice: [126, 126, 174, 126, 126]
Il gioco disegna: ❄️ ❄️ 🛤️ ❄️ ❄️
```

---

## 📝 Il File JSON - Cosa c'è dentro?

Il file JSON è come una ricetta per il gioco. Contiene:

### 1. Le dimensioni della mappa
```json
"width": 160,
"height": 160
```
Significa: 160 quadratini in orizzontale × 160 in verticale = 25.600 quadratini!

### 2. I collegamenti alle sprite sheet
```json
"tilesets": [
  {
    "name": "tuxmon-sample-32px-extruded",
    "image": "../tilesets/tuxmon-sample-32px-extruded.png",
    "firstgid": 1
  }
]
```

**Cosa significa?**
- `name`: il nome che diamo a questo foglio di adesivi
- `image`: dove trovare il file con i disegni
- `firstgid`: da quale numero partono gli ID di questo foglio

### 3. I layer (livelli)
Come i fogli da lucido uno sopra l'altro:
- **Layer 1** - Il terreno di base (neve, erba)
- **Layer 2** - Gli oggetti sopra (alberi, case)
- **Layer 3** - Cose speciali (ombre, effetti)

---

## ✏️ Come usare Tiled

### Passo 1: Aprire la mappa
1. Lancia Tiled
2. File → Apri
3. Scegli `philoagents-winter.json`

**Magia!** 🎩✨ Tiled legge il JSON e carica automaticamente tutte le sprite sheet!

### Passo 2: Scegliere il pennello
Sulla destra vedi tutte le sprite sheet. Clicca su un quadratino per selezionarlo come "pennello".

### Passo 3: Disegnare
Clicca sulla mappa per mettere il tile che hai scelto!

### Passo 4: Salvare
File → Salva

**Importante:** Salva sempre come JSON! Il gioco legge solo quello.

---

## 🎯 Esempi pratici

### Esempio 1: Creare un sentiero

I sentieri hanno 9 pezzi diversi:
```
+-----+-----+-----+
| 149 | 150 | 151 |  ← Angolo alto-sx, sopra, angolo alto-dx
+-----+-----+-----+
| 173 | 174 | 175 |  ← Bordo sx, centro, bordo dx
+-----+-----+-----+
| 197 | 198 | 199 |  ← Angolo basso-sx, sotto, angolo basso-dx
+-----+-----+-----+
```

### Esempio 2: Mettere un albero

Un albero è fatto di 2 tile:
- **1121** - La cima con le foglie
- **1134** - Il tronco sotto

**Trucco:** Metti prima il tile 1134 (tronco) e poi sopra il 1121 (foglie)!

---

## 🧪 Cosa succede dietro le quinte?

### Quando modifichi in Tiled:
1. Clicchi su un quadratino della mappa → posizione (x=5, y=10)
2. Scegli un tile (es: albero = 1121)
3. Tiled scrive nel JSON: "Alla posizione 5,10 metti il tile 1121"

### Quando il gioco parte:
1. Legge il JSON: "Alla posizione 5,10 c'è il tile 1121"
2. Guarda nel tileset plant: "1121 è nella sprite sheet plant.png"
3. Trova il quadratino giusto nell'immagine
4. Lo disegna sullo schermo!

---

## 🔍 Mini-esercizio: Trova il tile!

Guarda il file JSON e cerca questa parte:
```json
"data": [126, 126, 174, 126, ...]
```

Questi numeri sono la mappa!
- Quanti 126 vedi? → Tanti quadrati di neve!
- Vedi qualche 174? → È un pezzo di sentiero!

---

## 💡 Consigli PRO

1. **Usa i layer**: Metti il terreno nel Layer 1, gli oggetti nel Layer 2
2. **Ctrl+Z è tuo amico**: Annulla gli errori!
3. **Zoom**: Rotellina del mouse per vedere meglio
4. **Griglia**: Aiuta a capire dove sono i quadratini
5. **Sperimenta**: Non aver paura di provare, puoi sempre annullare!

---

## 🎓 Parole da ricordare

- **Tile** = Un quadratino di 32x32 pixel
- **Tileset** = Una sprite sheet con tanti tile
- **Layer** = Un livello della mappa (come i fogli da lucido)
- **JSON** = Il file che contiene tutte le informazioni
- **firstgid** = Il primo numero ID di un tileset

---

## 🚀 Challenge finale!

Prova a:
1. Aprire la mappa in Tiled
2. Trovare il tile della neve (126)
3. Trovare il tile del sentiero (174)
4. Creare un piccolo sentiero di 3x3 quadratini
5. Mettere un albero accanto al sentiero
6. Salvare la mappa
7. Far partire il gioco e vedere la tua creazione!

---

**Buon divertimento! 🎮**

*Ricorda: ogni grande creatore di videogiochi ha iniziato mettendo insieme dei quadratini!*
