/**
 * Minimal dependency-free PDF writer (Helvetica, US Letter) for owner
 * statements. Text, right-aligned numbers, rules, filled bars and automatic
 * page breaks — enough for a clean financial statement.
 */

// Helvetica glyph widths (AFM, per 1000 em) for ASCII 32..126.
const W = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556,
  556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556,
  556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

function clean(s: string): string {
  return s
    .replace(/[—–]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/·/g, "-")
    .replace(/[^\x20-\x7E]/g, "?");
}

export function textWidth(s: string, size: number, bold = false): number {
  let w = 0;
  for (const ch of clean(s)) w += W[ch.charCodeAt(0) - 32] ?? 556;
  return (w / 1000) * size * (bold ? 1.06 : 1);
}

const esc = (s: string) => clean(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

type TextOpts = { size?: number; bold?: boolean; align?: "left" | "right" | "center"; color?: [number, number, number] };

export class SimplePdf {
  readonly width = 612;
  readonly height = 792;
  readonly margin = 48;
  private pages: string[][] = [[]];
  /** Current cursor, measured from the top of the page. */
  y = 48;

  private get ops() {
    return this.pages[this.pages.length - 1];
  }

  newPage() {
    this.pages.push([]);
    this.y = this.margin;
  }

  /** Ensure `needed` points remain on the page, else break. */
  ensure(needed: number) {
    if (this.y + needed > this.height - this.margin) this.newPage();
  }

  text(x: number, yTop: number, s: string, o: TextOpts = {}) {
    const size = o.size ?? 10;
    let tx = x;
    if (o.align === "right") tx = x - textWidth(s, size, o.bold);
    if (o.align === "center") tx = x - textWidth(s, size, o.bold) / 2;
    const [r, g, b] = o.color ?? [0.07, 0.09, 0.15];
    const baseline = this.height - yTop - size;
    this.ops.push(`BT ${r} ${g} ${b} rg /${o.bold ? "F2" : "F1"} ${size} Tf ${tx.toFixed(2)} ${baseline.toFixed(2)} Td (${esc(s)}) Tj ET`);
  }

  /** Text truncated with "..." to fit maxWidth. */
  fitText(x: number, yTop: number, s: string, maxWidth: number, o: TextOpts = {}) {
    const size = o.size ?? 10;
    let t = clean(s);
    if (textWidth(t, size, o.bold) > maxWidth) {
      while (t.length > 1 && textWidth(`${t}...`, size, o.bold) > maxWidth) t = t.slice(0, -1);
      t = `${t}...`;
    }
    this.text(x, yTop, t, o);
  }

  line(x1: number, y1Top: number, x2: number, y2Top: number, width = 0.5, gray = 0.8) {
    this.ops.push(`${gray} G ${width} w ${x1} ${this.height - y1Top} m ${x2} ${this.height - y2Top} l S`);
  }

  rect(x: number, yTop: number, w: number, h: number, rgb: [number, number, number]) {
    this.ops.push(`${rgb[0]} ${rgb[1]} ${rgb[2]} rg ${x} ${this.height - yTop - h} ${w} ${h} re f`);
  }

  toBuffer(footer?: (page: number, total: number) => string): Buffer {
    const total = this.pages.length;
    if (footer) {
      this.pages.forEach((ops, i) => {
        const s = footer(i + 1, total);
        ops.push(`BT 0.45 0.45 0.5 rg /F1 8 Tf ${this.margin} 24 Td (${esc(s)}) Tj ET`);
      });
    }
    const objects: string[] = [];
    const add = (body: string) => { objects.push(body); return objects.length; };
    const catalogId = add(""); // placeholder
    const pagesId = add("");
    const f1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    const f2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    const pageIds: number[] = [];
    for (const ops of this.pages) {
      const content = ops.join("\n");
      const contentId = add(`<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`);
      pageIds.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${this.width} ${this.height}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${contentId} 0 R >>`));
    }
    objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

    let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
    const offsets: number[] = [];
    objects.forEach((body, i) => {
      offsets.push(Buffer.byteLength(out, "latin1"));
      out += `${i + 1} 0 obj\n${body}\nendobj\n`;
    });
    const xref = Buffer.byteLength(out, "latin1");
    out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const o of offsets) out += `${String(o).padStart(10, "0")} 00000 n \n`;
    out += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    return Buffer.from(out, "latin1");
  }
}
