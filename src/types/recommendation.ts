import { extractApiEntity } from "@/helper/apiResponse";

export type DietPlan = {
  breakfast?: string[];
  lunch?: string[];
  dinner?: string[];
  snacks?: string[];
  avoidFoods?: string[];
};

export type Recommendation = {
  recommendationId: number;
  advice: string;
  dietPlan?: DietPlan | null;
  lifestyleChanges?: string | null;
  createdAt?: string;
};

export function normalizeRecommendation(body: unknown): Recommendation | null {
  return extractApiEntity<Recommendation>(body, "recommendationId");
}
