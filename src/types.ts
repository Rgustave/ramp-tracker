export type ISODate = string;

export type Phase = {
  id: 1 | 2 | 3 | 4;
  name: string;
  startDay: number;
  endDay: number;
  exitCriteria: string[];
};

export type Track = 'sd' | 'ai_infra';
export type Mode = 'primary' | 'maintenance';
export type MockType = 'coding' | 'sd' | 'behavioral' | 'full_loop';

export type DayPlan = {
  dayIndex: number;
  phaseId: 1 | 2 | 3 | 4;
  weekIndex: number;
  isWeekend: boolean;
  targets: {
    dsa: { problemCount: number; patterns: string[]; targetMinutes: number };
    sdOrAi: { topic: string; track: Track; mode: Mode; resourceKey?: string };
    behavioral: { task: string };
    mock?: { type: MockType };
  };
};

export type DSAEntry = {
  id: string;
  date: ISODate;
  dayIndex: number;
  problemName: string;
  pattern: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeMinutes: number;
  solvedUnaided: boolean;
  notes?: string;
};

export type SDEntry = {
  id: string;
  date: ISODate;
  dayIndex: number;
  designName: string;
  track: Track;
  durationMinutes: number;
  selfRating: 1 | 2 | 3 | 4 | 5;
  weakAreas: string[];
  notes?: string;
};

export type BehavioralCategory =
  | 'ownership'
  | 'ambiguity'
  | 'scaling'
  | 'incident'
  | 'disagreement'
  | 'mentoring'
  | 'tech_leadership';

export type BehavioralEntry = {
  id: string;
  date: ISODate;
  dayIndex: number;
  storyId: string;
  category: BehavioralCategory;
  recorded: boolean;
  durationSeconds?: number;
  selfRating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
};

export type MockEntry = {
  id: string;
  date: ISODate;
  dayIndex: number;
  type: MockType;
  source: 'pramp' | 'peer' | 'paid' | 'self';
  outcome: 'pass' | 'borderline' | 'fail';
  feedback: string;
};

export type CommActivity =
  | 'verbal_walkthrough'
  | 'recorded_review'
  | 'whiteboard_drill'
  | 'self_intro'
  | 'other';

export type CommEntry = {
  id: string;
  date: ISODate;
  dayIndex: number;
  activity: CommActivity;
  topic: string;
  durationMinutes: number;
  recorded: boolean;
  selfRating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
};

export type DayLog = {
  dayIndex: number;
  date: ISODate;
  hoursLogged: number;
  completed: boolean;
  trackRatings: { dsa?: number; sd?: number; ai?: number; behavioral?: number; comm?: number };
  notes?: string;
};

export type Story = {
  id: string;
  category: BehavioralCategory;
  title: string;
  starOutline: { situation: string; task: string; action: string; result: string };
  rehearsalCount: number;
  lastRehearsed?: ISODate;
  strength: 1 | 2 | 3 | 4 | 5;
};

export type Settings = {
  id: 'singleton';
  startDate: ISODate;
  seeded: boolean;
};

export type ResourceLink = {
  title: string;
  url: string;
  type: string;
  cost?: string;
  estimatedMinutes?: number;
  whyThisOne: string;
};

export type ResourceEntry = {
  conceptSummary: string;
  resources: ResourceLink[];
};

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type Warning = {
  severity: Severity;
  message: string;
};

export const BEHAVIORAL_CATEGORIES: BehavioralCategory[] = [
  'ownership',
  'ambiguity',
  'scaling',
  'incident',
  'disagreement',
  'mentoring',
  'tech_leadership',
];
