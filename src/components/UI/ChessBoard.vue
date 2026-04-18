<template>
  <div class="chess-container">
    <div class="chess-board-wrapper">
      <div class="chess-board" :key="chessFlipped ? 'flipped' : 'normal'">
        <div v-for="(row, rIndex) in displayBoard" :key="`row-${rIndex}-${chessFlipped}`" class="row">
          <div 
            v-for="(square, cIndex) in row" 
            :key="`square-${rIndex}-${cIndex}-${chessFlipped}`" 
            :class="['square', (rIndex + cIndex) % 2 === 0 ? 'light' : 'dark']"
          >
            <ChessPiece
              v-if="square"
              :type="square.type"
              :color="square.color"
              class="piece"
            />
            
            <!-- Coordinate: lettere (a-h) sul bordo inferiore -->
            <span v-if="rIndex === 7" class="coord coord-file">
              {{ chessFlipped ? String.fromCharCode(104 - cIndex) : String.fromCharCode(97 + cIndex) }}
            </span>
            
            <!-- Coordinate: numeri (1-8) sul bordo sinistro -->
            <span v-if="cIndex === 0" class="coord coord-rank">
              {{ chessFlipped ? 1 + rIndex : 8 - rIndex }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Layer SVG per le frecce -->
      <svg class="arrows-layer" viewBox="0 0 800 800">
        <defs>
          <!-- Marker per freccia blu (mossa) -->
          <marker id="arrowhead-blue" markerWidth="10" markerHeight="10" 
                  refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#2196F3" />
          </marker>
          <!-- Marker per freccia rossa (attacco) -->
          <marker id="arrowhead-red" markerWidth="10" markerHeight="10" 
                  refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#f44336" />
          </marker>
        </defs>
        
        <!-- Freccia blu della mossa corrente -->
        <path 
          v-if="currentMove" 
          :d="currentMove.path" 
          class="arrow arrow-move"
          marker-end="url(#arrowhead-blue)"
        />
        
        <!-- Frecce rosse per i pezzi attaccati -->
        <path 
          v-for="(attack, index) in attackArrows" 
          :key="index"
          :d="attack.path" 
          class="arrow arrow-attack"
          marker-end="url(#arrowhead-red)"
        />
      </svg>
    </div>
  </div>  
</template>
    
<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { Chess } from 'chess.js'
import { usePageStore } from '../../store/page'
// Rimosso storeToRefs di Pinia
import ChessPiece from './ChessPiece.vue'

interface Move {
  san: string
  from: string
  to: string
  captured?: string
}

const props = defineProps<{
  pgn?: string
}>()

const page = usePageStore()
const { chessFlipped } = page // In Vue 3 script setup con refs esportate, questo funziona se le refs sono reattive
const chess = new Chess()
const board = ref(chess.board())
const history = ref<Move[]>([])
const currentMoveIndex = ref(0) // 0 means start position

// Parse Italian notation to Standard English (Algebraic)
// Re T D A C -> K Q R B N
const italianToEnglish = (pgn: string): string => {
  if (!pgn) return ''

  const map: Record<'T' | 'C' | 'A' | 'D' | 'R', string> = {
    T: 'R', // Torre
    C: 'N', // Cavallo
    A: 'B', // Alfiere
    D: 'Q', // Donna
    R: 'K'  // Re
  }

  return pgn.replace(/[TCADR]/g, (match) => map[match as keyof typeof map])
}


// Update store with move info
const syncStore = () => {
    page.chessCurrentMove = currentMoveIndex.value
    page.chessTotalMoves = history.value.length
}

const loadGame = () => {
    chess.reset()
    const cleanPgn = italianToEnglish(props.pgn || '')
    
    try {
        chess.loadPgn(cleanPgn)
        // Store full history
        history.value = chess.history({ verbose: true }) as {san: string, from: string, to: string}[]
        
        // Reset to start
        chess.reset()
        board.value = chess.board()
        currentMoveIndex.value = 0
        syncStore()
    } catch(e) {
        console.error("Invalid PGN", e)
    }
}

const updateBoard = () => {
    chess.reset()
    for (let i = 0; i < currentMoveIndex.value; i++) {
        const move = history.value[i]
        if (move) {
            chess.move(move.san)
        }
    }
    board.value = chess.board()
    syncStore()
}

const displayBoard = computed(() => {
  if (chessFlipped.value) {
    return [...board.value].reverse().map(row => [...row].reverse())
  }
  return board.value
})

const next = () => {
    if (currentMoveIndex.value < history.value.length) {
        currentMoveIndex.value++
        updateBoard()
    }
}

const prev = () => {
    if (currentMoveIndex.value > 0) {
        currentMoveIndex.value--
        updateBoard()
    }
}

const reset = () => {
    currentMoveIndex.value = 0
    updateBoard()
}

const end = () => {
    currentMoveIndex.value = history.value.length
    updateBoard()
}

// Watch navigation events from store
watch(() => page.chessMove, (newMove) => {
    if (!newMove) return
    
    switch(newMove) {
        case 'prev': prev(); break;
        case 'next': next(); break;
        case 'start': reset(); break;
        case 'end': end(); break;
    }
    
    // Reset state to allow repeated clicks
    page.setChessMove(null)
})

// Converti notazione algebrica (es. 'e4') in coordinate pixel SVG
const squareToCoords = (square: string): { x: number, y: number } => {
  let file = square.charCodeAt(0) - 'a'.charCodeAt(0) // 0-7
  const rankChar = square[1]
  let rank = rankChar ? 8 - parseInt(rankChar) : 0 // 0-7 (invertito perché la board parte dall'alto)
  
  if (chessFlipped.value) {
    file = 7 - file
    rank = 7 - rank
  }

  // Centro della casella (ogni casella è 100x100 in viewBox 800x800)
  return {
    x: file * 100 + 50,
    y: rank * 100 + 50
  }
}

// Crea il path SVG per una freccia dritta da una casella all'altra
const createArrowPath = (from: string, to: string): string => {
  const start = squareToCoords(from)
  const end = squareToCoords(to)
  
  // Calcola angolo e distanza
  const dx = end.x - start.x
  const dy = end.y - start.y
  const angle = Math.atan2(dy, dx)
  
  // Accorcia la freccia per non sovrapporsi ai pezzi
  const shortenStart = 15
  const shortenEnd = 25
  const startX = start.x + Math.cos(angle) * shortenStart
  const startY = start.y + Math.sin(angle) * shortenStart
  const endX = end.x - Math.cos(angle) * shortenEnd
  const endY = end.y - Math.sin(angle) * shortenEnd
  
  // Linea dritta
  return `M ${startX} ${startY} L ${endX} ${endY}`
}

// Ottieni le caselle attaccate da una posizione
const getAttackedSquares = (fromSquare: string): string[] => {
  // Ottieni il pezzo nella casella
  const piece = chess.get(fromSquare as any)
  if (!piece) {
    console.log('No piece at', fromSquare)
    return []
  }
  
  const file = fromSquare.charCodeAt(0) - 'a'.charCodeAt(0) // 0-7
  const rankChar = fromSquare[1]
  const rank = rankChar ? parseInt(rankChar) - 1 : 0 // 0-7
  
  const attackedSquares: string[] = []
  
  // Converti coordinate numeriche in notazione algebrica
  const coordsToSquare = (f: number, r: number): string | null => {
    if (f < 0 || f > 7 || r < 0 || r > 7) return null
    return String.fromCharCode('a'.charCodeAt(0) + f) + (r + 1)
  }
  
  // Controlla se una casella contiene un pezzo nemico
  const hasEnemyPiece = (square: string): boolean => {
    const targetPiece = chess.get(square as any)
    return !!targetPiece && targetPiece.color !== piece.color
  }
  
  // Funzione per scansionare in una direzione (per torre, alfiere, donna)
  const scanDirection = (df: number, dr: number) => {
    let f = file + df
    let r = rank + dr
    while (f >= 0 && f <= 7 && r >= 0 && r <= 7) {
      const square = coordsToSquare(f, r)
      if (square) {
        const targetPiece = chess.get(square as any)
        if (targetPiece) {
          // Se c'è un pezzo, controlla se è nemico
          if (targetPiece.color !== piece.color) {
            attackedSquares.push(square)
          }
          break // Fermati dopo aver trovato un pezzo
        }
      }
      f += df
      r += dr
    }
  }
  
  // Calcola gli attacchi in base al tipo di pezzo
  switch (piece.type) {
    case 'p': // Pedone
      // I pedoni attaccano in diagonale
      const direction = piece.color === 'w' ? 1 : -1
      for (const df of [-1, 1]) {
        const square = coordsToSquare(file + df, rank + direction)
        if (square && hasEnemyPiece(square)) {
          attackedSquares.push(square)
        }
      }
      break
      
    case 'n': // Cavallo
      const knightMoves: [number, number][] = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ]
      for (const [df, dr] of knightMoves) {
        const square = coordsToSquare(file + df, rank + dr)
        if (square && hasEnemyPiece(square)) {
          attackedSquares.push(square)
        }
      }
      break
      
    case 'b': // Alfiere
      // Diagonali
      scanDirection(1, 1)
      scanDirection(1, -1)
      scanDirection(-1, 1)
      scanDirection(-1, -1)
      break
      
    case 'r': // Torre
      // Orizzontali e verticali
      scanDirection(1, 0)
      scanDirection(-1, 0)
      scanDirection(0, 1)
      scanDirection(0, -1)
      break
      
    case 'q': // Donna (torre + alfiere)
      scanDirection(1, 0)
      scanDirection(-1, 0)
      scanDirection(0, 1)
      scanDirection(0, -1)
      scanDirection(1, 1)
      scanDirection(1, -1)
      scanDirection(-1, 1)
      scanDirection(-1, -1)
      break
      
    case 'k': // Re
      for (let df = -1; df <= 1; df++) {
        for (let dr = -1; dr <= 1; dr++) {
          if (df === 0 && dr === 0) continue
          const square = coordsToSquare(file + df, rank + dr)
          if (square && hasEnemyPiece(square)) {
            attackedSquares.push(square)
          }
        }
      }
      break
  }
  
  console.log('Piece at', fromSquare, 'type:', piece.type, 'attacks:', attackedSquares)
  
  return attackedSquares
}

