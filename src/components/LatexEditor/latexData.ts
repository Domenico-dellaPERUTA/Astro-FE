export interface LatexSymbol {
  name: string;
  latex: string;
  snippet?: string; // What to insert into editor if different from latex (e.g. with cursor positioning)
  cursorOffset?: number; // Cursor position relative to insertion
  desc?: string;
  display?: string; // Optional display formula for button if different
}

export interface LatexCategory {
  id: string;
  name: string;
  iconName: string;
  symbols: LatexSymbol[];
}

export interface LatexTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  latex: string;
}

export const LATEX_CATEGORIES: LatexCategory[] = [
  {
    id: 'basic',
    name: 'Base & Aritmetica',
    iconName: 'Plus',
    symbols: [
      { name: 'Frazione', latex: '\\frac{a}{b}', snippet: '\\frac{a}{b}', desc: 'Frazione semplice' },
      { name: 'Frazione derivata', latex: '\\frac{df}{dx}', snippet: '\\frac{df}{dx}', desc: 'Frazione differenziale' },
      { name: 'Radice quadrata', latex: '\\sqrt{x}', snippet: '\\sqrt{x}', desc: 'Radice quadrata' },
      { name: 'Radice n-esima', latex: '\\sqrt[n]{x}', snippet: '\\sqrt[n]{x}', desc: 'Radice di ordine n' },
      { name: 'Esponente / Potenza', latex: 'x^{n}', snippet: 'x^{n}', desc: 'Elevamento a potenza' },
      { name: 'Pedice / Indice', latex: 'x_{n}', snippet: 'x_{n}', desc: 'Pedice' },
      { name: 'Esponente e pedice', latex: 'x_{i}^{2}', snippet: 'x_{i}^{2}', desc: 'Indice ed esponente congiunti' },
      { name: 'Più o meno', latex: '\\pm', snippet: '\\pm ', desc: 'Più o meno' },
      { name: 'Meno o più', latex: '\\mp', snippet: '\\mp ', desc: 'Meno o più' },
      { name: 'Moltiplicazione per', latex: '\\times', snippet: '\\times ', desc: 'Segno di moltiplicazione (croce)' },
      { name: 'Moltiplicazione punto', latex: '\\cdot', snippet: '\\cdot ', desc: 'Punto di moltiplicazione centrato' },
      { name: 'Divisione', latex: '\\div', snippet: '\\div ', desc: 'Segno di divisione' },
      { name: 'Diverso da', latex: '\\neq', snippet: '\\neq ', desc: 'Disuguaglianza' },
      { name: 'Circa uguale', latex: '\\approx', snippet: '\\approx ', desc: 'Approssimazione' },
      { name: 'Minore o uguale', latex: '\\leq', snippet: '\\leq ', desc: 'Minore o uguale' },
      { name: 'Maggiore o uguale', latex: '\\geq', snippet: '\\geq ', desc: 'Maggiore o uguale' },
      { name: 'Molto minore', latex: '\\ll', snippet: '\\ll ', desc: 'Molto minore di' },
      { name: 'Molto maggiore', latex: '\\gg', snippet: '\\gg ', desc: 'Molto maggiore di' },
      { name: 'Equivalente a', latex: '\\equiv', snippet: '\\equiv ', desc: 'Identicamente uguale o congruo' },
      { name: 'Proporzionale', latex: '\\propto', snippet: '\\propto ', desc: 'Direttamente proporzionale a' },
      { name: 'Infinito', latex: '\\infty', snippet: '\\infty ', desc: 'Simbolo di infinito' },
      { name: 'Percentuale', latex: '\\%', snippet: '\\% ', desc: 'Percentuale' },
      { name: 'Punti di sospensione orizzontali', latex: '\\dots', snippet: '\\dots ', desc: 'Punti bassi' },
      { name: 'Punti centrati', latex: '\\cdots', snippet: '\\cdots ', desc: 'Punti centrati' },
      { name: 'Punti verticali', latex: '\\vdots', snippet: '\\vdots ', desc: 'Punti verticali' },
      { name: 'Punti diagonali', latex: '\\ddots', snippet: '\\ddots ', desc: 'Punti diagonali' }
    ]
  },
  {
    id: 'greek',
    name: 'Lettere Greche',
    iconName: 'Sparkles',
    symbols: [
      { name: 'alpha', latex: '\\alpha', snippet: '\\alpha ' },
      { name: 'beta', latex: '\\beta', snippet: '\\beta ' },
      { name: 'gamma', latex: '\\gamma', snippet: '\\gamma ' },
      { name: 'delta', latex: '\\delta', snippet: '\\delta ' },
      { name: 'epsilon', latex: '\\epsilon', snippet: '\\epsilon ' },
      { name: 'varepsilon', latex: '\\varepsilon', snippet: '\\varepsilon ' },
      { name: 'zeta', latex: '\\zeta', snippet: '\\zeta ' },
      { name: 'eta', latex: '\\eta', snippet: '\\eta ' },
      { name: 'theta', latex: '\\theta', snippet: '\\theta ' },
      { name: 'vartheta', latex: '\\vartheta', snippet: '\\vartheta ' },
      { name: 'iota', latex: '\\iota', snippet: '\\iota ' },
      { name: 'kappa', latex: '\\kappa', snippet: '\\kappa ' },
      { name: 'lambda', latex: '\\lambda', snippet: '\\lambda ' },
      { name: 'mu', latex: '\\mu', snippet: '\\mu ' },
      { name: 'nu', latex: '\\nu', snippet: '\\nu ' },
      { name: 'xi', latex: '\\xi', snippet: '\\xi ' },
      { name: 'pi', latex: '\\pi', snippet: '\\pi ' },
      { name: 'rho', latex: '\\rho', snippet: '\\rho ' },
      { name: 'sigma', latex: '\\sigma', snippet: '\\sigma ' },
      { name: 'tau', latex: '\\tau', snippet: '\\tau ' },
      { name: 'upsilon', latex: '\\upsilon', snippet: '\\upsilon ' },
      { name: 'phi', latex: '\\phi', snippet: '\\phi ' },
      { name: 'varphi', latex: '\\varphi', snippet: '\\varphi ' },
      { name: 'chi', latex: '\\chi', snippet: '\\chi ' },
      { name: 'psi', latex: '\\psi', snippet: '\\psi ' },
      { name: 'omega', latex: '\\omega', snippet: '\\omega ' },
      { name: 'Gamma maiuscolo', latex: '\\Gamma', snippet: '\\Gamma ' },
      { name: 'Delta maiuscolo', latex: '\\Delta', snippet: '\\Delta ' },
      { name: 'Theta maiuscolo', latex: '\\Theta', snippet: '\\Theta ' },
      { name: 'Lambda maiuscolo', latex: '\\Lambda', snippet: '\\Lambda ' },
      { name: 'Xi maiuscolo', latex: '\\Xi', snippet: '\\Xi ' },
      { name: 'Pi maiuscolo', latex: '\\Pi', snippet: '\\Pi ' },
      { name: 'Sigma maiuscolo', latex: '\\Sigma', snippet: '\\Sigma ' },
      { name: 'Upsilon maiuscolo', latex: '\\Upsilon', snippet: '\\Upsilon ' },
      { name: 'Phi maiuscolo', latex: '\\Phi', snippet: '\\Phi ' },
      { name: 'Psi maiuscolo', latex: '\\Psi', snippet: '\\Psi ' },
      { name: 'Omega maiuscolo', latex: '\\Omega', snippet: '\\Omega ' }
    ]
  },
  {
    id: 'calculus',
    name: 'Analisi & Calcolo',
    iconName: 'Activity',
    symbols: [
      { name: 'Integrale semplice', latex: '\\int f(x)\\,dx', snippet: '\\int f(x)\\,dx' },
      { name: 'Integrale definito', latex: '\\int_{a}^{b} f(x)\\,dx', snippet: '\\int_{a}^{b} f(x)\\,dx' },
      { name: 'Integrale doppio', latex: '\\iint_{D} f(x,y)\\,dxdy', snippet: '\\iint_{D} f(x,y)\\,dxdy' },
      { name: 'Integrale triplo', latex: '\\iiint_{V} f(x,y,z)\\,dV', snippet: '\\iiint_{V} f(x,y,z)\\,dV' },
      { name: 'Integrale chiuso di linea', latex: '\\oint_{C} \\mathbf{F}\\cdot d\\mathbf{r}', snippet: '\\oint_{C} \\mathbf{F}\\cdot d\\mathbf{r}' },
      { name: 'Sommatoria', latex: '\\sum_{i=1}^{n} a_i', snippet: '\\sum_{i=1}^{n} a_i' },
      { name: 'Produttoria', latex: '\\prod_{i=1}^{n} x_i', snippet: '\\prod_{i=1}^{n} x_i' },
      { name: 'Unione indicizzata (\\bigcup_)', latex: '\\bigcup_{i=1}^{n} A_i', snippet: '\\bigcup_{i=1}^{n} ' },
      { name: 'Intersezione indicizzata (\\bigcap_)', latex: '\\bigcap_{i=1}^{n} A_i', snippet: '\\bigcap_{i=1}^{n} ' },
      { name: 'Limite generico', latex: '\\lim_{x \\to x_0} f(x)', snippet: '\\lim_{x \\to x_0} f(x)' },
      { name: 'Limite a infinito', latex: '\\lim_{n \\to \\infty} a_n', snippet: '\\lim_{n \\to \\infty} a_n' },
      { name: 'Derivata df/dx', latex: '\\frac{df}{dx}', snippet: '\\frac{df}{dx}' },
      { name: 'Derivata parziale', latex: '\\frac{\\partial f}{\\partial x}', snippet: '\\frac{\\partial f}{\\partial x}' },
      { name: 'Derivata seconda parziale', latex: '\\frac{\\partial^2 f}{\\partial x^2}', snippet: '\\frac{\\partial^2 f}{\\partial x^2}' },
      { name: 'Derivata prima f primo', latex: "f'(x)", snippet: "f'(x)" },
      { name: 'Derivata seconda f secondo', latex: "f''(x)", snippet: "f''(x)" },
      { name: 'Derivata temporale x punto', latex: '\\dot{x}', snippet: '\\dot{x}' },
      { name: 'Derivata temporale x due punti', latex: '\\ddot{x}', snippet: '\\ddot{x}' },
      { name: 'Gradiente / Nabla', latex: '\\nabla f', snippet: '\\nabla f' },
      { name: 'Laplaciano', latex: '\\nabla^2 f', snippet: '\\nabla^2 f' },
      { name: 'Differenziale parziale', latex: '\\partial', snippet: '\\partial ' }
    ]
  },
  {
    id: 'matrix',
    name: 'Matrici & Vettori',
    iconName: 'Grid',
    symbols: [
      {
        name: 'Matrice 2x2 tonde',
        latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
        snippet: '\\begin{pmatrix}\n  a & b \\\\\n  c & d\n\\end{pmatrix}',
        display: '\\left(\\begin{smallmatrix} a & b \\\\ c & d \\end{smallmatrix}\\right)'
      },
      {
        name: 'Matrice 3x3 tonde',
        latex: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}',
        snippet: '\\begin{pmatrix}\n  a & b & c \\\\\n  d & e & f \\\\\n  g & h & i\n\\end{pmatrix}',
        display: '\\left(\\begin{smallmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{smallmatrix}\\right)'
      },
      {
        name: 'Matrice 2x2 quadre',
        latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
        snippet: '\\begin{bmatrix}\n  a & b \\\\\n  c & d\n\\end{bmatrix}',
        display: '\\left[\\begin{smallmatrix} a & b \\\\ c & d \\end{smallmatrix}\\right]'
      },
      {
        name: 'Determinante 2x2',
        latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}',
        snippet: '\\begin{vmatrix}\n  a & b \\\\\n  c & d\n\\end{vmatrix}',
        display: '\\left|\\begin{smallmatrix} a & b \\\\ c & d \\end{smallmatrix}\\right|'
      },
      {
        name: 'Matrice a graffe',
        latex: '\\begin{Bmatrix} a & b \\\\ c & d \\end{Bmatrix}',
        snippet: '\\begin{Bmatrix}\n  a & b \\\\\n  c & d\n\\end{Bmatrix}',
        display: '\\left\\{\\begin{smallmatrix} a & b \\\\ c & d \\end{smallmatrix}\\right\\}'
      },
      {
        name: 'Vettore colonna',
        latex: '\\begin{pmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{pmatrix}',
        snippet: '\\begin{pmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{pmatrix}',
        display: '\\left(\\begin{smallmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{smallmatrix}\\right)'
      },
      {
        name: 'Vettore riga',
        latex: '\\begin{pmatrix} x_1 & x_2 & x_3 \\end{pmatrix}',
        snippet: '\\begin{pmatrix} x_1 & x_2 & x_3 \\end{pmatrix}',
        display: '\\left(\\begin{smallmatrix} x_1 & x_2 & x_3 \\end{smallmatrix}\\right)'
      },
      { name: 'Vettore con freccia', latex: '\\vec{v}', snippet: '\\vec{v}' },
      { name: 'Vettore grassetto', latex: '\\mathbf{v}', snippet: '\\mathbf{v}' },
      { name: 'Versore cappuccio', latex: '\\hat{u}', snippet: '\\hat{u}' },
      { name: 'Norma vettoriale', latex: '\\|\\mathbf{v}\\|', snippet: '\\|\\mathbf{v}\\|' },
      { name: 'Prodotto scalare', latex: '\\mathbf{u} \\cdot \\mathbf{v}', snippet: '\\mathbf{u} \\cdot \\mathbf{v}' },
      { name: 'Prodotto vettoriale', latex: '\\mathbf{u} \\times \\mathbf{v}', snippet: '\\mathbf{u} \\times \\mathbf{v}' },
      { name: 'Trasposta', latex: 'A^{T}', snippet: 'A^{T}' }
    ]
  },
  {
    id: 'delimiters',
    name: 'Parentesi & Delimitatori',
    iconName: 'Maximize',
    symbols: [
      { name: 'Parentesi tonde scalabili', latex: '\\left( \\frac{a}{b} \\right)', snippet: '\\left( \\frac{a}{b} \\right)' },
      { name: 'Parentesi quadre scalabili', latex: '\\left[ \\frac{a}{b} \\right]', snippet: '\\left[ \\frac{a}{b} \\right]' },
      { name: 'Parentesi graffe scalabili', latex: '\\left\\{ \\frac{a}{b} \\right\\}', snippet: '\\left\\{ \\frac{a}{b} \\right\\}' },
      { name: 'Modulo / Valore assoluto', latex: '\\left| x \\right|', snippet: '\\left| x \\right|' },
      { name: 'Norma doppia barra', latex: '\\left\\| x \\right\\|', snippet: '\\left\\| x \\right\\|' },
      { name: 'Parentesi angolari (bra-ket)', latex: '\\langle x, y \\rangle', snippet: '\\langle x, y \\rangle' },
      { name: 'Ket (meccanica quantistica)', latex: '|\\psi\\rangle', snippet: '|\\psi\\rangle' },
      { name: 'Bra (meccanica quantistica)', latex: '\\langle\\psi|', snippet: '\\langle\\psi|' },
      { name: 'Parte intera inferiore (floor)', latex: '\\lfloor x \\rfloor', snippet: '\\lfloor x \\rfloor' },
      { name: 'Parte intera superiore (ceiling)', latex: '\\lceil x \\rceil', snippet: '\\lceil x \\rceil' },
      { name: 'Barra di valutazione', latex: '\\left. f(x) \\right|_{a}^{b}', snippet: '\\left. f(x) \\right|_{a}^{b}' }
    ]
  },
  {
    id: 'logic',
    name: 'Logica & Insiemi',
    iconName: 'Layers',
    symbols: [
      { name: 'Per ogni', latex: '\\forall', snippet: '\\forall ' },
      { name: 'Esiste', latex: '\\exists', snippet: '\\exists ' },
      { name: 'Non esiste', latex: '\\nexists', snippet: '\\nexists ' },
      { name: 'Appartiene', latex: '\\in', snippet: '\\in ' },
      { name: 'Non appartiene', latex: '\\notin', snippet: '\\notin ' },
      { name: 'Sottoinsieme', latex: '\\subset', snippet: '\\subset ' },
      { name: 'Sottoinsieme o uguale', latex: '\\subseteq', snippet: '\\subseteq ' },
      { name: 'Unione', latex: '\\cup', snippet: '\\cup ' },
      { name: 'Intersezione', latex: '\\cap', snippet: '\\cap ' },
      { name: 'Unione grande con indici (\\bigcup_)', latex: '\\bigcup_{i=1}^{n} A_i', snippet: '\\bigcup_{i=1}^{n} ' },
      { name: 'Intersezione grande con indici (\\bigcap_)', latex: '\\bigcap_{i=1}^{n} A_i', snippet: '\\bigcap_{i=1}^{n} ' },
      { name: 'Unione con pedice (\\bigcup_)', latex: '\\bigcup_{i} A_i', snippet: '\\bigcup_{i} ' },
      { name: 'Intersezione con pedice (\\bigcap_)', latex: '\\bigcap_{i} A_i', snippet: '\\bigcap_{i} ' },
      { name: 'Insieme vuoto', latex: '\\emptyset', snippet: '\\emptyset ' },
      { name: 'E logico (and)', latex: '\\land', snippet: '\\land ' },
      { name: 'O logico (or)', latex: '\\lor', snippet: '\\lor ' },
      { name: 'Negazione logica (not)', latex: '\\neg', snippet: '\\neg ' },
      { name: 'Implica', latex: '\\implies', snippet: '\\implies ' },
      { name: 'Se e solo se', latex: '\\iff', snippet: '\\iff ' },
      { name: 'Dunque / Quindi', latex: '\\therefore', snippet: '\\therefore ' },
      { name: 'Poiché', latex: '\\because', snippet: '\\because ' },
      { name: 'Numeri Reali', latex: '\\mathbb{R}', snippet: '\\mathbb{R}' },
      { name: 'Numeri Complessi', latex: '\\mathbb{C}', snippet: '\\mathbb{C}' },
      { name: 'Numeri Naturali', latex: '\\mathbb{N}', snippet: '\\mathbb{N}' },
      { name: 'Numeri Interi', latex: '\\mathbb{Z}', snippet: '\\mathbb{Z}' },
      { name: 'Numeri Razionali', latex: '\\mathbb{Q}', snippet: '\\mathbb{Q}' }
    ]
  },
  {
    id: 'arrows',
    name: 'Frecce & Relazioni',
    iconName: 'ArrowRight',
    symbols: [
      { name: 'Freccia destra', latex: '\\rightarrow', snippet: '\\rightarrow ' },
      { name: 'Freccia sinistra', latex: '\\leftarrow', snippet: '\\leftarrow ' },
      { name: 'Freccia destra-sinistra', latex: '\\leftrightarrow', snippet: '\\leftrightarrow ' },
      { name: 'Freccia lunga a destra', latex: '\\longrightarrow', snippet: '\\longrightarrow ' },
      { name: 'Freccia lunga a sinistra', latex: '\\longleftarrow', snippet: '\\longleftarrow ' },
      { name: 'Mappa a', latex: '\\mapsto', snippet: '\\mapsto ' },
      { name: 'Doppia freccia destra', latex: '\\Rightarrow', snippet: '\\Rightarrow ' },
      { name: 'Doppia freccia sinistra', latex: '\\Leftarrow', snippet: '\\Leftarrow ' },
      { name: 'Doppia freccia bidirezionale', latex: '\\Leftrightarrow', snippet: '\\Leftrightarrow ' },
      { name: 'Freccia su', latex: '\\uparrow', snippet: '\\uparrow ' },
      { name: 'Freccia giù', latex: '\\downarrow', snippet: '\\downarrow ' },
      { name: 'Tende a (veloce)', latex: '\\to', snippet: '\\to ' }
    ]
  },
  {
    id: 'functions',
    name: 'Funzioni & Trig',
    iconName: 'FunctionSquare',
    symbols: [
      { name: 'Seno', latex: '\\sin(x)', snippet: '\\sin(x)' },
      { name: 'Coseno', latex: '\\cos(x)', snippet: '\\cos(x)' },
      { name: 'Tangente', latex: '\\tan(x)', snippet: '\\tan(x)' },
      { name: 'Cotangente', latex: '\\cot(x)', snippet: '\\cot(x)' },
      { name: 'Arcoseno', latex: '\\arcsin(x)', snippet: '\\arcsin(x)' },
      { name: 'Arcocoseno', latex: '\\arccos(x)', snippet: '\\arccos(x)' },
      { name: 'Arcotangente', latex: '\\arctan(x)', snippet: '\\arctan(x)' },
      { name: 'Logaritmo naturale', latex: '\\ln(x)', snippet: '\\ln(x)' },
      { name: 'Logaritmo base 10', latex: '\\log(x)', snippet: '\\log(x)' },
      { name: 'Logaritmo base b', latex: '\\log_{b}(x)', snippet: '\\log_{b}(x)' },
      { name: 'Esponenziale', latex: '\\exp(x)', snippet: '\\exp(x)' },
      { name: 'Minimo', latex: '\\min(a, b)', snippet: '\\min(a, b)' },
      { name: 'Massimo', latex: '\\max(a, b)', snippet: '\\max(a, b)' },
      { name: 'Estremo superiore', latex: '\\sup', snippet: '\\sup ' },
      { name: 'Estremo inferiore', latex: '\\inf', snippet: '\\inf ' },
      { name: 'Determinante', latex: '\\det(A)', snippet: '\\det(A)' },
      { name: 'Dimensione spazio', latex: '\\dim(V)', snippet: '\\dim(V)' }
    ]
  },
  {
    id: 'styles',
    name: 'Stili',
    iconName: 'Type',
    symbols: [
      { name: 'Grassetto matematico', latex: '\\mathbf{X}', snippet: '\\mathbf{X}' },
      { name: 'Calligrafico', latex: '\\mathcal{L}', snippet: '\\mathcal{L}' },
      { name: 'Gotico (Fraktur)', latex: '\\mathfrak{g}', snippet: '\\mathfrak{g}' },
      { name: 'Testo in formula', latex: '\\text{testo}', snippet: '\\text{testo}' },
      { name: 'Trattino sopra (bar)', latex: '\\bar{x}', snippet: '\\bar{x}' },
      { name: 'Tilde sopra', latex: '\\tilde{x}', snippet: '\\tilde{x}' },
      { name: 'Cappuccio sopra (hat)', latex: '\\hat{x}', snippet: '\\hat{x}' },
      { name: 'Linea sopra (overline)', latex: '\\overline{AB}', snippet: '\\overline{AB}' },
      { name: 'Riquadro (box)', latex: '\\boxed{x}', snippet: '\\boxed{x}' },
      { name: 'Colore arancione', latex: '\\color{#ff8c00}{x}', snippet: '\\color{#ff8c00}{x}' },
      { name: 'Colore nero', latex: '\\color{black}{x}', snippet: '\\color{black}{x}' },
      { name: 'Colore bianco', latex: '\\color{white}{x}', snippet: '\\color{white}{x}' },
      { name: 'Spazio medio quad', latex: 'a \\quad b', snippet: '\\quad ' },
      { name: 'Spazio grande qquad', latex: 'a \\qquad b', snippet: '\\qquad ' }
    ]
  },
  {
    id: 'environments',
    name: 'Sistemi & Casi',
    iconName: 'AlignLeft',
    symbols: [
      {
        name: 'Sistema a casi',
        latex: '\\begin{cases} x + y = 1 \\\\ 2x - y = 3 \\end{cases}',
        snippet: '\\begin{cases}\n  x + y = 1 \\\\\n  2x - y = 3\n\\end{cases}',
        display: '\\left\\{\\begin{smallmatrix} x + y = 1 \\\\ 2x - y = 3 \\end{smallmatrix}\\right.'
      },
      {
        name: 'Equazioni allineate',
        latex: '\\begin{aligned} a &= b + c \\\\ &= d + e \\end{aligned}',
        snippet: '\\begin{aligned}\n  a &= b + c \\\\\n  &= d + e\n\\end{aligned}',
        display: '\\begin{smallmatrix} a &= b \\\\ &= d \\end{smallmatrix}'
      },
      {
        name: 'Funzione definita a tratti',
        latex: 'f(x) = \\begin{cases} -x & \\text{se } x < 0 \\\\ x & \\text{se } x \\geq 0 \\end{cases}',
        snippet: 'f(x) = \\begin{cases}\n  -x & \\text{se } x < 0 \\\\\n   x & \\text{se } x \\geq 0\n\\end{cases}',
        display: 'f(x) = \\left\\{\\begin{smallmatrix} -x \\\\ x \\end{smallmatrix}\\right.'
      }
    ]
  }
];

