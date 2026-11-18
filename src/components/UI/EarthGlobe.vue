<!-- app/components/UI/EarthGlobe.vue -->
<!--
  Mappa 3D del pianeta Terra (three.js).
  Texture: Natural Earth — Cross-blended Hypsometric Tints con rilievo
  ombreggiato, fiumi e laghi 1:50m (pubblico dominio).
  https://www.naturalearthdata.com/
-->
<template>
  <div
    ref="overlay"
    class="globe-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Mappa 3D del pianeta Terra"
    tabindex="-1"
  >
    <!-- Canvas WebGL -->
    <div ref="host" class="globe-stage"></div>

    <!-- Barra superiore -->
    <div class="globe-topbar">
      <div class="globe-brand">
        <span class="globe-brand-icon">
          <Earth class="globe-brand-svg" />
        </span>
        <div class="globe-brand-text">
          <h2 class="globe-title">Mappa fisica della Terra</h2>
          <p class="globe-sub">
            Rilievo e colori altimetrici ·
            <a
              href="https://www.naturalearthdata.com/"
              target="_blank"
              rel="noopener noreferrer"
              class="globe-credit-link"
              >Natural Earth</a
            >
          </p>
        </div>
      </div>

      <button
        ref="closeBtn"
        class="globe-close"
        type="button"
        title="Chiudi la mappa (Esc)"
        aria-label="Chiudi la mappa della Terra"
        @click="emit('close')"
      >
        <X class="globe-close-icon" />
      </button>
    </div>

    <!-- Caricamento / errore -->
    <Transition name="globe-fade">
      <div v-if="loading" class="globe-status" aria-live="polite">
        <span class="globe-spinner" aria-hidden="true"></span>
        <p>Caricamento del planisfero…</p>
      </div>
    </Transition>

    <div v-if="loadError" class="globe-status globe-status-error" role="alert">
      <p>
        Impossibile caricare la mappa della Terra.<br />
        Verifica che WebGL sia abilitato nel browser.
      </p>
      <button type="button" class="globe-retry" @click="retry">Riprova</button>
    </div>

    <!-- Suggerimento -->
    <div class="globe-hint">
      <span><b>Trascina</b> per ruotare</span>
      <span class="globe-hint-sep">·</span>
      <span><b>Shift</b> + trascina per l'asse</span>
      <span class="globe-hint-sep">·</span>
      <span><b>Rotella</b> per lo zoom</span>
      <span class="globe-hint-sep">·</span>
      <span><b>Esc</b> per chiudere</span>
    </div>

    <!-- Controlli -->
    <div class="globe-controls">
      <!-- Inclinazione dell'asse terrestre -->
      <div
        class="tilt-pad"
        role="group"
        aria-label="Inclinazione dell'asse terrestre"
      >
        <div class="tilt-head">
          <span class="tilt-label">Asse</span>
          <span class="tilt-value" aria-hidden="true">{{ tiltDeg.toFixed(0) }}°</span>
        </div>
        <input
          class="tilt-range"
          type="range"
          min="-90"
          max="90"
          step="1"
          :value="tiltDeg"
          aria-label="Inclinazione dell'asse terrestre"
          title="Inclina l'asse terrestre (Shift + trascina sul globo)"
          @input="onTiltInput"
        />
      </div>

      <!-- Navigazione nelle quattro direzioni + reset -->
      <div class="nav-pad" role="group" aria-label="Navigazione della mappa">
        <button
          type="button"
          class="globe-ctrl ctrl-up"
          title="Sposta verso nord"
          aria-label="Sposta la mappa verso nord"
          @click="rotateUp"
        >
          <ChevronUp class="ctrl-icon" />
        </button>
        <button
          type="button"
          class="globe-ctrl ctrl-left"
          title="Sposta verso ovest"
          aria-label="Sposta la mappa verso ovest"
          @click="rotateLeft"
        >
          <ChevronLeft class="ctrl-icon" />
        </button>
        <button
          type="button"
          class="globe-ctrl ctrl-reset"
          title="Ripristina la vista iniziale"
          aria-label="Ripristina la vista iniziale"
          @click="resetView"
        >
          <RotateCcw class="ctrl-icon" />
        </button>
        <button
          type="button"
          class="globe-ctrl ctrl-right"
          title="Sposta verso est"
          aria-label="Sposta la mappa verso est"
          @click="rotateRight"
        >
          <ChevronRight class="ctrl-icon" />
        </button>
        <button
          type="button"
          class="globe-ctrl ctrl-down"
          title="Sposta verso sud"
          aria-label="Sposta la mappa verso sud"
          @click="rotateDown"
        >
          <ChevronDown class="ctrl-icon" />
        </button>
      </div>

      <!-- Zoom -->
      <div class="zoom-pad" role="group" aria-label="Zoom della mappa">
        <button
          type="button"
          class="globe-ctrl"
          title="Ingrandisci"
          aria-label="Ingrandisci la mappa"
          @click="zoomIn"
        >
          <Plus class="ctrl-icon" />
        </button>
        <span class="zoom-label" aria-hidden="true">zoom</span>
        <button
          type="button"
          class="globe-ctrl"
          title="Riduci"
          aria-label="Riduci la mappa"
          @click="zoomOut"
        >
          <Minus class="ctrl-icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import {
  Earth,
  X,
  Plus,
  Minus,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-vue-next'

