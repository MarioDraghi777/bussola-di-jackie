import { describe, expect, it } from 'vitest';
import { parseCsv, rowsToCsv } from './csv';

describe('rowsToCsv + parseCsv', () => {
  it('fa un giro completo con campi che contengono virgole, virgolette e newline', () => {
    const header = ['name', 'notes'];
    const rows = [
      ['Bar "Il Tondo"', 'zozzone, da provare'],
      ['Altro posto', 'nota\nsu due righe'],
    ];
    const csv = rowsToCsv(header, rows);
    const parsed = parseCsv(csv);

    expect(parsed[0]).toEqual(header);
    expect(parsed[1]).toEqual(rows[0]);
    expect(parsed[2]).toEqual(rows[1]);
  });

  it('gestisce righe semplici senza quoting superfluo', () => {
    const csv = rowsToCsv(['a', 'b'], [['1', '2']]);
    expect(csv).toBe('a,b\r\n1,2');
  });
});
