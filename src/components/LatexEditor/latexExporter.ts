import katex from 'katex';
import katexCssRaw from 'katex/dist/katex.min.css?raw';

// Rimuovi le regole @font-face con percorsi relativi per evitare blocchi di sicurezza/CORS dentro le immagini SVG
const katexCssCleaned = katexCssRaw.replace(/@font-face\s*\{[^}]*\}/g, '');

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback per ambienti non HTTPS o restrizioni
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Clipboard error:', err);
    return false;
  }
}

export function getMathML(latex: string): string {
  try {
    const raw = katex.renderToString(latex, {
      displayMode: true,
      output: 'mathml',
      throwOnError: false
    });
    // Estrai il tag <math>...</math>
    const match = raw.match(/<math[\s\S]*?<\/math>/);
    return match ? match[0] : raw;
  } catch (err) {
    console.error('MathML generation error:', err);
    return '';
  }
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

export function downloadTexFile(latex: string, filename: string = 'formula.tex') {
  const fullDocument = `% Generato dall'Editor LaTeX Online
\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{amsfonts}
\\usepackage{bm}

\\begin{document}

\\[
${latex}
\\]

\\end{document}
`;
  downloadFile(fullDocument, filename, 'text/x-tex;charset=utf-8');
}

export async function exportToPNG(
  element: HTMLElement,
  options: {
    backgroundColor?: string;
    textColor?: string;
    padding?: number;
    scale?: number;
    filename?: string;
  } = {}
): Promise<boolean> {
  const {
    backgroundColor = '#181825',
    textColor = '#ffffff',
    padding = 32,
    scale = 2.5,
    filename = 'formula.png'
  } = options;

  try {
    // Clona il nodo KaTeX
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.transform = 'none';
    clone.style.color = textColor;
    clone.style.display = 'inline-block';
    clone.style.margin = '0';

    // Rimuovi la parte MathML interna se presente perché KaTeX ha già .katex-html
    const mathmlPart = clone.querySelector('.katex-mathml');
    if (mathmlPart) {
      mathmlPart.remove();
    }

    // Calcola le dimensioni reali non scalate
    const rect = element.getBoundingClientRect();
    const width = Math.max(Math.ceil(rect.width) + padding * 2, 240);
    const height = Math.max(Math.ceil(rect.height) + padding * 2, 120);

    const isTransparent = backgroundColor === 'transparent' || !backgroundColor;
    const bgRect = isTransparent ? '' : `<rect width="${width}" height="${height}" fill="${backgroundColor}" rx="8"/>`;

    // Serializzazione XML valida e sicura
    const serializer = new XMLSerializer();
    const xmlContent = serializer.serializeToString(clone);

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <style>
        ${katexCssCleaned}
        .png-export-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          padding: ${padding}px;
          color: ${textColor};
          font-family: 'KaTeX_Main', 'Times New Roman', serif;
        }
      </style>
      ${bgRect}
      <foreignObject width="${width}" height="${height}">
        <div xmlns="http://www.w3.org/1999/xhtml" class="png-export-container">
          ${xmlContent}
        </div>
      </foreignObject>
    </svg>`;

    const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);
    const img = new Image();

    return new Promise((resolve) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(width * scale);
          canvas.height = Math.round(height * scale);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(false);
            return;
          }

          ctx.scale(scale, scale);

          if (!isTransparent) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Prova salvataggio via toBlob
          canvas.toBlob((blob) => {
            if (blob) {
              const downloadUrl = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = downloadUrl;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(downloadUrl);
                resolve(true);
              }, 200);
            } else {
              // Fallback toDataURL se toBlob restituisce null
              try {
                const dataUrl = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => document.body.removeChild(a), 200);
                resolve(true);
              } catch (err) {
                console.error('toDataURL error:', err);
                resolve(false);
              }
            }
          }, 'image/png');
        } catch (err) {
          console.error('Canvas draw error:', err);
          resolve(false);
        }
      };

      img.onerror = (err) => {
        console.error('Image load error for PNG:', err);
        resolve(false);
      };

      img.src = dataUri;
    });
  } catch (err) {
    console.error('PNG Export error:', err);
    return false;
  }
}

export function exportToSVG(
  element: HTMLElement,
  options: {
    backgroundColor?: string;
    textColor?: string;
    padding?: number;
    filename?: string;
  } = {}
) {
  const {
    backgroundColor = 'transparent',
    textColor = '#ffffff',
    padding = 24,
    filename = 'formula.svg'
  } = options;

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.color = textColor;
  clone.style.display = 'inline-block';
  clone.style.margin = '0';

  const mathmlPart = clone.querySelector('.katex-mathml');
  if (mathmlPart) {
    mathmlPart.remove();
  }

  const rect = element.getBoundingClientRect();
  const width = Math.max(Math.ceil(rect.width) + padding * 2, 240);
  const height = Math.max(Math.ceil(rect.height) + padding * 2, 120);
  const isTransparent = backgroundColor === 'transparent' || !backgroundColor;
  const bgRect = isTransparent ? '' : `<rect width="${width}" height="${height}" fill="${backgroundColor}" rx="8" />`;

  const serializer = new XMLSerializer();
  const xmlContent = serializer.serializeToString(clone);

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    ${katexCssCleaned}
    .svg-export-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${textColor};
      font-family: 'KaTeX_Main', serif;
      box-sizing: border-box;
      padding: ${padding}px;
    }
  </style>
  ${bgRect}
  <foreignObject width="${width}" height="${height}">
    <div xmlns="http://www.w3.org/1999/xhtml" class="svg-export-container">
      ${xmlContent}
    </div>
  </foreignObject>
</svg>`;

  downloadFile(svgContent, filename, 'image/svg+xml;charset=utf-8');
}

export function printFormula(latex: string, renderedHtml: string) {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Stampa Formula LaTeX</title>
        <!-- SRI: se il contenuto CDN fosse compromesso il browser rifiuta il download -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css" crossorigin="anonymous" integrity="sha384-zh0CIslj+VczCZtlzBcjt5ppRcsAmDnRem7ESsYwWwg3m/OaJ2l4x7YBZl9Kxxib">
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            margin: 40px;
            color: #111;
            background: #fff;
          }
          .header {
            border-bottom: 2px solid #ff8c00;
            padding-bottom: 12px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            color: #ff8c00;
          }
          .meta {
            font-size: 12px;
            color: #666;
          }
          .formula-box {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px 20px;
            border: 1px dashed #ccc;
            border-radius: 8px;
            margin-bottom: 30px;
            font-size: 1.5rem;
          }
          .code-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 16px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 13px;
            white-space: pre-wrap;
            color: #334155;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Formula LaTeX</div>
          <div class="meta">Generato il ${new Date().toLocaleDateString('it-IT')}</div>
        </div>
        <div class="formula-box">
          ${renderedHtml}
        </div>
        <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Sorgente LaTeX</h3>
        <div class="code-box">${latex.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 400);
}

