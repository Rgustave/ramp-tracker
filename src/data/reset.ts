import { db, SETTINGS_ID } from './db';
import { ensureSeeded } from './seed';

// Tables whose rows are day-scoped (keyed by/queryable on dayIndex).
const DAY_SCOPED_TABLES = [
  db.dsaEntries,
  db.sdEntries,
  db.behavioralEntries,
  db.mockEntries,
  db.commEntries,
] as const;

/**
 * The highest dayIndex that has been marked complete, or 0 if none.
 * This is the natural "keep through here" point for a partial reset.
 */
export async function lastCompletedDayIndex(): Promise<number> {
  const logs = await db.dayLogs.toArray();
  const completed = logs.filter((l) => l.completed).map((l) => l.dayIndex);
  return completed.length ? Math.max(...completed) : 0;
}

/**
 * Delete every logged entry and day log after `keepThroughDayIndex`, keeping
 * all progress up to and including that day. Settings (start date) and
 * behavioral stories are left untouched, so you resume from the next day.
 */
export async function resetAfterDay(keepThroughDayIndex: number): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.dsaEntries,
      db.sdEntries,
      db.behavioralEntries,
      db.mockEntries,
      db.commEntries,
      db.dayLogs,
    ],
    async () => {
      for (const table of DAY_SCOPED_TABLES) {
        await table.where('dayIndex').above(keepThroughDayIndex).delete();
      }
      await db.dayLogs.where('dayIndex').above(keepThroughDayIndex).delete();
    }
  );
}

/**
 * Wipe all user data and return the app to its first-run state. The plan,
 * phases, and story templates are re-seeded against `newStartDate`.
 */
export async function startOver(newStartDate?: string): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.dsaEntries,
      db.sdEntries,
      db.behavioralEntries,
      db.mockEntries,
      db.commEntries,
      db.dayLogs,
      db.stories,
      db.settings,
      db.plans,
      db.phases,
    ],
    async () => {
      await Promise.all([
        db.dsaEntries.clear(),
        db.sdEntries.clear(),
        db.behavioralEntries.clear(),
        db.mockEntries.clear(),
        db.commEntries.clear(),
        db.dayLogs.clear(),
        db.stories.clear(),
        db.plans.clear(),
        db.phases.clear(),
        db.settings.delete(SETTINGS_ID),
      ]);
    }
  );

  // If a start date was supplied, re-seed immediately; otherwise the app falls
  // back to the FirstRun screen where the user picks one.
  if (newStartDate) {
    await ensureSeeded(newStartDate);
  }
}
