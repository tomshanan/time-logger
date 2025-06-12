export interface Activity {
  id: string;
  name: string;
  type: 'labour' | 'reward';
  ratio: number; // For labour activities: minutes needed to earn 1 reward minute
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
