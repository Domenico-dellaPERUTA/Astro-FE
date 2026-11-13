---
title: "Guida: tipo steps 🪜 (demo: la derivata)"
type: "steps"
menu: "Guide 📚"
index: 8
audio: true      # sintesi vocale per ogni passo (senza file mp3)
autoplay: true   # quando finisce l'audio del passo, avanza da solo
visible: false

# ═══════════════════════════════════════════════════════════════════
# TIPO "steps" — FORMATO YAML (presentazione a slide stile PowerPoint)
# ═══════════════════════════════════════════════════════════════════
# Ogni voce di `slides` è una SLIDE a piena vista (nessuno scroll); i
# suoi `steps` sono i passi di comparsa, numerati 1, 2, 3… in ordine
# (il `title` conta come passo 1). Il body del file resta vuoto: se
# `slides` è presente viene usato il formato YAML, altrimenti il body
# HTML con data-step/data-fx (entrambi i formati restano validi).
#
# SLIDE:
#   title: "…"            titolo della slide (h2, è il passo 1)
#   center: true          OPT-IN: contenuto centrato in verticale
#   centerBoth: true      OPT-IN: centrato anche in orizzontale
#   audio: "/…/x.mp3"     mp3 riprodotto all'ingresso nella slide
#   background: "…"       sfondo personalizzato della slide
#
# PASSO (steps):
#   text: "…"             testo del passo (HTML inline e $KaTeX$ ammessi)
#   html: |               blocco HTML libero (SVG, .step-canvas, overlay…)
#       <div>…</div>
#   tag: p|h2|h3|li|blockquote   tag del blocco di testo (default: p)
#   fx: fade | slide-left | slide-right | slide-up | slide-down |
#       zoom | zoom-out | pop | flip | blur     (default: fade)
#   out: N                uscita animata al passo N
#   audio: "/…/x.mp3"     mp3 riprodotto alla comparsa del blocco
#   center: true          blocco centrato orizzontalmente
#
# Blocchi html: gli elementi interni possono usare data-step="N" e
# data-out="N"; i numeri contano TUTTI i passi della slide (title
# incluso). Qui sotto: title=1, canvas=2, testo=3, testo=4, testo=5 →
# la secante nasce al passo 3 (data-step="3") ed esce al 5 (data-out="5").
#
# Suggerimento YAML: usa blocchi | o >- per i testi con formule o
# apostrofi (eviti di raddoppiare i backslash e di raddoppiare gli apici).
#
# Navigazione: frecce ← → (prima i passi, poi le slide), PageUp/PageDown,
# Home/End, Spazio, pulsanti della barra/laterali, click sul contenuto.
# ═══════════════════════════════════════════════════════════════════

slides:
  # ── SLIDE 1: copertina ────────────────────────────────────────────
  - title: "La derivata"
    steps:
      - text: >-
          Studiamo la funzione <strong>$f(x)=x^2$</strong> e chiediamoci:
          quanto è <em>ripida</em> la curva nel punto $P$ di ascissa $a=2$?
        fx: slide-up

      - text: >-
          Avanzando con le frecce costruiamo la risposta
          <strong>passo passo</strong>, come in una presentazione. 🎬
        fx: slide-up

  # ── SLIDE 2: dal grafico ──────────────────────────────────────────
  - title: "Dal grafico al concetto"
    steps:
      # Passo 2: il grafico. I data-step interni contano TUTTI i passi
      # della slide: secante al 3 (data-out="5"), tangente al 5
      - html: |
          <div class="step-canvas">
            <svg viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker id="arrA" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#475569"/>
                </marker>
              </defs>
              <line x1="40" y1="255" x2="460" y2="255" stroke="#475569" stroke-width="2" marker-end="url(#arrA)"/>
              <line x1="250" y1="255" x2="250" y2="85" stroke="#475569" stroke-width="2" marker-end="url(#arrA)"/>
              <text x="236" y="274" font-size="14" fill="#475569" font-family="serif">O</text>
              <text x="452" y="276" font-size="15" fill="#475569" font-style="italic" font-family="serif">x</text>
              <text x="260" y="98" font-size="15" fill="#475569" font-style="italic" font-family="serif">y</text>
              <path d="M70 129 Q70 255 250 255 Q430 255 430 129" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/>
              <text x="330" y="128" font-size="15" fill="#1d4ed8" font-style="italic" font-family="serif">f(x) = x²</text>
              <circle cx="370" cy="199" r="5" fill="#e53935"/>
              <text x="378" y="192" font-size="14" fill="#b71c1c" font-family="serif">P</text>
            </svg>
            <svg data-step="3" data-out="5" data-fx="fade" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
              <line x1="100" y1="262" x2="460" y2="178" stroke="#e53935" stroke-width="2.5"/>
              <text x="126" y="244" font-size="13" fill="#e53935" font-family="serif">secante</text>
            </svg>
            <svg data-step="5" data-fx="fade" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
              <line x1="262" y1="300" x2="478" y2="98" stroke="#43a047" stroke-width="2.5"/>
              <text x="390" y="148" font-size="13" fill="#43a047" font-family="serif">tangente</text>
            </svg>
          </div>
        fx: zoom

      # Passo 3: testo + secante (overlay del canvas con data-step="3")
      - text: >-
          Il punto $P$ ha coordinate $(2,\; f(2)) = (2,\; 4)$. La
          <span style="color:#e53935"><strong>secante</strong></span> passa
          per $P$ e per un secondo punto della curva: pendenza
          $\dfrac{\Delta y}{\Delta x} = \dfrac{f(2+h)-f(2)}{h}$.
        fx: slide-up

      # Passo 4
      - text: >-
          Avviciniamo i due punti: $h \to 0$. La secante ruota sempre di
          più attorno a $P$… finché <strong>collassa</strong> su una sola retta.
        fx: slide-up

      # Passo 5: testo + tangente (overlay del canvas con data-step="5")
      - text: >-
          La <span style="color:#43a047"><strong>tangente</strong></span> è
          il limite della secante: pendenza $f'(2) = 4$, il
          <em>coefficiente angolare</em> della curva in $P$.
        fx: slide-up

  # ── SLIDE 3: la formula ───────────────────────────────────────────
  - title: "Il rapporto incrementale"
    steps:
      - text: |
          $$f'(a) = \lim_{h \to 0} \dfrac{f(a+h)-f(a)}{h}$$
        fx: blur
        center: true

      - text: >-
          La derivata è il <strong>limite</strong> del rapporto incrementale:
          un valore che <strong>cambia punto per punto</strong> — è a sua
          volta una funzione.
        fx: slide-up

  # ── SLIDE 4: riassunto ────────────────────────────────────────────
  - title: "In sintesi"
    steps:
      - tag: li
        text: >-
          La <span style="color:#e53935"><strong>secante</strong></span>
          misura il cambiamento <strong>medio</strong> su un intervallo $h$.
        fx: slide-left

      - tag: li
        text: >-
          Quando $h \to 0$, la secante diventa la
          <span style="color:#43a047"><strong>tangente</strong></span>.
        fx: slide-left

      - tag: li
        text: >-
          La pendenza della tangente è la <strong>derivata</strong>: $f'(a)$.
        fx: slide-left

      - text: >-
          💡 Nella <em>presentazione narrata</em> (<code>autoplay: true</code>)
          ogni passo parte da solo quando finisce la voce che lo spiega.
        fx: pop
---
