import { db } from '../db/schema';
import type { Category, Place } from '../types';
import { parseCsv, rowsToCsv } from './csv';

export const BACKUP_FORMAT_VERSION = 1;

export interface BackupFile {
  version: number;
  exportedAt: string;
  categories: Category[];
  places: Place[];
}

export async function buildBackup(): Promise<BackupFile> {
  const [categories, places] = await Promise.all([db.categories.toArray(), db.places.toArray()]);
  return { version: BACKUP_FORMAT_VERSION, exportedAt: new Date().toISOString(), categories, places };
}

export async function exportJson(): Promise<string> {
  const backup = await buildBackup();
  return JSON.stringify(backup, null, 2);
}

const CSV_HEADER = [
  'id',
  'name',
  'city',
  'categories',
  'tags',
  'status',
  'lat',
  'lng',
  'address',
  'cuisine',
  'notes',
  'visitRating',
  'visitDate',
  'visitNote',
  'createdAt',
  'updatedAt',
];

export async function exportCsv(): Promise<string> {
  const places = await db.places.toArray();
  const rows = places.map((p) => [
    p.id,
    p.name,
    p.city,
    p.categories.join(';'),
    p.tags.join(';'),
    p.status,
    String(p.lat),
    String(p.lng),
    p.address ?? '',
    p.cuisine ?? '',
    p.notes,
    p.visitRating != null ? String(p.visitRating) : '',
    p.visitDate ?? '',
    p.visitNote ?? '',
    String(p.createdAt),
    String(p.updatedAt),
  ]);
  return rowsToCsv(CSV_HEADER, rows);
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  // Il BOM UTF-8 fa aprire correttamente gli accenti in Excel su Windows.
  const bom = mime.includes('csv') ? '﻿' : '';
  const blob = new Blob([bom + content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isValidPlace(v: unknown): v is Place {
  if (typeof v !== 'object' || v === null) return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.city === 'string' &&
    Array.isArray(p.categories) &&
    Array.isArray(p.tags) &&
    typeof p.status === 'string' &&
    isFiniteNumber(p.lat) &&
    isFiniteNumber(p.lng) &&
    typeof p.geocodeSource === 'string' &&
    typeof p.notes === 'string' &&
    isFiniteNumber(p.createdAt) &&
    isFiniteNumber(p.updatedAt)
  );
}

function isValidCategory(v: unknown): v is Category {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Record<string, unknown>;
  return typeof c.id === 'string' && typeof c.label === 'string' && typeof c.emoji === 'string';
}

export interface ImportJsonResult {
  importedPlaces: number;
  importedCategories: number;
  skippedPlaces: number;
  skippedCategories: number;
}

/**
 * Reimporta un backup JSON esportato dall'app. Usa "put" (non "add"): se un id
 * esiste già viene sovrascritto, così reimportare lo stesso file è ripetibile
 * senza errori di chiave duplicata. Le voci malformate vengono scartate e
 * contate, mai salvate a metà.
 */
export async function importJson(text: string): Promise<ImportJsonResult> {
  const parsed = JSON.parse(text) as Partial<BackupFile>;
  const rawPlaces = Array.isArray(parsed.places) ? parsed.places : [];
  const rawCategories = Array.isArray(parsed.categories) ? parsed.categories : [];

  const validPlaces = rawPlaces.filter(isValidPlace);
  const validCategories = rawCategories.filter(isValidCategory);

  await db.transaction('rw', db.places, db.categories, async () => {
    if (validCategories.length) await db.categories.bulkPut(validCategories);
    if (validPlaces.length) await db.places.bulkPut(validPlaces);
  });

  return {
    importedPlaces: validPlaces.length,
    importedCategories: validCategories.length,
    skippedPlaces: rawPlaces.length - validPlaces.length,
    skippedCategories: rawCategories.length - validCategories.length,
  };
}

// Riesportato per riuso nella wizard di import in blocco (formato diverso: testo libero, non backup).
export { parseCsv };
