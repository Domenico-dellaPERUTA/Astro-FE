<!-- src/components/UI/AvatarParlante.vue -->
<template>
  <div class="avatar-wrapper">
    <canvas ref="canvasRef" class="avatar-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { usePageStore } from '../../store/page'

// --- Props ---
const props = defineProps<{
  isSpeaking?: boolean
  modelPath?: string
}>()

// --- Refs Three.js ---
const canvasRef = ref<HTMLCanvasElement | null>(null)
let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
const clock = new THREE.Clock()
let animationId: number
let model: THREE.Group | null = null
let mixer: THREE.AnimationMixer | null = null
let spotLight: THREE.SpotLight

// --- Gestione Morph Targets ---
let mouthMeshes: Array<{ mesh: THREE.Mesh; indices: Record<string, number> }> = []
let eyeMeshes: Array<{ mesh: THREE.Mesh; index: number }> = []

// --- Stato Animazione ---
let blinkValue = 0
let blinkTimer = 0
let nextBlinkTime = 2 + Math.random() * 4
const headNoiseOffset = Math.random() * 100
let eyeSaccadeTimer = 0
let nextSaccadeTime = 0.5
let saccadeX = 0
let saccadeY = 0

// --- Profile Look State ---
let lookTargetY = 0
let currentHeadY = 0
let currentChestY = 0
let lookTimer = 0
let nextLookTime = 5 + Math.random() * 5

// --- Bone / Mesh state ---
const allMeshes: any[] = []
const allBones: any[] = []
const originalRotations: Record<string, { x: number; y: number; z: number }> = {}

const { avatarReady } = usePageStore()
const modelPath = props.modelPath ?? '/models/avatar_secretary.glb'
let modelLoaded = false  // flag: evita doppio download

// --- Load model ---
function loadModel(path: string) {
  if (!scene) return

  if (model) {
    scene.remove(model)
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose())
        else child.material.dispose()
      }
    })
    model = null
  }

  mouthMeshes = []
  eyeMeshes = []
  allMeshes.length = 0
  allBones.length = 0

  const loader = new GLTFLoader()
  loader.load(path, (gltf) => {
    model = gltf.scene
    scene.add(model)

    if (gltf.animations?.length > 0) {
      mixer = new THREE.AnimationMixer(model)
    }

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        allMeshes.push({ name: child.name, mesh: child, visible: true })

        if (child.morphTargetDictionary && child.morphTargetInfluences) {
          const morphKeys = Object.keys(child.morphTargetDictionary)
          const vowels = ['A', 'I', 'U', 'E', 'O']
          const mIndices: Record<string, number> = {}

          vowels.forEach((v) => {
            const k = morphKeys.find(
              (key) =>
                key.includes(`Fcl_MTH_${v}`) ||
                key === v ||
                key.toLowerCase() === v.toLowerCase() ||
                key.toLowerCase().endsWith(`_${v.toLowerCase()}`) ||
                key.toLowerCase().endsWith(`viseme_${v.toLowerCase()}`) ||
                key.toLowerCase().includes(`mouth_${v.toLowerCase()}`) ||
                key.toLowerCase().includes(`vow_${v.toLowerCase()}`)
            )
            if (k !== undefined) mIndices[v] = child.morphTargetDictionary![k]
          })

          if (Object.keys(mIndices).length === 0) {
            const isNumeric = morphKeys.every((k) => !isNaN(Number(k)))
            if (isNumeric) {
              mIndices['A'] = 33
            } else {
              const fallback = morphKeys.find(
                (k) =>
                  k.toLowerCase().includes('jawopen') ||
                  k.toLowerCase().includes('mouthopen') ||
                  k.toLowerCase().includes('open') ||
                  k.toLowerCase().includes('mouth') ||
                  k.toLowerCase().includes('jaw')
              )
              if (fallback !== undefined) mIndices['A'] = child.morphTargetDictionary![fallback]
            }
          }

          if (Object.keys(mIndices).length > 0) {
            mouthMeshes.push({ mesh: child, indices: mIndices })
          }

          const blinkKeys = morphKeys.filter((k) =>
            ['EyeClose', 'blink', 'Blink', 'Close_Eyes', 'Close_Eye'].some((p) => k.includes(p))
          )
          blinkKeys.forEach((eyeK) => {
            eyeMeshes.push({ mesh: child, index: child.morphTargetDictionary![eyeK] })
          })
        }
      }

      if (child instanceof THREE.Bone) {
        let defX = child.rotation.x
        let defY = child.rotation.y
        let defZ = child.rotation.z

        const bName = child.name.toLowerCase()
        if (bName.includes('upperarm') || bName.includes('armupper')) {
          if (bName.includes('left') || bName.includes('_l') || bName.includes('.l')) {
            defY = 0.4; defZ = 1.1
          } else {
            defY = -0.4; defZ = -1.1
          }
        }
        if (bName.includes('hand')) {
          if (bName.includes('left') || bName.includes('_l') || bName.includes('.l')) {
            defY = 0.5
          } else {
            defY = -0.5
          }
        }

        originalRotations[child.name] = { x: defX, y: defY, z: defZ }
        allBones.push({ name: child.name, bone: child })
        child.rotation.set(defX, defY, defZ)
      }
    })

    allBones.sort((a, b) => a.name.localeCompare(b.name))

    // Scale & Center
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const scale = 1.7 / size.y
    model.scale.setScalar(scale)
    model.position.set(0, 1.4 - size.y * scale * 0.86, 1.15)
    model.rotation.set(0, Math.PI, 0)

    // ✅ Modello pronto
    modelLoaded = true
    avatarReady.value = true
  })
}