const emit = defineEmits<{ (e: 'close'): void }>()

/* ------------------------------------------------------------------------- */
/* Stato UI                                                                   */
/* ------------------------------------------------------------------------- */
const overlay = ref<HTMLDivElement | null>(null)
const host = ref<HTMLDivElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)
const loading = ref(true)
const loadError = ref(false)

/* ------------------------------------------------------------------------- */
/* Stato three.js                                                             */
/* ------------------------------------------------------------------------- */
const BASE_DISTANCE = 3.35
const MIN_DISTANCE = 1.25
const MAX_DISTANCE = 6.2
const TILT = THREE.MathUtils.degToRad(23.44) // inclinazione iniziale dell'asse
const MAX_TILT = Math.PI / 2 // escursione massima dell'asse (0-90° per lato)
const MAX_PITCH = Math.PI / 2 // inclinazione verticale massima: consente di guardare i poli
const INITIAL_PITCH = -0.18
const DRAG_SENS = 0.0055
const AUTO_SPIN = 0.05 // rad/s

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let viewGroup: THREE.Group | null = null
let tiltGroup: THREE.Group | null = null
let spinGroup: THREE.Group | null = null
let stars: THREE.Points | null = null
let earthMaterial: THREE.MeshStandardMaterial | null = null

let raf = 0
let resizeObserver: ResizeObserver | null = null
let disposed = false
let reduceMotion = false
let prevFocus: HTMLElement | null = null

const resources: Array<{ dispose: () => void }> = []
const textures: THREE.Texture[] = []

// Rotazione: yaw attorno all'asse inclinato, pitch della vista.
let yaw = 0
let yawTarget = 0
let yawVelocity = 0
let pitch = INITIAL_PITCH
let pitchTarget = INITIAL_PITCH
let distance = BASE_DISTANCE
let distanceTarget = BASE_DISTANCE

// Inclinazione dell'asse: valore visualizzato dallo slider e valore animato.
const tiltDeg = ref(23.44)
let tilt = TILT
let tiltTarget = TILT

let dragging = false
let activePointer = -1
let lastPointerX = 0
let lastPointerY = 0
let lastInteraction = 0

/* ------------------------------------------------------------------------- */
/* Utility                                                                    */
/* ------------------------------------------------------------------------- */
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const markInteraction = () => {
  lastInteraction = performance.now()
  yawVelocity = 0
}

/**
 * Imposta l'inclinazione dell'asse terrestre (gradi).
 * Valori negativi inclinano il polo nord a sinistra, positivi a destra.
 */
function setTilt(degrees: number) {
  const value = clamp(degrees, -90, 90)
  tiltDeg.value = Math.round(value * 10) / 10
  tiltTarget = THREE.MathUtils.degToRad(value)
  markInteraction()
}

function onTiltInput(event: Event) {
  const input = event.target as HTMLInputElement
  setTilt(Number(input.value))
}

