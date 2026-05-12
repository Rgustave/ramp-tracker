import { db, SETTINGS_ID } from './db';
import planJson from './plan.json';
import resourcesJson from './resources.json';
import { BEHAVIORAL_CATEGORIES } from '../types';
import type { DayPlan, Phase, ResourceEntry, Story, BehavioralCategory } from '../types';

type PlanFile = { phases: Phase[]; days: DayPlan[] };
type ResourcesFile = { entries: Record<string, ResourceEntry> };

export const PLAN: PlanFile = planJson as unknown as PlanFile;
export const RESOURCES: ResourcesFile = resourcesJson as unknown as ResourcesFile;

export function getResource(key: string | undefined): ResourceEntry | undefined {
  if (!key) return undefined;
  return RESOURCES.entries[key];
}

function newStoryTemplate(category: BehavioralCategory, idx: number): Story {
  return {
    id: `story_${category}_${idx}`,
    category,
    title: `${prettyCategory(category)} story (draft)`,
    starOutline: { situation: '', task: '', action: '', result: '' },
    rehearsalCount: 0,
    strength: 1,
  };
}

export function prettyCategory(c: BehavioralCategory): string {
  return c.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export async function ensureSeeded(startDate: string): Promise<void> {
  const existing = await db.settings.get(SETTINGS_ID);
  if (existing?.seeded) return;

  await db.transaction(
    'rw',
    [db.phases, db.plans, db.stories, db.settings],
    async () => {
      await db.phases.clear();
      await db.plans.clear();
      await db.phases.bulkPut(PLAN.phases);
      await db.plans.bulkPut(PLAN.days);

      const storyCount = await db.stories.count();
      if (storyCount === 0) {
        const seedStories = BEHAVIORAL_CATEGORIES.map((c, i) => newStoryTemplate(c, i + 1));
        await db.stories.bulkAdd(seedStories);
      }

      await db.settings.put({ id: SETTINGS_ID, startDate, seeded: true });
    }
  );
}

export async function getSettings() {
  return db.settings.get(SETTINGS_ID);
}

export async function setStartDate(startDate: string) {
  const existing = await db.settings.get(SETTINGS_ID);
  if (existing) {
    await db.settings.put({ ...existing, startDate });
  } else {
    await db.settings.put({ id: SETTINGS_ID, startDate, seeded: false });
  }
}
