
export enum Language {
  RU = 'RU',
  EN = 'EN'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}

export enum Goal {
  LOSE_WEIGHT = 'lose_weight',
  MAINTAIN = 'maintain',
  GAIN_MUSCLE = 'gain_muscle'
}

export interface NutritionGoal {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

export interface UserProfile {
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  goal: Goal;
  isOnboarded: boolean;
  nutritionGoal?: NutritionGoal;
  monthlyWorkoutGoal?: number;
}

export interface Meal {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

export interface ExerciseSet {
  reps: number;
  weight: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  name: string; // Workout Title
  exercises: Exercise[];
  notes?: string;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  amount: number; // ml
}

export interface AppState {
  language: Language;
  theme: Theme;
}
