import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RewardService {
  private rewardMinutesSubject = new BehaviorSubject<number>(0);
  rewardMinutes$ = this.rewardMinutesSubject.asObservable();

  constructor() {
    // Load initial value from localStorage
    const savedMinutes = localStorage.getItem('rewardMinutes');
    if (savedMinutes) {
      this.rewardMinutesSubject.next(parseInt(savedMinutes, 10));
    }
  }

  getRewardMinutes(): number {
    return this.rewardMinutesSubject.value;
  }

  addRewardMinutes(minutes: number): void {
    const current = this.rewardMinutesSubject.value;
    const newTotal = current + minutes;
    this.rewardMinutesSubject.next(newTotal);
    localStorage.setItem('rewardMinutes', newTotal.toString());
  }

  subtractRewardMinutes(minutes: number): void {
    const current = this.rewardMinutesSubject.value;
    const newTotal = Math.max(0, current - minutes);
    this.rewardMinutesSubject.next(newTotal);
    localStorage.setItem('rewardMinutes', newTotal.toString());
  }

  resetRewardMinutes(): void {
    this.rewardMinutesSubject.next(0);
    localStorage.setItem('rewardMinutes', '0');
  }
}
