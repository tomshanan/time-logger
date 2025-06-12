import { Pipe, PipeTransform } from '@angular/core';
import { Activity } from '../../models/activity.model';

@Pipe({
  name: 'activityFilter',
  standalone: true
})
export class ActivityFilterPipe implements PipeTransform {
  transform(activities: Activity[], type: 'labour' | 'reward'): Activity[] {
    if (!activities) return [];
    return activities.filter(activity => activity.type === type);
  }
}
