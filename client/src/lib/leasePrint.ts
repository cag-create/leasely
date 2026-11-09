// Print / "Save as PDF" view for a rendered lease. Opens the lease HTML in a
// new tab with print styles and calls the browser print dialog from this
// window (no script is injected into the lease document). Every desktop and
// mobile browser offers "Save as PDF" in that dialog, so no server-side PDF
// renderer is needed.

const PRINT_CSS = `
  body { font-family: Georgia, "Times New Roman", serif; max-width: 7in; margin: 0 auto; padding: 0.5in 0; line-height: 1.5; color: #111; font-size: 12pt; }
  h1, h2, h3 { font-family: -apple-system, system-ui, sans-serif; }
  h1 { font-size: 18pt; margin: 0.5rem 0 0.5rem; }
  h2 { font-size: 13pt; margin: 1.1rem 0 0.4rem; page-break-after: avoid; break-after: avoid; }
  section { margin: 0.6rem 0; }
  p, li { margin: 0.4rem 0; orphans: 3; widows: 3; }
  .lease-unresolved { background: #fee; color: #b00020; padding: 0 4px; border-radius: 3px; font-weight: 600; }
  .legal-disclaimer { font-size: 9.5pt; color: #444; margin-top: 1.5rem; border-top: 1px solid #ccc; padding-top: 0.75rem; }
  .lease-print-footer { font-size: 9pt; color: #555; margin-top: 2rem; border-top: 1px solid #ccc; padding-top: 0.5rem; }
  @media print { body { padding: 0; } @page { margin: 0.75in; } }
`;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/**
 * Opens the print view. Returns false if the browser blocked the pop-up.
 * `footer` (plain text) is printed under the lease, e.g. a document fingerprint.
 */
export function openLeasePrintView(html: string, title: string, footer?: string): boolean {
  const win = window.open("", "_blank");
  if (!win) return false;
  win.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
      `<title>${escapeHtml(title)}</title><style>${PRINT_CSS}</style></head><body>${html}` +
      (footer ? `<div class="lease-print-footer">${escapeHtml(footer)}</div>` : "") +
      `</body></html>`,
  );
  win.document.close();
  win.focus();
  setTimeout(() => {
    try { win.print(); } catch { /* the user can still print from the browser menu */ }
  }, 300);
  return true;
}
