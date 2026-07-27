// Shared TypeScript types for the Duolingo clone

export type ExerciseType =
  | 'multiple_choice'
  | 'translate_wordbank'
  | 'match_pairs'
  | 'fill_blank'
  | 'type_answer';

export interface User {
  id: string;
  name: string;
  avatar: string;
  createdAt: string;
  xp: number;
  streak: number;
  lastActive: string | null;
  hearts: number;
  maxHearts: number;
  heartsRegenAt: string | null;
  gems: number;
  dailyGoal: number;
  dailyXp: number;
  dailyXpDate: string;
  language: string;
  theme: 'light' | 'dark';
  skillProgress: Record<string, { crowns: number; lessonsCompleted: number }>;
  lessonProgress: Record<string, { completed: boolean; mistakes: number; timeSec: number }>;
  achievements: string[];
}

export interface SkillNodeData {
  id: string;
  title: string;
  icon: string;
  description: string;
  totalLessons: number;
  lessonsCompleted: number;
  crowns: number;
  unlocked: boolean;
  finished: boolean;
  activeLessonId: string | null;
  lessons: { id: string; title: string; completed: boolean }[];
}

export interface Unit {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  colorDark: string;
  skills: SkillNodeData[];
}

export interface Course {
  id: string;
  language: string;
  languageCode: string;
  flag: string;
  units: Unit[];
}

export interface ExerciseBase {
  id: string;
  type: ExerciseType;
  prompt?: string;
  translation?: string;
  hint?: string;
  options?: { text: string; img?: string }[] | string[];
  wordBank?: string[];
  sentence?: string;
  lefts?: string[];
  rights?: string[];
  pairsCount?: number;
}

export interface Lesson {
  id: string;
  title: string;
  skill: { id: string; title: string; color: string; colorDark: string };
  exercises: ExerciseBase[];
  legendary?: boolean;
}

export interface AnswerResult {
  correct: boolean;
  correctAnswer: any;
  hearts: number;
  translation: string | null;
}

export interface LeaderboardData {
  league: string;
  users: { id: string; name: string; avatar: string; xp: number; isMe?: boolean }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
}
