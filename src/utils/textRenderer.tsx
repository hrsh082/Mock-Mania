import React from 'react';

/**
 * Normalizes TeX/LaTeX expressions, math symbols, markdown bold/italic/underline,
 * and renders them cleanly as structured React components.
 */
export function formatMathAndMarkdown(text: string): string {
  if (!text) return '';

  let t = text;

  // Replace common TeX commands with clean Unicode math characters
  t = t.replace(/\\times/g, '×')
       .replace(/\\div/g, '÷')
       .replace(/\\cdot/g, '·')
       .replace(/\\pm/g, '±')
       .replace(/\\approx/g, '≈')
       .replace(/\\neq?/g, '≠')
       .replace(/\\leq?/g, '≤')
       .replace(/\\geq?/g, '≥')
       .replace(/\\degree/g, '°')
       .replace(/\^\s*\\circ/g, '°')
       .replace(/\^\\circ/g, '°')
       .replace(/\\alpha/g, 'α')
       .replace(/\\beta/g, 'β')
       .replace(/\\gamma/g, 'γ')
       .replace(/\\theta/g, 'θ')
       .replace(/\\pi/g, 'π')
       .replace(/\\angle/g, '∠')
       .replace(/\\infty/g, '∞');

  // Handle \sqrt{x} -> √(x)
  t = t.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

  // Handle \frac{a}{b} -> (a / b)
  t = t.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)');

  // Handle \mathbf{x} -> **x**
  t = t.replace(/\\mathbf\{([^}]+)\}/g, '**$1**');

  // Convert common exponents: x^2 -> x², x^3 -> x³, x^4 -> x⁴, x^5 -> x⁵, x^6 -> x⁶
  t = t.replace(/([\w\)]|\})\^2(?!\d)/g, '$1²')
       .replace(/([\w\)]|\})\^3(?!\d)/g, '$1³')
       .replace(/([\w\)]|\})\^4(?!\d)/g, '$1⁴')
       .replace(/([\w\)]|\})\^5(?!\d)/g, '$1⁵')
       .replace(/([\w\)]|\})\^6(?!\d)/g, '$1⁶');

  // Remove surrounding single $ math delimiters around formulas ($x + y = z$ -> x + y = z)
  t = t.replace(/\$([^$]+)\$/g, '$1');

  return t;
}

/**
 * Renders formatted text with support for:
 * - <u>underlined text</u> or _underlined text_
 * - **bold text**
 * - *italic text*
 * - Math superscripts <sup> and fractions
 * - Line breaks (\n)
 */
export function renderRichText(text?: string | null): React.ReactNode {
  if (!text) return null;

  const formatted = formatMathAndMarkdown(text);

  // Split lines first to preserve line breaks
  const lines = formatted.split('\n');

  return (
    <>
      {lines.map((line, lIdx) => {
        // Regex to catch <u>...</u>, <b>...</b>, **bold**, <em>...</em>, <i>...</i>, _underline/italic_, <sup>...</sup>, <sub>...</sub>
        const tokens = line.split(/(<u>.*?<\/u>|<b>.*?<\/b>|\*\*.*?\*\*|<em>.*?<\/em>|<i>.*?<\/i>|_[^_]+_|<sup>.*?<\/sup>|<sub>.*?<\/sub>)/g);

        const renderedLine = tokens.map((token, tIdx) => {
          if (!token) return null;

          // <u>underline</u>
          if (token.startsWith('<u>') && token.endsWith('</u>')) {
            return (
              <u key={tIdx} style={{ textDecoration: 'underline', textDecorationColor: 'var(--apple-blue)', textUnderlineOffset: '3px', fontWeight: 600 }}>
                {token.slice(3, -4)}
              </u>
            );
          }

          // **bold** or <b>bold</b>
          if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('<b>') && token.endsWith('</b>'))) {
            const inner = token.startsWith('**') ? token.slice(2, -2) : token.slice(3, -4);
            return <strong key={tIdx} style={{ fontWeight: 700, color: 'inherit' }}>{inner}</strong>;
          }

          // _underline / italic_ or <em>...</em> or <i>...</i>
          if ((token.startsWith('_') && token.endsWith('_')) || (token.startsWith('<em>') && token.endsWith('</em>')) || (token.startsWith('<i>') && token.endsWith('</i>'))) {
            let inner = token;
            if (token.startsWith('_')) inner = token.slice(1, -1);
            else if (token.startsWith('<em>')) inner = token.slice(4, -5);
            else if (token.startsWith('<i>')) inner = token.slice(3, -4);

            return (
              <u key={tIdx} style={{ textDecoration: 'underline', textDecorationColor: 'var(--apple-blue)', textUnderlineOffset: '3px', fontWeight: 600 }}>
                {inner}
              </u>
            );
          }

          // <sup>superscript</sup>
          if (token.startsWith('<sup>') && token.endsWith('</sup>')) {
            return <sup key={tIdx} style={{ fontSize: '0.75em', lineHeight: 0 }}>{token.slice(5, -6)}</sup>;
          }

          // <sub>subscript</sub>
          if (token.startsWith('<sub>') && token.endsWith('</sub>')) {
            return <sub key={tIdx} style={{ fontSize: '0.75em', lineHeight: 0 }}>{token.slice(5, -6)}</sub>;
          }

          return token;
        });

        return (
          <React.Fragment key={lIdx}>
            {renderedLine}
            {lIdx < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
}
