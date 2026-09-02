import { describe, expect, it } from 'vitest';
import { normalizeName, similarityRatio } from './textSimilarity';

describe('normalizeName', () => {
  it('rimuove accenti, punteggiatura e maiuscole', () => {
    expect(normalizeName('Perché è così?')).toBe('perche e cosi');
  });

  it('collassa spazi multipli', () => {
    expect(normalizeName('Bar   della   Cometa')).toBe('bar della cometa');
  });
});

describe('similarityRatio', () => {
  it('è 1 per stringhe identiche', () => {
    expect(similarityRatio('vetro', 'vetro')).toBe(1);
  });

  it('è alta per un refuso singolo', () => {
    expect(similarityRatio(normalizeName('Retrobottega'), normalizeName('Retrobotega'))).toBeGreaterThan(0.85);
  });

  it('è bassa per nomi diversi', () => {
    expect(similarityRatio(normalizeName('Vetro'), normalizeName('Collegio'))).toBeLessThan(0.4);
  });
});