/* ------------------------------------------------------------------------- */
/* Inizializzazione scena                                                     */
/* ------------------------------------------------------------------------- */
function initThree() {
  if (!host.value) return

  const width = host.value.clientWidth || window.innerWidth
  const height = host.value.clientHeight || window.innerHeight

  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
  } catch (error) {
    console.error('[EarthGlobe] WebGL non disponibile:', error)
    loading.value = false
    loadError.value = true
    return
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.domElement.style.touchAction = 'none'
  host.value.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(42, width / Math.max(1, height), 0.05, 300)
  camera.position.set(0, 0, distance)
  camera.lookAt(0, 0, 0)

  // viewGroup: inclinazione della vista (pitch)
  // tiltGroup: asse terrestre inclinato di 23,44°
  // spinGroup: rotazione del globo attorno al proprio asse
  viewGroup = new THREE.Group()
  viewGroup.rotation.x = pitch
  scene.add(viewGroup)

  tiltGroup = new THREE.Group()
  tiltGroup.rotation.z = -tilt
  viewGroup.add(tiltGroup)

  spinGroup = new THREE.Group()
  spinGroup.rotation.y = yaw
  tiltGroup.add(spinGroup)

  // Globo
  const sphereGeometry = new THREE.SphereGeometry(1, 128, 96)
  resources.push(sphereGeometry)

  earthMaterial = new THREE.MeshStandardMaterial({
    color: 0x274666,
    roughness: 0.92,
    metalness: 0.02,
  })
  resources.push(earthMaterial)

  const earth = new THREE.Mesh(sphereGeometry, earthMaterial)
  earth.rotation.y = -Math.PI / 2 // meridiano di Greenwich verso la camera
  spinGroup.add(earth)

  // Meridiani e paralleli, solidali con la texture
  createGraticule(earth)

  // Atmosfera (bagliore blu sul bordo)
  const atmosphereGeometry = new THREE.SphereGeometry(1.13, 64, 48)
  const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
        gl_FragColor = vec4(0.30, 0.62, 1.0, 1.0) * intensity;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  })
  resources.push(atmosphereGeometry, atmosphereMaterial)

  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
  atmosphere.renderOrder = -1
  tiltGroup.add(atmosphere)

  // Asse terrestre e anello meridiano: rendono visibile l'inclinazione
  const axisGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -1.34, 0),
    new THREE.Vector3(0, 1.34, 0),
  ])
  const axisMaterial = new THREE.LineBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.32,
  })
  resources.push(axisGeometry, axisMaterial)
  tiltGroup.add(new THREE.Line(axisGeometry, axisMaterial))

  const ringGeometry = new THREE.TorusGeometry(1.31, 0.0035, 6, 256)
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.2,
  })
  resources.push(ringGeometry, ringMaterial)
  tiltGroup.add(new THREE.Mesh(ringGeometry, ringMaterial))

  const dotGeometry = new THREE.SphereGeometry(0.018, 12, 10)
  const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x7dd3fc })
  resources.push(dotGeometry, dotMaterial)
  for (const y of [-1.34, 1.34]) {
    const dot = new THREE.Mesh(dotGeometry, dotMaterial)
    dot.position.y = y
    tiltGroup.add(dot)
  }

  // Luci
  scene.add(new THREE.AmbientLight(0xdfe9ff, 0.72))

  const sun = new THREE.DirectionalLight(0xfff3df, 2.0)
  sun.position.set(-4, 2.4, 4.5)
  scene.add(sun)

  const fill = new THREE.DirectionalLight(0x5aa9ff, 0.55)
  fill.position.set(4, -1.5, -3)
  scene.add(fill)

  // Stelle
  createStars()

  // Eventi sul canvas
  const canvas = renderer.domElement
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerUp)
  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('dblclick', onDoubleClick)

  // Resize
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host.value)
  } else {
    window.addEventListener('resize', resize)
  }
  resize()
}

/* ------------------------------------------------------------------------- */
/* Graticola (meridiani e paralleli)                                          */
/* ------------------------------------------------------------------------- */
function createGraticule(parent: THREE.Object3D) {
  const radius = 1.0022
  const minor: number[] = []
  const major: number[] = []

  const toPoint = (latDeg: number, lonDeg: number) => {
    const lat = THREE.MathUtils.degToRad(latDeg)
    const lon = THREE.MathUtils.degToRad(lonDeg)
    const cosLat = Math.cos(lat)
    return [
      cosLat * Math.cos(lon) * radius,
      Math.sin(lat) * radius,
      -cosLat * Math.sin(lon) * radius,
    ]
  }

  const segment = (
    target: number[],
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    target.push(...toPoint(lat1, lon1), ...toPoint(lat2, lon2))
  }

  // Meridiani ogni 10°, più marcati ogni 30°
  for (let lon = -180; lon < 180; lon += 10) {
    const target = lon % 30 === 0 ? major : minor
    for (let lat = -80; lat < 80; lat += 2.5) {
      segment(target, lat, lon, lat + 2.5, lon)
    }
  }

  // Paralleli ogni 10°, più marcati ogni 30°
  for (let lat = -80; lat <= 80; lat += 10) {
    const target = lat % 30 === 0 ? major : minor
    for (let lon = -180; lon < 180; lon += 2.5) {
      segment(target, lat, lon, lat, lon + 2.5)
    }
  }

  const makeLines = (positions: number[], opacity: number) => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    )
    const material = new THREE.LineBasicMaterial({
      color: 0x0a2f4a,
      transparent: true,
      opacity,
      depthWrite: false,
      toneMapped: false,
    })
    resources.push(geometry, material)
    const lines = new THREE.LineSegments(geometry, material)
    lines.renderOrder = 1
    return lines
  }

  parent.add(makeLines(minor, 0.3), makeLines(major, 0.55))
}

