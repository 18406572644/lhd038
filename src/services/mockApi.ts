import { LightShowTemplate, UserDesign } from '@/types';
import { presetTemplates } from '@/data/presets';
import { saveDesign, loadAllDesigns, loadDesign, deleteDesign } from './storage';

function delay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getTemplates(): Promise<{ templates: LightShowTemplate[]; total: number }> {
  await delay(300);
  return { templates: presetTemplates, total: presetTemplates.length };
}

export async function getTemplateById(id: string): Promise<LightShowTemplate | null> {
  await delay(200);
  return presetTemplates.find(t => t.id === id) || null;
}

export async function saveDesignToApi(design: UserDesign): Promise<UserDesign> {
  await delay(400);
  saveDesign(design);
  return design;
}

export async function getDesigns(): Promise<UserDesign[]> {
  await delay(300);
  return loadAllDesigns();
}

export async function getDesignById(id: string): Promise<UserDesign | null> {
  await delay(200);
  return loadDesign(id);
}

export async function deleteDesignFromApi(id: string): Promise<void> {
  await delay(200);
  deleteDesign(id);
}
