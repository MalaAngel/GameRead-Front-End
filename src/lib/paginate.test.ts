import { describe, expect, it } from 'vitest';
import { paginate } from './paginate';

const sample = `One two three four five. Six seven eight nine ten. Eleven twelve thirteen.

Fourteen fifteen sixteen seventeen. Eighteen nineteen twenty. Twenty-one twenty-two.

Last short paragraph here. And another sentence. And one more to be sure.`;

describe('paginate', () => {
  it('returns exactly the requested number of spreads with two columns each', () => {
    const pages = paginate(sample, 4);
    expect(pages).toHaveLength(4);
    pages.forEach((p) => expect(p).toHaveLength(2));
  });
  it('keeps every word', () => {
    const pages = paginate(sample, 3);
    const joined = pages.flat().flat().map((p) => p.text).join(' ').split(/\s+/).length;
    expect(joined).toBe(sample.split(/\s+/).filter(Boolean).length);
  });
  it('still returns the requested spread count when there is very little text', () => {
    expect(paginate('Tiny.', 5)).toHaveLength(5);
  });
});