function createStars() {
  if (!scene) return

  const count = 1500
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const color = new THREE.Color()

  for (let i = 0; i < count; i++) {
    const radius = 24 + Math.random() * 42
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.cos(phi)
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)

    // bianco caldo, azzurro o appena dorato
    const tone = Math.random()
    if (tone < 0.7) color.setRGB(1, 1, 1)
    else if (tone < 0.9) color.setRGB(0.68, 0.82, 1)
    else color.setRGB(1, 0.88, 0.68)

    const brightness = 0.45 + Math.random() * 0.55
    colors[i * 3] = color.r * brightness
    colors[i * 3 + 1] = color.g * brightness
    colors[i * 3 + 2] = color.b * brightness
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  // Sprite circolare morbido per le stelle
  const spriteCanvas = document.createElement('canvas')
  spriteCanvas.width = 32
  spriteCanvas.height = 32
  const ctx = spriteCanvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.45, 'rgba(255,255,255,0.75)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 32, 32)
  }
  const sprite = new THREE.CanvasTexture(spriteCanvas)
  sprite.colorSpace = THREE.SRGBColorSpace

  const material = new THREE.PointsMaterial({
    size: 0.2,
    map: sprite,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    depthWrite: false,
  })

  resources.push(geometry, material, sprite)
  stars = new THREE.Points(geometry, material)
  scene.add(stars)
}

/* ------------------------------------------------------------------------- */
/* Texture                                                                    */
/* ------------------------------------------------------------------------- */
async function loadTextures() {
  if (!earthMaterial || !renderer || disposed) return
  const loader = new THREE.TextureLoader()

  const apply = (texture: THREE.Texture) => {
    if (!earthMaterial || !renderer || disposed) {
      texture.dispose()
      return false
    }
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    earthMaterial.map = texture
    earthMaterial.color.set(0xffffff)
    earthMaterial.needsUpdate = true
    textures.push(texture)
    return true
  }

  try {
    const low = await loader.loadAsync('/globe/earth-topo-low.webp')
    if (!apply(low)) return
    loading.value = false
    // Fade-in del canvas quando la prima texture è pronta
    requestAnimationFrame(() => host.value?.classList.add('is-ready'))
  } catch (error) {
    console.error('[EarthGlobe] Texture non caricata:', error)
    if (!disposed) {
      loading.value = false
      loadError.value = true
    }
    return
  }

  // Upgrade alla texture ad alta risoluzione (senza bloccare l'interazione)
  try {
    const high = await loader.loadAsync('/globe/earth-topo.webp')
    if (!disposed) apply(high)
    else high.dispose()
  } catch {
    // La versione a bassa risoluzione resta utilizzabile
  }
}

function retry() {
  if (disposed || !renderer) return
  loadError.value = false
  loading.value = true
  host.value?.classList.remove('is-ready')
  loadTextures()
}

/* ------------------------------------------------------------------------- */
/* Interazione                                                               */
/* ------------------------------------------------------------------------- */
function onPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  dragging = true
  activePointer = event.pointerId
  lastPointerX = event.clientX
  lastPointerY = event.clientY
  yawVelocity = 0
  lastInteraction = performance.now()
  renderer?.domElement.setPointerCapture(event.pointerId)
  host.value?.classList.add('is-grabbing')
}

function onPointerMove(event: PointerEvent) {
  if (!dragging || event.pointerId !== activePointer) return

  const dx = event.clientX - lastPointerX
  const dy = event.clientY - lastPointerY
  lastPointerX = event.clientX
  lastPointerY = event.clientY

  if (event.shiftKey) {
    // Shift + trascinamento orizzontale: inclina l'asse terrestre
    setTilt(tiltDeg.value + dx * 0.25)
  } else {
    yawTarget += dx * DRAG_SENS
    yawVelocity = clamp(dx * 0.12, -4.5, 4.5)
    pitchTarget = clamp(pitchTarget - dy * 0.005, -MAX_PITCH, MAX_PITCH)
    lastInteraction = performance.now()
  }
}

function onPointerUp(event: PointerEvent) {
  if (event.pointerId !== activePointer) return
  dragging = false
  activePointer = -1
  lastInteraction = performance.now()
  if (renderer?.domElement.hasPointerCapture(event.pointerId)) {
    renderer.domElement.releasePointerCapture(event.pointerId)
  }
  host.value?.classList.remove('is-grabbing')
}

