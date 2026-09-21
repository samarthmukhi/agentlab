import type { Question } from "../types";
import { day1 } from "./day1";
import { day2 } from "./day2";
import { day3 } from "./day3";
import { day4 } from "./day4";
import { day5 } from "./day5";
import { day6 } from "./day6";
import { day7 } from "./day7";
import { day8 } from "./day8";
import { day9 } from "./day9";

export const QUESTION_BANK: Question[] = [
  ...day1,
  ...day2,
  ...day3,
  ...day4,
  ...day5,
  ...day6,
  ...day7,
  ...day8,
  ...day9,
];

export function questionsForDay(dayId: string): Question[] {
  return QUESTION_BANK.filter((q) => q.dayId === dayId);
}

export function questionById(id: string): Question | undefined {
  return QUESTION_BANK.find((q) => q.id === id);
}

export const BANK_COUNTS: Record<string, number> = QUESTION_BANK.reduce(
  (acc, q) => {
    acc[q.dayId] = (acc[q.dayId] ?? 0) + 1;
    return acc;
  },
  {} as Record<string, number>,
);
