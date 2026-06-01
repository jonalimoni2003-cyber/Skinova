export interface SkinScores {
  acne: number;
  pores: number;
  pigmentation: number;
  wrinkles: number;
  texture: number;
  dryness: number;
  darkCircles: number;
}

export interface SkincareStep {
  step: string;
  desc: string;
}

export interface SkinScan {
  scanId: string;
  email: string;
  timestamp: string;
  skinType: string;
  skinAge: number;
  summary: string;
  scores: SkinScores;
  ingredients: string[];
  morningRoutine: SkincareStep[];
  nightRoutine: SkincareStep[];
}

export interface AuthenticatedUser {
  email: string;
  name?: string;
  token?: string;
  isPro?: boolean;
  isAdmin?: boolean;
}