function onWheel(event: WheelEvent) {
  event.preventDefault()
  const direction = Math.sign(event.deltaY)
  if (direction !== 0) {
    distanceTarget = clamp(
      distanceTarget * (direction > 0 ? 1.12 : 0.89),
      MIN_DISTANCE,
      MAX_DISTANCE
    )
  }
  lastInteraction = performance.now()
  yawVelocity = 0
}

function onDoubleClick() {
  resetView()
}

function rotateLeft() {
  markInteraction()
  yawTarget += 0.32
}

function rotateRight() {
  markInteraction()
  yawTarget -= 0.32
}

function rotateUp() {
  markInteraction()
  pitchTarget = clamp(pitchTarget + 0.16, -MAX_PITCH, MAX_PITCH)
}

function rotateDown() {
  markInteraction()
  pitchTarget = clamp(pitchTarget - 0.16, -MAX_PITCH, MAX_PITCH)
}

function zoomIn() {
  markInteraction()
  distanceTarget = clamp(distanceTarget * 0.86, MIN_DISTANCE, MAX_DISTANCE)
}

function zoomOut() {
  markInteraction()
  distanceTarget = clamp(distanceTarget * 1.16, MIN_DISTANCE, MAX_DISTANCE)
}

function resetView() {
  markInteraction()
  tiltDeg.value = 23.44
  tiltTarget = TILT
  yawTarget = 0
  pitchTarget = INITIAL_PITCH
  distanceTarget = BASE_DISTANCE
}

/* ------------------------------------------------------------------------- */
/* Tastiera                                                                   */
/* ------------------------------------------------------------------------- */
function onKeydown(event: KeyboardEvent) {
  // Focus trap: il dialogo è a schermo intero e deve restare raggiungibile
  if (event.key === 'Tab' && overlay.value) {
    const focusables = Array.from(
      overlay.value.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    )
    if (focusables.length) {
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || active === overlay.value)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  // Se lo slider dell'asse ha il focus, lascia che i tasti freccia
  // regolino il controllo nativo invece di ruotare il globo.
  if (
    event.key !== 'Escape' &&
    event.target instanceof HTMLInputElement &&
    event.target.type === 'range'
  ) {
    return
  }

  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      emit('close')
      break
    case 'ArrowLeft':
      event.preventDefault()
      rotateLeft()
      break
    case 'ArrowRight':
      event.preventDefault()
      rotateRight()
      break
    case 'ArrowUp':
      event.preventDefault()
      rotateUp()
      break
    case 'ArrowDown':
      event.preventDefault()
      rotateDown()
      break
    case '+':
    case '=':
      event.preventDefault()
      zoomIn()
      break
    case '-':
    case '_':
      event.preventDefault()
      zoomOut()
      break
    case '0':
      event.preventDefault()
      resetView()
      break
  }
}