// --- Animation loop ---
const animate = () => {
  animationId = requestAnimationFrame(animate)
  const delta = clock.getDelta()
  if (mixer) mixer.update(delta)
  const time = Date.now() * 0.001

  // Idle movement
  const noise = Math.sin(time * 0.2 + headNoiseOffset)
  const breathe = Math.sin(time * 1.2) * 0.015
  const sway = Math.sin(time * 0.5) * 0.02

  lookTimer += delta
  if (lookTimer >= nextLookTime) {
    lookTargetY = lookTargetY !== 0 ? 0 : -1.6
    nextLookTime = lookTargetY !== 0 ? 3 + Math.random() * 6 : 5 + Math.random() * 10
    lookTimer = 0
  }

  currentHeadY = THREE.MathUtils.lerp(currentHeadY, lookTargetY, 0.08)
  currentChestY = THREE.MathUtils.lerp(currentChestY, lookTargetY, 0.03)

  allBones.forEach((b) => {
    const orig = originalRotations[b.name]
    if (!orig) return

    let targetX = orig.x
    let targetY = orig.y
    let targetZ = orig.z

    const name = b.name.toLowerCase()
    if (name.includes('chest') && !name.includes('upper')) targetY += currentChestY * 0.4
    if (name.includes('upperchest')) targetY += currentChestY * 0.2
    if (name.includes('head')) {
      targetY += currentHeadY - currentChestY * 0.6
      targetX += breathe + noise * 0.05
      targetZ += noise * 0.03
    }
    if (name.includes('neck')) targetX += breathe
    if (name.includes('spine') && !name.includes('chest')) targetX += sway

    b.bone.rotation.x = THREE.MathUtils.lerp(b.bone.rotation.x, targetX, 0.05)
    b.bone.rotation.y = THREE.MathUtils.lerp(b.bone.rotation.y, targetY, 0.05)
    b.bone.rotation.z = THREE.MathUtils.lerp(b.bone.rotation.z, targetZ, 0.05)
  })

  // Lip sync
  if (props.isSpeaking && mouthMeshes.length > 0) {
    const vol = (Math.sin(time * 25) * 0.3 + 0.7) * (Math.sin(time * 8) * 0.4 + 0.6)
    mouthMeshes.forEach(({ mesh, indices }) => {
      Object.values(indices).forEach(
        (idx) => (mesh.morphTargetInfluences![idx] = Math.random() * vol * 0.5)
      )
    })
    if (spotLight) spotLight.intensity = 1.0 + vol * 2.5
  } else {
    mouthMeshes.forEach(({ mesh, indices }) => {
      Object.values(indices).forEach(
        (idx) =>
          (mesh.morphTargetInfluences![idx] = THREE.MathUtils.lerp(
            mesh.morphTargetInfluences![idx],
            0,
            0.1
          ))
      )
    })
    if (spotLight)
      spotLight.intensity = THREE.MathUtils.lerp(spotLight.intensity, 0.4, 0.1)
  }

  // Eye saccade
  eyeSaccadeTimer += delta
  if (eyeSaccadeTimer >= nextSaccadeTime) {
    saccadeX = (Math.random() - 0.5) * 0.15
    saccadeY = (Math.random() - 0.5) * 0.1
    eyeSaccadeTimer = 0
    nextSaccadeTime = 0.5 + Math.random() * 2.0
  }

  // Blink
  blinkTimer += delta
  if (blinkTimer >= nextBlinkTime) {
    const p = (blinkTimer - nextBlinkTime) / 0.18
    blinkValue = p <= 1.0 ? Math.sin(p * Math.PI) : 0
    if (p > 1.0) {
      blinkTimer = 0
      nextBlinkTime = 2 + Math.random() * 5
    }
  }
  eyeMeshes.forEach(({ mesh, index }) => (mesh.morphTargetInfluences![index] = blinkValue))

  allBones.forEach((b) => {
    const name = b.name.toLowerCase()
    if (name.includes('eye') && !name.includes('eyebrow')) {
      b.bone.rotation.x = THREE.MathUtils.lerp(b.bone.rotation.x, saccadeY, 0.1)
      b.bone.rotation.y = THREE.MathUtils.lerp(b.bone.rotation.y, saccadeX, 0.1)
    }
  })

  renderer.render(scene, camera)
}

onMounted(() => {
  if (!canvasRef.value) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(30.0, 0.57, 0.1, 20.0)
  camera.position.set(0, 1.3, 2.1)
  camera.lookAt(0, 1.55, 0)

  renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(280, 490)
  renderer.setClearColor(0x000000, 0)

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
  scene.add(ambientLight)

  spotLight = new THREE.SpotLight(0xa2d2ff, 0.5, 10, Math.PI * 0.2)
  spotLight.position.set(0, 2, 2)
  spotLight.target.position.set(0, 1.4, 0)
  scene.add(spotLight)
  scene.add(spotLight.target)

  // ⚠️ Non carichiamo il modello subito: aspettiamo il primo isSpeaking
  animate()
})

// 🔄 Lazy load: avvia download solo al primo play
watch(
  () => props.isSpeaking,
  (val) => {
    if (val && !modelLoaded) {
      avatarReady.value = false   // blocca audio in attesa
      loadModel(modelPath)
    }
  }
)

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) renderer.dispose()
})
</script>

<style scoped>
.avatar-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}

.avatar-canvas {
  width: 280px;
  height: 490px;
  display: block;
  border-radius: 12px;
  background: transparent;
}
</style>
