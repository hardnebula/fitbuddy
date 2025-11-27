export interface OnboardingData {
  goal?: string;
  activityStyle?: string;
  accountability?: string;
  personality?: string;
  trainingTime?: string;
  profile?: {
    name: string;
    photo: string | null;
  };
  completedAt?: number;
}