/* ------------------------------------------------------------------------- */
/* Resize                                                                     */
/* ------------------------------------------------------------------------- */
function resize() {
  if (!host.value || !renderer || !camera) return

  const width = host.value.clientWidth || window.innerWidth
  const height = host.value.clientHeight || window.innerHeight
  const aspect = width / Math.max(1, height)

  camera.aspect = aspect
  // Su schermi verticali allarga un po' il campo visivo per non tagliare il globo
  camera.fov = aspect < 0.9 ? 62 : aspect < 1.2 ? 52 : 42
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

/* ------------------------------------------------------------------------- */
/* Ciclo di rendering                                                         */
/* ------------------------------------------------------------------------- */
function animate() {
  if (disposed) return
  raf = requestAnimationFrame(animate)

  if (!renderer || !scene || !camera) return

  const dt = Math.min(clock.getDelta(), 0.06)
  const now = performance.now()

  // Rotazione automatica lenta quando l'utente non interagisce
  if (!reduceMotion && !dragging && now - lastInteraction > 4500) {
    yawTarget += AUTO_SPIN * dt
  }

  // Inerzia dopo il trascinamento
  if (!dragging) {
    yawTarget += yawVelocity * dt
    yawVelocity *= Math.exp(-dt * 3.2)
  }

  yaw += (yawTarget - yaw) * (1 - Math.exp(-dt * 14))
  pitch += (pitchTarget - pitch) * (1 - Math.exp(-dt * 12))
  distance += (distanceTarget - distance) * (1 - Math.exp(-dt * 9))
  tilt += (tiltTarget - tilt) * (1 - Math.exp(-dt * 10))

  if (spinGroup) spinGroup.rotation.y = yaw
  if (viewGroup) viewGroup.rotation.x = pitch
  if (tiltGroup) tiltGroup.rotation.z = -tilt
  if (stars) stars.rotation.y += dt * 0.004

  camera.position.z = distance
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

const clock = new THREE.Clock()

/* ------------------------------------------------------------------------- */
/* Ciclo di vita                                                              */
/* ------------------------------------------------------------------------- */
onMounted(async () => {
  prevFocus = document.activeElement as HTMLElement | null
  reduceMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  lastInteraction = performance.now()

  await nextTick()
  initThree()

  if (renderer) {
    loadTextures()
    animate()
  }

  window.addEventListener('keydown', onKeydown)
  overlay.value?.focus({ preventScroll: true })
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(raf)
  window.removeEventListener('keydown', onKeydown)
  resizeObserver?.disconnect()
  resizeObserver = null

  if (renderer) {
    const canvas = renderer.domElement
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('pointerup', onPointerUp)
    canvas.removeEventListener('pointercancel', onPointerUp)
    canvas.removeEventListener('wheel', onWheel)
    canvas.removeEventListener('dblclick', onDoubleClick)
    renderer.dispose()
    canvas.remove()
    renderer = null
  }

  for (const resource of resources) {
    try {
      resource.dispose()
    } catch {
      /* già liberato */
    }
  }
  resources.length = 0
  textures.length = 0

  scene = null
  camera = null
  viewGroup = null
  tiltGroup = null
  spinGroup = null
  stars = null
  earthMaterial = null

  // Ripristina il focus sull'elemento che aveva aperto la mappa
  if (prevFocus && document.contains(prevFocus)) {
    prevFocus.focus({ preventScroll: true })
  }
})
</script>

<style scoped>
/* ------------------------------------------------------------------------- */
/* Overlay                                                                    */
/* ------------------------------------------------------------------------- */
.globe-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  overflow: hidden;
  outline: none;
  background:
    radial-gradient(900px 600px at 18% 12%, rgba(56, 130, 246, 0.16), transparent 62%),
    radial-gradient(1100px 700px at 82% 88%, rgba(14, 116, 144, 0.14), transparent 60%),
    radial-gradient(1200px 900px at 50% 50%, #0a1220 0%, #05080f 55%, #02040a 100%);
  color: #e2e8f0;
  user-select: none;
  -webkit-user-select: none;
  animation: globeOverlayIn 0.35s ease-out;
}

.globe-overlay::after {
  /* vignettatura per concentrare l'attenzione sul globo */
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: radial-gradient(circle at 50% 50%, transparent 42%, rgba(0, 0, 0, 0.45) 100%);
}

.globe-stage {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.globe-stage :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
  opacity: 0;
  cursor: grab;
  transition: opacity 0.9s ease;
}

.globe-stage.is-ready :deep(canvas) {
  opacity: 1;
}

.globe-stage.is-grabbing :deep(canvas) {
  cursor: grabbing;
}

/* ------------------------------------------------------------------------- */
/* Barra superiore                                                            */
/* ------------------------------------------------------------------------- */
.globe-topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: clamp(1rem, 2.4vw, 1.9rem) clamp(1rem, 2.8vw, 2.4rem);
  background: linear-gradient(
    to bottom,
    rgba(2, 5, 11, 0.94) 0%,
    rgba(2, 5, 11, 0.72) 52%,
    rgba(2, 5, 11, 0) 100%
  );
  pointer-events: none;
}

.globe-topbar > * {
  pointer-events: auto;
}

.globe-brand {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
}

.globe-brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
  border-radius: 50%;
  color: #7dd3fc;
  background: radial-gradient(circle at 35% 30%, rgba(125, 211, 252, 0.28), rgba(125, 211, 252, 0.04));
  border: 1px solid rgba(125, 211, 252, 0.35);
  box-shadow: 0 0 28px rgba(56, 189, 248, 0.28), inset 0 0 18px rgba(56, 189, 248, 0.12);
}

.globe-brand-svg {
  width: 1.65rem;
  height: 1.65rem;
}

.globe-brand-text {
  min-width: 0;
}

.globe-title {
  margin: 0;
  font-family: 'Fredericka the Great', cursive;
  font-size: clamp(1.25rem, 2.2vw, 1.9rem);
  font-weight: normal;
  letter-spacing: 0.5px;
  line-height: 1.1;
  color: #ff8c00;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.85), 0 0 24px rgba(255, 140, 0, 0.35);
}

