import { UserDesign } from '@/types';

const STORAGE_KEY = 'cyber_light_show_designs';

export function saveDesign(design: UserDesign): void {
  const designs = loadAllDesigns();
  const index = designs.findIndex(d => d.id === design.id);
  if (index >= 0) {
    designs[index] = { ...design, updatedAt: new Date().toISOString() };
  } else {
    designs.push(design);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
}

export function loadAllDesigns(): UserDesign[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function loadDesign(id: string): UserDesign | null {
  const designs = loadAllDesigns();
  return designs.find(d => d.id === id) || null;
}

export function deleteDesign(id: string): void {
  const designs = loadAllDesigns().filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
}
