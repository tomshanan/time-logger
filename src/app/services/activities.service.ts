import { Injectable } from '@angular/core';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  limit,
  getDoc,
  Firestore,
  onSnapshot,
} from '@angular/fire/firestore';
import { Activity } from '../models/activity.model';
import { TimeLog } from '../models/time-log.model';
import { AuthService } from './auth.service';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActivitiesService {
  private userId: string = '';
  private _availableRewardMinutes = new BehaviorSubject<number>(0);
  private activitiesSubject = new BehaviorSubject<Activity[]>([]);
  private unsubscribeActivities?: () => void;

  constructor(private auth: AuthService, private firestore: Firestore) {
    this.auth.user$.subscribe((user) => {
      this.userId = user?.uid || '';
      if (this.userId) {
        this.setupActivitiesListener();
        this.loadAvailableRewardMinutes();
      } else {
        this.activitiesSubject.next([]);
        if (this.unsubscribeActivities) {
          this.unsubscribeActivities();
        }
      }
    });
  }

  activities(): Observable<Activity[]> {
    return this.activitiesSubject.asObservable();
  }

  private setupActivitiesListener(): void {
    const activitiesRef = collection(this.firestore, 'activities');
    const q = query(
      activitiesRef,
      where('userId', '==', this.userId),
      orderBy('createdAt', 'desc')
    );

    // Unsubscribe from previous listener if it exists
    if (this.unsubscribeActivities) {
      this.unsubscribeActivities();
    }

    // Set up real-time listener
    this.unsubscribeActivities = onSnapshot(
      q,
      (snapshot) => {
        const activities = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Activity)
        );
        this.activitiesSubject.next(activities);
      },
      (error) => {
        console.error('Error listening to activities:', error);
        this.activitiesSubject.next([]);
      }
    );
  }

  async logTime(activityId: string, minutes: number): Promise<void> {
    const activity = await this.getActivityById(activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }

    const rewardMinutes =
      activity.type === 'labour'
        ? Math.floor(minutes / activity.ratio)
        : minutes * activity.ratio;

    const timeLog: Omit<TimeLog, 'id'> = {
      activityId,
      activityName: activity.name,
      type: activity.type,
      minutes,
      rewardMinutes,
      loggedAt: new Date(),
      userId: this.userId,
    };

    await addDoc(collection(this.firestore, 'timeLogs'), timeLog);
    await this.loadAvailableRewardMinutes();
  }

  async deleteTimeLog(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'timeLogs', id);
    await deleteDoc(docRef);
    await this.loadAvailableRewardMinutes();
  }

  private async getActivityById(id: string): Promise<Activity | null> {
    const docRef = doc(collection(this.firestore, 'activities'), id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Activity;
  }

  async createActivity(activity: Partial<Activity>): Promise<string> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User must be authenticated');

    const newActivity: Omit<Activity, 'id'> = {
      name: activity.name!,
      type: activity.type!,
      ratio: activity.ratio || 1,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(
      collection(this.firestore, 'activities'),
      newActivity
    );
    return docRef.id;
  }

  async updateActivity(id: string, activity: Partial<Activity>): Promise<void> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User must be authenticated');

    const updateData: Partial<Activity> & { updatedAt: Date } = {
      ...activity,
      updatedAt: new Date(),
    };

    const docRef = doc(this.firestore, 'activities', id);
    await updateDoc(docRef, updateData);
  }

  async deleteActivity(id: string): Promise<void> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User must be authenticated');

    const docRef = doc(this.firestore, 'activities', id);
    await deleteDoc(docRef);
  }

  availableRewardMinutes(): Observable<number> {
    return this._availableRewardMinutes.asObservable();
  }

  private async loadAvailableRewardMinutes(): Promise<void> {
    const logs = await this.getRecentLogs();
    const total = logs.reduce(
      (sum, log) =>
        sum + (log.type === 'labour' ? log.rewardMinutes : -log.rewardMinutes),
      0
    );
    this._availableRewardMinutes.next(total);
  }

  async getRecentLogs(): Promise<TimeLog[]> {
    const logsRef = collection(this.firestore, 'timeLogs');
    const q = query(
      logsRef,
      where('userId', '==', this.userId),
      orderBy('loggedAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        loggedAt: (data['loggedAt'] as Timestamp).toDate(),
      } as TimeLog;
    });
  }
}