.globe-sub {
  margin: 0.22rem 0 0;
  font-family: 'Julee', cursive;
  font-size: 0.82rem;
  letter-spacing: 0.3px;
  color: #a8c7ea;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.95);
}

.globe-credit-link {
  color: #7dd3fc;
  text-decoration: none;
  border-bottom: 1px dotted rgba(125, 211, 252, 0.55);
}

.globe-credit-link:hover {
  color: #e0f2fe;
  border-bottom-color: #e0f2fe;
}

.globe-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.9rem;
  height: 2.9rem;
  flex-shrink: 0;
  border-radius: 50%;
  cursor: pointer;
  color: #dbeafe;
  background: rgba(9, 19, 34, 0.62);
  border: 1px solid rgba(125, 211, 252, 0.28);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: background-color 0.18s ease, color 0.18s ease, transform 0.25s ease;
}

.globe-close:hover {
  background: #7dd3fc;
  color: #04121f;
  transform: rotate(90deg);
}

.globe-close-icon {
  width: 1.35rem;
  height: 1.35rem;
}

/* ------------------------------------------------------------------------- */
/* Caricamento / errore                                                       */
/* ------------------------------------------------------------------------- */
.globe-status {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  pointer-events: none;
  font-family: 'Julee', cursive;
  font-size: 1rem;
  letter-spacing: 0.6px;
  color: #93c5fd;
}

.globe-status p {
  margin: 0;
  text-align: center;
  line-height: 1.6;
}

.globe-spinner {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 2px solid rgba(125, 211, 252, 0.16);
  border-top-color: #7dd3fc;
  animation: globeSpin 1s linear infinite;
}

.globe-status-error {
  pointer-events: auto;
  color: #fca5a5;
}

.globe-retry {
  padding: 0.55rem 1.4rem;
  border-radius: 999px;
  cursor: pointer;
  font-family: 'Julee', cursive;
  font-size: 0.95rem;
  color: #04121f;
  background: #7dd3fc;
  border: 1px solid #7dd3fc;
  transition: background-color 0.18s ease, transform 0.18s ease;
}

.globe-retry:hover {
  background: #e0f2fe;
  transform: translateY(-1px);
}

/* ------------------------------------------------------------------------- */
/* Suggerimento                                                               */
/* ------------------------------------------------------------------------- */
.globe-hint {
  position: absolute;
  left: clamp(1rem, 2.8vw, 2.4rem);
  bottom: clamp(1rem, 2.4vw, 1.9rem);
  z-index: 3;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  max-width: min(34rem, 64vw);
  padding: 0.55rem 1rem;
  border-radius: 999px;
  font-family: 'Julee', cursive;
  font-size: 0.78rem;
  letter-spacing: 0.35px;
  color: #8fb2d9;
  background: rgba(7, 14, 26, 0.55);
  border: 1px solid rgba(125, 211, 252, 0.14);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  pointer-events: none;
}

.globe-hint b {
  font-weight: normal;
  color: #cfe8ff;
}

.globe-hint-sep {
  color: rgba(125, 211, 252, 0.4);
}

/* ------------------------------------------------------------------------- */
/* Controlli                                                                  */
/* ------------------------------------------------------------------------- */
.globe-controls {
  position: absolute;
  right: clamp(1rem, 2.8vw, 2.4rem);
  bottom: clamp(1rem, 2.4vw, 1.9rem);
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

/* Inclinazione dell'asse terrestre */
.tilt-pad {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  width: 9.2rem;
  padding: 0.62rem 0.8rem 0.72rem;
  border-radius: 1.1rem;
  background: rgba(7, 14, 26, 0.62);
  border: 1px solid rgba(125, 211, 252, 0.18);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45), inset 0 0 30px rgba(56, 189, 248, 0.05);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.tilt-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.tilt-label {
  font-family: 'Julee', cursive;
  font-size: 0.64rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(125, 211, 252, 0.72);
}

.tilt-value {
  font-family: 'Julee', cursive;
  font-size: 0.82rem;
  line-height: 1;
  color: #cfe8ff;
  font-variant-numeric: tabular-nums;
}

.tilt-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  margin: 0;
  border-radius: 999px;
  cursor: pointer;
  background: linear-gradient(
    to right,
    rgba(125, 211, 252, 0.55),
    rgba(125, 211, 252, 0.18)
  );
}

.tilt-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #7dd3fc;
  border: 1px solid #e0f2fe;
  box-shadow: 0 0 10px rgba(125, 211, 252, 0.55);
  cursor: grab;
}