// Computed per la freccia della mossa corrente
const currentMove = computed(() => {
  if (currentMoveIndex.value === 0) return null
  
  const move = history.value[currentMoveIndex.value - 1]
  if (!move || !move.from || !move.to) return null
  
  return {
    from: move.from,
    to: move.to,
    path: createArrowPath(move.from, move.to)
  }
})

// Computed per le frecce degli attacchi
const attackArrows = computed(() => {
  if (currentMoveIndex.value === 0 || !currentMove.value) return []
  
  const attackedSquares = getAttackedSquares(currentMove.value.to)
  
  console.log('Current move to:', currentMove.value.to, 'Attacked squares:', attackedSquares)
  
  return attackedSquares.map(targetSquare => ({
    from: currentMove.value!.to,
    to: targetSquare,
    path: createArrowPath(currentMove.value!.to, targetSquare)
  }))
})

watch(() => props.pgn, () => {
    loadGame()
})

onMounted(() => {
    loadGame()
})

</script>

<style scoped>
.chess-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f0f0f0;
  border-radius: 8px;
  width: 100%;
  height: 100%;
  justify-content: center;
}

.chess-board-wrapper {
  position: relative;
  display: inline-block;
}

.chess-board {
  display: grid;
  grid-template-rows: repeat(8, 1fr);
  height: 75vh;
  width: auto;
  aspect-ratio: 1;
  max-width: 75vh;
  border: 5px solid #5d4037;
  position: relative;
}

.arrows-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.arrow {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  opacity: 0;
  animation: fadeIn 0.3s ease-in forwards;
}

.arrow-move {
  stroke: #2196F3;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.arrow-attack {
  stroke: #f44336;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

@keyframes fadeIn {
  to {
    opacity: 0.85;
  }
}

.row {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
}

.square {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.light {
  background-color: #f0d9b5;
}

.dark {
  background-color: #b58863;
}

.piece {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  height: 85%;
  display: block;
  pointer-events: none;
}

.coord {
  position: absolute;
  font-size: 1.1rem;
  font-weight: 800;
  user-select: none;
  pointer-events: none;
  color: #000;
  opacity: 0.8;
}

.coord-file {
  bottom: 1px;
  right: 3px;
}

.coord-rank {
  top: 1px;
  left: 3px;
}

.pgn-display {
    width: 100%;
    text-align: left;
    background: #fff;
    padding: 0.5rem;
    border-radius: 4px;
    font-family: monospace;
    max-height: 100px;
    overflow-y: auto;
}

.moves-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.move-number {
    color: #888;
}

.current-move {
    background-color: yellow;
    font-weight: bold;
    padding: 0 3px;
    border-radius: 2px;
}
</style>
