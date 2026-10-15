export interface Para { text: string; /** true when this paragraph continues from the previous column */ cont: boolean }
/** One column of reader text. */
export type Column = Para[];

const wordCount = (s: string): number => s.split(/\s+/).filter(Boolean).length;

/** Breaks a paragraph into sentences, and very long sentences further at ; : , so columns balance well. */
function unitsOf(paragraph: string): string[] {
  const sentences = paragraph.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g)?.map((s) => s.trim()) ?? [paragraph];
  return sentences.flatMap((s) => {
    if (wordCount(s) <= 28) return [s];
    const parts = s.split(/(?<=[;:,])\s+/);
    const out: string[] = [];
    let buf = '';
    for (const part of parts) {
      buf = buf ? `${buf} ${part}` : part;
      if (wordCount(buf) >= 14) { out.push(buf); buf = ''; }
    }
    if (buf) out.push(buf);
    return out;
  });
}

/**
 * Splits plain text (paragraphs separated by blank lines) into `spreads` two-column spreads
 * with balanced word counts, breaking only at sentence/clause boundaries.
 * Returns exactly `spreads` entries of [leftColumn, rightColumn].
 */
export function paginate(text: string, spreads: number): [Column, Column][] {
  const totalCols = Math.max(1, spreads) * 2;
  const paragraphs = text.trim().split(/\n\s*\n/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const units = paragraphs.flatMap((p) => unitsOf(p).map((u, i) => ({ text: u, first: i === 0 })));

  let remainingWords = units.reduce((n, u) => n + wordCount(u.text), 0);
  const cols: Column[] = [];
  let current: Column = [];
  let currentWords = 0;

  for (const unit of units) {
    const w = wordCount(unit.text);
    const colsLeft = totalCols - cols.length;
    const target = remainingWords / colsLeft;
    // close the column if adding this unit would overshoot the target by more than leaving it out undershoots
    if (currentWords > 0 && colsLeft > 1 && currentWords + w - target > target - currentWords) {
      cols.push(current);
      current = [];
      currentWords = 0;
    }
    const last = current[current.length - 1];
    if (last && !unit.first) {
      last.text += ' ' + unit.text;
    } else {
      current.push({ text: unit.text, cont: !unit.first && current.length === 0 });
    }
    currentWords += w;
    remainingWords -= w;
  }
  cols.push(current);
  while (cols.length < totalCols) cols.push([]);

  const pages: [Column, Column][] = [];
  for (let i = 0; i < totalCols; i += 2) pages.push([cols[i], cols[i + 1]]);
  return pages;
}