export const LATEX_TEMPLATES: LatexTemplate[] = [
  {
    id: 'quadratic',
    title: 'Formula Quadratica',
    category: 'Algebra',
    description: 'Soluzione generale per equazioni di secondo grado ax² + bx + c = 0',
    latex: `x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}`
  },
  {
    id: 'euler',
    title: 'Identità di Eulero',
    category: 'Analisi Complessa',
    description: 'La celebre relazione che collega e, i, pi, 1 e 0',
    latex: `e^{i\\pi} + 1 = 0`
  },
  {
    id: 'gaussian',
    title: 'Integrale Gaussiano',
    category: 'Analisi & Calcolo',
    description: 'Integrale fondamentale della campana di Gauss',
    latex: `\\int_{-\\infty}^{+\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}`
  },
  {
    id: 'normal-dist',
    title: 'Distribuzione Normale',
    category: 'Probabilità & Statistica',
    description: 'Funzione di densità di probabilità gaussiana N(mu, sigma²)',
    latex: `f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} \\exp\\left( -\\frac{(x - \\mu)^2}{2\\sigma^2} \\right)`
  },
  {
    id: 'maxwell',
    title: 'Equazioni di Maxwell',
    category: 'Fisica & Elettromagnetismo',
    description: 'Le 4 equazioni fondamentali dell\'elettrodinamica classica',
    latex: `\\begin{aligned}
  \\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\varepsilon_0} \\\\[6pt]
  \\nabla \\cdot \\mathbf{B} &= 0 \\\\[6pt]
  \\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t} \\\\[6pt]
  \\nabla \\times \\mathbf{B} &= \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t}
\\end{aligned}`
  },
  {
    id: 'schrodinger',
    title: 'Equazione di Schrödinger',
    category: 'Meccanica Quantistica',
    description: 'Equazione differenziale fondamentale per l\'evoluzione temporale di uno stato quantistico',
    latex: `i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\left[ -\\frac{\\hbar^2}{2m}\\nabla^2 + V(\\mathbf{r}, t) \\right] \\Psi(\\mathbf{r}, t)`
  },
  {
    id: 'einstein',
    title: 'Campo di Einstein',
    category: 'Relatività Generale',
    description: 'Equazione che lega la curvatura dello spaziotempo alla distribuzione di massa-energia',
    latex: `R_{\\mu\\nu} - \\frac{1}{2} R g_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}`
  },
  {
    id: 'taylor',
    title: 'Serie di Taylor',
    category: 'Analisi Matematica',
    description: 'Espansione polinomiale di una funzione attorno al punto a',
    latex: `f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x - a)^n`
  },
  {
    id: 'fourier',
    title: 'Serie di Fourier',
    category: 'Analisi Matematica',
    description: 'Decomposizione di un segnale periodico in armoniche sinusoidali',
    latex: `f(t) = \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} \\left[ a_n \\cos\\left(\\frac{2\\pi n t}{T}\\right) + b_n \\sin\\left(\\frac{2\\pi n t}{T}\\right) \\right]`
  },
  {
    id: 'bayes',
    title: 'Teorema di Bayes',
    category: 'Probabilità',
    description: 'Calcolo della probabilità a posteriori di una causa dato l\'effetto osservato',
    latex: `P(A \\mid B) = \\frac{P(B \\mid A) \\, P(A)}{P(B)}`
  },
  {
    id: 'matrix-mult',
    title: 'Prodotto di Matrici 2x2',
    category: 'Algebra Lineare',
    description: 'Prodotto righe per colonne tra matrici quadrate',
    latex: `\\begin{pmatrix}
  a & b \\\\
  c & d
\\end{pmatrix}
\\begin{pmatrix}
  e & f \\\\
  g & h
\\end{pmatrix}
=
\\begin{pmatrix}
  ae + bg & af + bh \\\\
  ce + dg & cf + dh
\\end{pmatrix}`
  },
  {
    id: 'cauchy-schwarz',
    title: 'Disuguaglianza di Cauchy-Schwarz',
    category: 'Geometria & Spazi Vettoriali',
    description: 'Relazione tra prodotto scalare e norme dei vettori',
    latex: `|\\langle \\mathbf{u}, \\mathbf{v} \\rangle|^2 \\leq \\langle \\mathbf{u}, \\mathbf{u} \\rangle \\cdot \\langle \\mathbf{v}, \\mathbf{v} \\rangle`
  }
];
