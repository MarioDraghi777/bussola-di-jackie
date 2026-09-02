import { signal } from '@preact/signals';
import type { Category } from '../types';
import * as db from '../db/categories';

export const categories = signal<Category[]>([]);

export async function reloadCategories(): Promise<void> {
  categories.value = await db.listCategories();
}

export async function initCategories(): Promise<void> {
  await db.ensureCategoriesSeeded();
  await reloadCategories();
}

export async function addCategory(label: string, emoji: string, color: string): Promise<void> {
  const id = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  await db.addCategory({ id: id || `cat_${Date.now()}`, label, emoji, color });
  await reloadCategories();
}

export async function updateCategory(id: string, changes: Partial<Pick<Category, 'label' | 'emoji' | 'color'>>): Promise<void> {
  await db.updateCategory(id, changes);
  await reloadCategories();
}

export async function deleteCategory(id: string): Promise<void> {
  await db.deleteCategory(id);
  await reloadCategories();
}

export function categoryById(id: string): Category | undefined {
  return categories.value.find((c) => c.id === id);
}
