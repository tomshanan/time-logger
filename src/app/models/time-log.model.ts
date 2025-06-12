export interface TimeLog {
  id?: string;
  userId: string;
  activityId: string;
  activityName: string;
  type: 'labour' | 'reward';
  minutes: number;
  rewardMinutes: number;
  loggedAt: Date;
}
