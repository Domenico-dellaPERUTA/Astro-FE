<!-- app/components/UI/HomePage.vue -->
 
<template>
  <canvas ref="canvas"></canvas>
  <a
    target="_blank" 
    rel="noreferrer nofollow" 
    class="link-privacy" 
    href="https://www.iubenda.com/privacy-policy/63164304">
    Privacy Policy
  </a>
  <a 
    rel="noreferrer nofollow" 
    class="link-personalizza  iubenda-advertising-preferences-link" 
    href="">
    Personalizza tracciamento pubblicitario
  </a>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const canvas = ref(null)

onMounted(() => {
  console.log('[HomePage] Mounted, initializing canvas...');
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

  // Utils
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

  // Init
  for(let i=0; i<BALL_NUM; i++) balls.push(getRandomBall())

  // Render loop
  const render = () => {
    ctx.clearRect(0,0,can_w,can_h)

    // Draw balls
    balls.forEach(b => {
      ctx.fillStyle = b.type==='mouse' ? 'rgba(255,100,100,0.8)' : `rgba(207,255,4,${b.alpha})`
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r,0,Math.PI*2)
      ctx.closePath()
      ctx.fill()
    })

    // Draw lines
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

    // Update balls
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

    // Add balls if needed
    while(balls.length<BALL_NUM + (mouse_in?1:0)) balls.push(getRandomBall())

    requestAnimationFrame(render)
  }

  render()

  // Canvas resize
  const resizeCanvas = () => {
    can_w = window.innerWidth
    can_h = window.innerHeight
    el.width = can_w
    el.height = can_h
  }
  window.addEventListener('resize', resizeCanvas)

  // Mouse
  window.addEventListener('mousemove', e => {
    mouse_ball.x = e.clientX
    mouse_ball.y = e.clientY
    mouse_in = true
    if(!balls.includes(mouse_ball)) balls.push(mouse_ball)
  })

  window.addEventListener('mouseleave', () => {
    const new_balls = balls.filter(b=>b.type!=='mouse')
    balls.length=0
    balls.push(...new_balls)
    mouse_in=false
  })
})
</script>

<style scoped>
canvas {
  position: fixed;
  inset: 0;
  margin: 0;
  padding: 0;
  background-color: #222;
  display: block;
  z-index: -1; /* rimane sotto menu e header */
  pointer-events: none; /* mouse passa agli elementi sopra */
}

a.link-privacy {
  position: fixed;
  bottom: 10px;
  left: 10px;
  color: #2afe0056;
  font-size: medium;
  z-index: 10;
  text-decoration: none;
}
a.link-privacy:hover {
  text-decoration: underline;
}
a.link-personalizza {
  position: fixed;
  bottom: 10px;
  left: 150px;
  color: #fffb0363;
  font-size: medium;
  z-index: 10;
  text-decoration: none;
}
a.link-personalizza:hover {
  text-decoration: underline;
}

</style>
