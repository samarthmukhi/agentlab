import { conceptByName } from "./curriculum";
import { buildReviewQueue } from "./scoring";
import type { AppState, ReviewItem } from "./types";

function conceptToId(name: string): string {
  return conceptByName(name)?.id ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function conceptToDay(name: string): string {
  return conceptByName(name)?.dayId ?? "day-1";
}

export function reviewQueue(state: AppState): ReviewItem[] {
  return buildReviewQueue(
    state.results,
    conceptToId,
    conceptToDay,
    state.reviewOverrides,
  );
}
