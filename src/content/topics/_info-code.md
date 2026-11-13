---
title: "Guida: tipo code 💻"
type: "code"
menu: "Guide 📚"
index: 3
visible: false

# ═══════════════════════════════════════════════════════════════════
# TIPO "code": il body è codice mostrato nell'editor Monaco
# ═══════════════════════════════════════════════════════════════════
# • Il linguaggio viene rilevato automaticamente dal contenuto
# • I fence ``` (se presenti nel body) vengono rimossi automaticamente
# • Nessun asset /WebPages necessario: il codice non viene eseguito
# • Frontmatter audio: true oppure "/x.mp3" → pulsante 🔊 in barra
#
# Questo file È l'esempio: il codice che vedi è il suo body.
# ═══════════════════════════════════════════════════════════════════
---

// Esempio JavaScript: fibonacci iterativo + piccola classe
function fibonacci(n) {
  let [a, b] = [0, 1]
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b]
  }
  return a
}

console.log(fibonacci(10)) // 55

class Punto {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
  distanzaDa(p) {
    return Math.hypot(this.x - p.x, this.y - p.y)
  }
}

const p1 = new Punto(0, 0)
const p2 = new Punto(3, 4)
console.log(p1.distanzaDa(p2)) // 5
