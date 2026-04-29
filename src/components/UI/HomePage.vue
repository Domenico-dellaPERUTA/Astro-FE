<template>
  <div class="home-container">
    <canvas ref="canvas"></canvas>
    
    <!-- Hero Section -->
    <div class="hero-section">
      <h1 class="hero-title">Benvenuto nei miei <span class="highlight">Appunti</span></h1>
      <p class="hero-subtitle">Esplora la mia raccolta di note tecniche e linguaggi</p>
      
      <!-- Firma calligrafica -->
      <p class="firma"><span class="firma-by">by</span> Domenico della Peruta</p>
      
      <!--
      <div class="category-grid">
        <a href="/topic/html-dictionary" class="category-card html">
          <div class="card-glass"></div>
          <span class="card-icon">🌐</span>
          <span class="card-name">HTML Tags</span>
          <span class="card-desc">Dizionario Tag</span>
        </a>

        <a href="/topic/english-dictionary" class="category-card english">
          <div class="card-glass"></div>
          <span class="card-icon">🇬🇧</span>
          <span class="card-name">Inglese</span>
          <span class="card-desc">Dizionario</span>
        </a>

        <a href="/topic/rust-hello" class="category-card rust">
          <div class="card-glass"></div>
          <span class="card-icon">🦀</span>
          <span class="card-name">Rust</span>
          <span class="card-desc">Linguaggio</span>
        </a>

        <a href="/topic/sap-cap-introduzione" class="category-card sap">
          <div class="card-glass"></div>
          <span class="card-icon">💻</span>
          <span class="card-name">SAP CAP</span>
          <span class="card-desc">Enterprise</span>
        </a>  
      </div>
      -->
    </div>

    <!-- Footer Links -->
    <div class="footer-links">
      <a
        target="_blank" 
        rel="noreferrer nofollow" 
        class="footer-link iubenda-privacy-policy" 
        href="https://www.iubenda.com/privacy-policy/63164304">
        Privacy Policy
      </a>
      <span class="separator">|</span>
      <a 
        rel="noreferrer nofollow" 
        class="footer-link iubenda-advertising-preferences-link" 
        href="javascript:void(0)">
        Personalizza tracciamento
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const canvas = ref(null)

onMounted(() => {
  const el = canvas.value
  const ctx = el.getContext('2d')

  let can_w = window.innerWidth
  let can_h = window.innerHeight
  el.width = can_w
  el.height = can_h

  const BALL_NUM = 40
  const R = 2
  const balls = []
  const alpha_f = 0.03
  const link_line_width = 0.8
  const dis_limit = 260

  const mouse_ball = { x: 0, y: 0, r: R * 2, type: 'mouse' }
  let mouse_in = false

  const randomNumFrom = (min, max) => Math.random() * (max - min) + min
  const randomSidePos = length => Math.ceil(Math.random() * length)
  const getRandomSpeed = pos => {
    switch(pos) {
      case 'top': return [randomNumFrom(-1,1), randomNumFrom(0.1,1)]
      case 'right': return [randomNumFrom(-1,-0.1), randomNumFrom(-1,1)]
      case 'bottom': return [randomNumFrom(-1,1), randomNumFrom(-1,-0.1)]
      case 'left': return [randomNumFrom(0.1,1), randomNumFrom(-1,1)]
    }
  }

  const getRandomBall = () => {
    const posArr = ['top','right','bottom','left']
    const pos = posArr[Math.floor(Math.random()*4)]
    switch(pos) {
      case 'top': return { x: randomSidePos(can_w), y: -R, vx: getRandomSpeed('top')[0], vy: getRandomSpeed('top')[1], r: R, alpha:1, phase:randomNumFrom(0,10) }
      case 'right': return { x: can_w+R, y: randomSidePos(can_h), vx: getRandomSpeed('right')[0], vy: getRandomSpeed('right')[1], r: R, alpha:1, phase:randomNumFrom(0,10) }
      case 'bottom': return { x: randomSidePos(can_w), y: can_h+R, vx: getRandomSpeed('bottom')[0], vy: getRandomSpeed('bottom')[1], r: R, alpha:1, phase:randomNumFrom(0,10) }
      case 'left': return { x: -R, y: randomSidePos(can_h), vx: getRandomSpeed('left')[0], vy: getRandomSpeed('left')[1], r: R, alpha:1, phase:randomNumFrom(0,10) }
    }
  }

  for(let i=0; i<BALL_NUM; i++) balls.push(getRandomBall())

  const render = () => {
    ctx.clearRect(0,0,can_w,can_h)
    balls.forEach(b => {
      ctx.fillStyle = b.type==='mouse' ? 'rgba(255,100,100,0.8)' : `rgba(207,255,4,${b.alpha})`
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r,0,Math.PI*2)
      ctx.closePath()
      ctx.fill()
    })

    for(let i=0;i<balls.length;i++){
      for(let j=i+1;j<balls.length;j++){
        const dx = balls[i].x - balls[j].x
        const dy = balls[i].y - balls[j].y
        const dist = Math.sqrt(dx*dx + dy*dy)
        if(dist<dis_limit){
          ctx.strokeStyle = `rgba(150,150,150,${1-dist/dis_limit})`
          ctx.lineWidth = link_line_width
          ctx.beginPath()
          ctx.moveTo(balls[i].x, balls[i].y)
          ctx.lineTo(balls[j].x, balls[j].y)
          ctx.stroke()
          ctx.closePath()
        }
      }
    }

    const new_balls = []
    balls.forEach(b=>{
      if(b.type!=='mouse'){
        b.x += b.vx
        b.y += b.vy
        b.phase += alpha_f
        b.alpha = Math.abs(Math.cos(b.phase))
        if(b.x>-50 && b.x<can_w+50 && b.y>-50 && b.y<can_h+50) new_balls.push(b)
      } else new_balls.push(b)
    })
    balls.length=0
    balls.push(...new_balls)
    while(balls.length<BALL_NUM + (mouse_in?1:0)) balls.push(getRandomBall())
    requestAnimationFrame(render)
  }
  render()

  const resizeCanvas = () => {
    can_w = window.innerWidth
    can_h = window.innerHeight
    el.width = can_w
    el.height = can_h
  }
  window.addEventListener('resize', resizeCanvas)

  window.addEventListener('mousemove', e => {
    mouse_ball.x = e.clientX
    mouse_ball.y = e.clientY
    mouse_in = true
    if(!balls.includes(mouse_ball)) balls.push(mouse_ball)
  })
})
</script>

