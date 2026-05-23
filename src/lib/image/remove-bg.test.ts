import { describe, it, expect } from 'vitest';

describe('removeBackgroundFromImage', () => {
  it('exports a function', async () => {
    const { removeBackgroundFromImage } = await import('./remove-bg');
    expect(removeBackgroundFromImage).toBeInstanceOf(Function);
  });
});
