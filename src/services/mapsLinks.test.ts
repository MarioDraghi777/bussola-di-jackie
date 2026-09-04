import { describe, expect, it } from 'vitest';
import {
  extractFirstUrl,
  isShortenedMapsLink,
  parseGoogleMapsLink,
  placeNameFromMapsUrl,
  shareTextToQuery,
} from './mapsLinks';

const LONG_URL =
  'https://www.google.com/maps/place/Colosseo/@41.8902142,12.4900422,17z/data=!3m1!4b1!4m6!3m5!8m2!3d41.8902102!4d12.4922309';

describe('parseGoogleMapsLink', () => {
  it('preferisce le coordinate del marker (!3d/!4d) a quelle del viewport (@)', () => {
    const parsed = parseGoogleMapsLink(LONG_URL);
    expect(parsed).toEqual({ lat: 41.8902102, lng: 12.4922309 });
  });

  it('legge le coordinate anche da un URL di consenso con continue percent-encoded', () => {
    const consent =
      'https://consent.google.com/ml?continue=https://www.google.com/maps/place/Colosseo/@41.8902142,12.4900422,17z/data%3D!3m1!4b1!8m2!3d41.8902102!4d12.4922309&gl=IT';
    expect(parseGoogleMapsLink(consent)).toEqual({ lat: 41.8902102, lng: 12.4922309 });
  });

  it('legge il parametro q=lat,lng', () => {
    expect(parseGoogleMapsLink('https://maps.google.com/?q=41.9,12.47')).toEqual({ lat: 41.9, lng: 12.47 });
  });

  it('ricade sul centro mappa quando non c’è altro', () => {
    expect(parseGoogleMapsLink('https://www.google.com/maps/@41.9028,12.4964,15z')).toEqual({ lat: 41.9028, lng: 12.4964 });
  });

  it('rifiuta coordinate fuori range invece di inventarle', () => {
    expect(parseGoogleMapsLink('https://www.google.com/maps/@999.5,12.4964,15z')).toBeNull();
  });

  it('ritorna null su un link corto non espanso', () => {
    expect(parseGoogleMapsLink('https://maps.app.goo.gl/AbCdEfGh123')).toBeNull();
  });
});

describe('isShortenedMapsLink', () => {
  it('riconosce i link di condivisione dell’app', () => {
    expect(isShortenedMapsLink('https://maps.app.goo.gl/AbCdEfGh123')).toBe(true);
    expect(isShortenedMapsLink('https://goo.gl/maps/xyz')).toBe(true);
    expect(isShortenedMapsLink(LONG_URL)).toBe(false);
  });
});

describe('extractFirstUrl', () => {
  it('trova l’URL dentro un messaggio di condivisione', () => {
    const shared = 'Bar della Cometa\nVia dei Coronari 12, Roma\nhttps://maps.app.goo.gl/AbCdEfGh123';
    expect(extractFirstUrl(shared)).toBe('https://maps.app.goo.gl/AbCdEfGh123');
  });

  it('ritorna null se non ci sono URL', () => {
    expect(extractFirstUrl('solo testo')).toBeNull();
  });
});

describe('shareTextToQuery', () => {
  it('tiene nome e indirizzo e butta via il link', () => {
    const shared = 'Bar della Cometa\nVia dei Coronari 12, Roma\nhttps://maps.app.goo.gl/AbCdEfGh123';
    expect(shareTextToQuery(shared)).toBe('Bar della Cometa, Via dei Coronari 12, Roma');
  });

  it('scarta le frasi di contorno di Google', () => {
    const shared = 'Vieni a vedere Bar della Cometa\nBar della Cometa\nVia dei Coronari 12\nhttps://maps.app.goo.gl/x';
    expect(shareTextToQuery(shared)).toBe('Bar della Cometa, Via dei Coronari 12');
  });

  it('ritorna stringa vuota se c’era solo il link', () => {
    expect(shareTextToQuery('https://maps.app.goo.gl/AbCdEfGh123')).toBe('');
  });
});

describe('placeNameFromMapsUrl', () => {
  it('estrae il nome del posto dall’URL esteso', () => {
    expect(placeNameFromMapsUrl(LONG_URL)).toBe('Colosseo');
  });

  it('non confonde le coordinate con un nome', () => {
    expect(placeNameFromMapsUrl('https://www.google.com/maps/place/41.89,12.49/@41.89,12.49,17z')).toBeUndefined();
  });
});