<style scoped>
.home-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #1a1a1a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

/* Hero Section */
.hero-section {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 4rem 2rem;
  max-width: 1000px;
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 1.2s ease-out;
}

.hero-title {
  font-family: 'Fredericka the Great', cursive;
  font-size: clamp(3rem, 10vw, 6rem);
  color: #fff;
  margin: 0;
  line-height: 1;
  letter-spacing: -2px;
  text-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(207, 255, 4, 0.1);
  animation: fadeInDown 0.8s ease-out;
}

.hero-title .highlight {
  color: #cfff04;
  display: inline-block;
  transform: rotate(-2deg);
  margin-left: 0.5rem;
}

.hero-subtitle {
  font-family: 'Julee', cursive;
  font-size: clamp(1.2rem, 4vw, 2.2rem);
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  font-weight: lighter;
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

/* Firma calligrafica */
@font-face {
  font-family: 'Allura';
  src: url('/fonts/Allura-latin-ext.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0100-02BA, U+02BD-02C5, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'Allura';
  src: url('/fonts/Allura-latin.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

.firma {
  font-family: 'Allura', cursive;
  font-size: clamp(2rem, 5vw, 3.2rem);
  color: rgba(207, 255, 4, 0.75);
  margin: 0.5rem 0 0 0;
  letter-spacing: 2px;
  position: relative;
  display: inline-block;
  text-shadow: 0 0 30px rgba(207, 255, 4, 0.2);
  transform-origin: center;
  /* firmaAppear finisce a rotate(-3deg), firmaRotate parte da lì → nessuno scatto */
  animation: firmaAppear 2s ease-out 0.8s both, firmaRotate 8s ease-in-out infinite 2.8s;
}

.firma-by {
  color: rgba(180, 180, 180, 0.5);
  font-size: 0.8em;
  text-shadow: none;
}

.firma::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 10%;
  width: 80%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(207, 255, 4, 0.5), transparent);
  animation: lineExpand 1.5s ease-out 1.8s both;
  transform-origin: center;
}

/* Appare con blur e skew, poi si stabilizza SEMPRE a rotate(-3deg) */
@keyframes firmaAppear {
  0%   { opacity: 0; transform: rotate(-3deg) translateY(12px) skewX(-6deg); filter: blur(5px); }
  70%  { filter: blur(0); }
  100% { opacity: 1; transform: rotate(-3deg) translateY(0)    skewX(0deg);  filter: blur(0); }
}

/* Parte da -3deg (uguale a dove finisce firmaAppear) → nessun salto */
@keyframes firmaRotate {
  0%   { transform: rotate(-3deg); }
  50%  { transform: rotate(-1deg); }
  100% { transform: rotate(-3deg); }
}

@keyframes lineExpand {
  from { transform: scaleX(0); opacity: 0; }
  to   { transform: scaleX(1); opacity: 1; }
}


/* Footer Links */
.footer-links {
  position: fixed;
  bottom: 2.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 20;
  padding: 0.8rem 2rem;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  animation: fadeInUp 1s ease-out 0.6s both;
}

.footer-link {
  color: rgba(255, 255, 255, 0.3);
  font-family: 'Julee', cursive;
  font-size: 0.95rem;
  text-decoration: none;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.footer-link:hover {
  color: #cfff04;
  text-shadow: 0 0 15px rgba(207, 255, 4, 0.4);
  transform: translateY(-1px);
}

.separator {
  color: rgba(255, 255, 255, 0.1);
  font-size: 0.8rem;
}

/* Animazioni */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }

/* Mobile Adaptability */
@media (max-width: 600px) {
  .hero-section { padding-top: 10vh; }
  .footer-links { bottom: 1.5rem; flex-direction: column; gap: 0.5rem; padding: 1rem 1.5rem; width: 80%; }
  .separator { display: none; }
}
</style>
