import Dexie, { type Table } from 'dexie';
import type {
  DSAEntry,
  SDEntry,
  BehavioralEntry,
  MockEntry,
  CommEntry,
  DayLog,
  Story,
  Settings,
  DayPlan,
  Phase,
} from '../types';

export class RampDB extends Dexie {
  dsaEntries!: Table<DSAEntry, string>;
  sdEntries!: Table<SDEntry, string>;
  behavioralEntries!: Table<BehavioralEntry, string>;
  mockEntries!: Table<MockEntry, string>;
  commEntries!: Table<CommEntry, string>;
  dayLogs!: Table<DayLog, number>;
  stories!: Table<Story, string>;
  settings!: Table<Settings, 'singleton'>;
  plans!: Table<DayPlan, number>;
  phases!: Table<Phase, number>;

  constructor() {
    super('ramp_tracker');
    this.version(1).stores({
      dsaEntries: 'id, dayIndex, date, pattern',
      sdEntries: 'id, dayIndex, date, track',
      behavioralEntries: 'id, dayIndex, date, storyId, category',
      mockEntries: 'id, dayIndex, date, type',
      dayLogs: 'dayIndex, date, completed',
      stories: 'id, category, lastRehearsed',
      settings: 'id',
      plans: 'dayIndex, phaseId, weekIndex',
      phases: 'id',
    });
    // v2: add commEntries store. Existing tables untouched.
    this.version(2).stores({
      commEntries: 'id, dayIndex, date, activity',
    });
  }
}

export const db = new RampDB();

export const SETTINGS_ID: Settings['id'] = 'singleton';