.tilt-range::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #7dd3fc;
  border: 1px solid #e0f2fe;
  box-shadow: 0 0 10px rgba(125, 211, 252, 0.55);
  cursor: grab;
}

.tilt-range:focus-visible {
  outline: 2px solid #7dd3fc;
  outline-offset: 3px;
}

.nav-pad {
  display: grid;
  grid-template-columns: repeat(3, 2.9rem);
  grid-template-rows: repeat(3, 2.9rem);
  gap: 0.28rem;
  padding: 0.55rem;
  border-radius: 1.35rem;
  background: rgba(7, 14, 26, 0.62);
  border: 1px solid rgba(125, 211, 252, 0.18);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45), inset 0 0 30px rgba(56, 189, 248, 0.05);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.zoom-pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.55rem;
  border-radius: 1.1rem;
  background: rgba(7, 14, 26, 0.62);
  border: 1px solid rgba(125, 211, 252, 0.18);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45), inset 0 0 30px rgba(56, 189, 248, 0.05);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.zoom-label {
  font-family: 'Julee', cursive;
  font-size: 0.62rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(125, 211, 252, 0.65);
  line-height: 1;
}

.globe-ctrl {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.9rem;
  height: 2.9rem;
  padding: 0;
  border-radius: 0.7rem;
  cursor: pointer;
  color: #dbeafe;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(125, 211, 252, 0.16);
  transition: background-color 0.16s ease, color 0.16s ease, border-color 0.16s ease,
    transform 0.16s ease;
}

.globe-ctrl:hover {
  background: #7dd3fc;
  color: #04121f;
  border-color: #7dd3fc;
  transform: translateY(-1px);
}

.globe-ctrl:active {
  transform: scale(0.95);
}

.globe-ctrl:focus-visible,
.globe-close:focus-visible,
.globe-retry:focus-visible {
  outline: 2px solid #7dd3fc;
  outline-offset: 2px;
}

.ctrl-icon {
  width: 1.3rem;
  height: 1.3rem;
}

.ctrl-up {
  grid-area: 1 / 2;
}
.ctrl-left {
  grid-area: 2 / 1;
}
.ctrl-reset {
  grid-area: 2 / 2;
  color: #7dd3fc;
  background: rgba(125, 211, 252, 0.1);
  border-color: rgba(125, 211, 252, 0.28);
}
.ctrl-right {
  grid-area: 2 / 3;
}
.ctrl-down {
  grid-area: 3 / 2;
}

/* ------------------------------------------------------------------------- */
/* Animazioni                                                                 */
/* ------------------------------------------------------------------------- */
@keyframes globeSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes globeOverlayIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.globe-fade-leave-active {
  transition: opacity 0.4s ease;
}

.globe-fade-leave-to {
  opacity: 0;
}

/* ------------------------------------------------------------------------- */
/* Responsive                                                                 */
/* ------------------------------------------------------------------------- */
@media (max-width: 900px) {
  .globe-brand-icon {
    width: 2.6rem;
    height: 2.6rem;
  }

  .globe-sub {
    font-size: 0.74rem;
  }

  .tilt-pad {
    width: 8rem;
    padding: 0.55rem 0.65rem 0.62rem;
  }

  .nav-pad {
    grid-template-columns: repeat(3, 2.55rem);
    grid-template-rows: repeat(3, 2.55rem);
  }

  .globe-ctrl {
    width: 2.55rem;
    height: 2.55rem;
  }

  .globe-hint {
    display: none;
  }
}

@media (max-width: 640px) {
  .globe-brand-icon {
    display: none;
  }

  .globe-title {
    font-size: 1.1rem;
  }

  .globe-controls {
    gap: 0.5rem;
  }

  .tilt-pad {
    width: 6.8rem;
    padding: 0.45rem 0.55rem 0.5rem;
  }

  .tilt-label {
    font-size: 0.58rem;
    letter-spacing: 1px;
  }

  .tilt-value {
    font-size: 0.72rem;
  }

  .nav-pad {
    grid-template-columns: repeat(3, 2.35rem);
    grid-template-rows: repeat(3, 2.35rem);
    gap: 0.2rem;
    padding: 0.45rem;
  }

  .globe-ctrl {
    width: 2.35rem;
    height: 2.35rem;
  }

  .zoom-pad {
    padding: 0.45rem;
  }
}

/* ------------------------------------------------------------------------- */
/* Movimento ridotto                                                          */
/* ------------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .globe-overlay,
  .globe-close,
  .globe-ctrl,
  .globe-retry {
    animation: none !important;
    transition: none !important;
  }

  .globe-spinner {
    animation-duration: 2.4s !important;
  }
}
</style>
