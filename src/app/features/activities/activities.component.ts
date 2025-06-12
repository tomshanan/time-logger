import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Activity } from '../../models/activity.model';
import { ActivityFilterPipe } from './activity-filter.pipe';
import { DragDropModule, DragRef, Point } from '@angular/cdk/drag-drop';
import { ActivitiesService } from '../../services/activities.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCardModule,
    ReactiveFormsModule,
    ActivityFilterPipe,
    DragDropModule,
  ],
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss'],
})
export class ActivitiesComponent implements OnInit, OnDestroy {
  activities: Activity[] = [];
  private activitiesSubscription?: Subscription;

  isDrawerOpen = false;
  activityForm: FormGroup;
  editingActivity: Activity | null = null;
  isLoggingActivity = false;
  logForm: FormGroup;
  selectedActivity: Activity | null = null;
  isDragging = false;
  isMobile = window.innerWidth < 768;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private activitiesService: ActivitiesService
  ) {
    this.activityForm = this.fb.group({
      name: ['', Validators.required],
      type: ['labour', Validators.required],
      ratio: [1, [Validators.required, Validators.min(0.1)]]
    });

    this.logForm = this.fb.group({
      minutes: [15, [Validators.required, Validators.min(1)]],
    });

    // Update isMobile on window resize
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
    });
  }

  ngOnInit(): void {
    this.activitiesSubscription = this.activitiesService.activities()
      .subscribe(activities => {
        this.activities = activities;
      });
  }

  ngOnDestroy(): void {
    if (this.activitiesSubscription) {
      this.activitiesSubscription.unsubscribe();
    }
  }

  openNewActivity(): void {
    this.editingActivity = null;
    this.isLoggingActivity = false;
    this.isDrawerOpen = true;
    this.activityForm.reset({
      type: 'labour',
      ratio: 1,
    });
  }

  openLogDrawer(activity: Activity): void {
    this.selectedActivity = activity;
    this.isLoggingActivity = true;
    this.isDrawerOpen = true;
    this.logForm.reset({ minutes: 15 });
  }

  editActivity(activity: Activity): void {
    this.editingActivity = activity;
    this.isLoggingActivity = false;
    this.isDrawerOpen = true;
    this.activityForm.patchValue({
      name: activity.name,
      type: activity.type,
      ratio: activity.ratio
    });
  }

  async deleteActivity(activity: Activity): Promise<void> {
    try {
      const confirmed = window.confirm(`Are you sure you want to delete ${activity.name}?`);
      if (!confirmed) return;
      
      await this.activitiesService.deleteActivity(activity.id);
      this.showSuccess('Activity deleted successfully');
    } catch (error) {
      console.error('Error deleting activity:', error);
      this.showError('Failed to delete activity');
    }
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.editingActivity = null;
    this.selectedActivity = null;
    this.isLoggingActivity = false;
    this.activityForm.reset();
    this.logForm.reset();
  }

  async saveActivity(): Promise<void> {
    if (this.activityForm.valid) {
      try {
        const activityData = this.activityForm.value;
        
        if (this.editingActivity) {
          await this.activitiesService.updateActivity(this.editingActivity.id, activityData);
          this.showSuccess('Activity updated successfully');
        } else {
          await this.activitiesService.createActivity(activityData);
          this.showSuccess('Activity created successfully');
        }
        
        this.closeDrawer();
      } catch (error) {
        console.error('Error saving activity:', error);
        this.showError('Failed to save activity');
      }
    }
  }

  async saveLog(): Promise<void> {
    if (this.logForm.valid && this.selectedActivity) {
      try {
        const minutes = this.logForm.value.minutes;
        const activityName = this.selectedActivity.name;
        
        await this.activitiesService.logTime(
          this.selectedActivity.id,
          minutes
        );
        this.closeDrawer();
        this.showSuccess(
          `Logged ${minutes} minutes for ${activityName}`
        );
      } catch (error) {
        console.error('Error logging time:', error);
        this.showError('Failed to log time');
      }
    }
  }

  adjustTime(minutes: number): void {
    const currentValue = this.logForm.get('minutes')?.value || 0;
    const newValue = Math.max(1, currentValue + minutes);
    this.logForm.patchValue({ minutes: newValue });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }

  constrainDrag = (
    userPointerPosition: Point,
    dragRef: DragRef,
    dimensions: DOMRect,
    pickupPositionInElement: Point
  ) => {
    if (!this.isMobile) return { x: 0, y: 0 };

    // Get the element's initial position
    const initialLeft = dimensions.left;
    
    // Calculate the drag position relative to the element's initial position
    const dragPosition = userPointerPosition.x - pickupPositionInElement.x - initialLeft;

    // Constrain x between -80 and 0, relative to the element's initial position
    return {
      x: Math.min(0, Math.max(-80, dragPosition) ) + initialLeft,
      y: 0,
    };
  };

  onDragStarted(): void {
    if (this.isMobile) {
      this.isDragging = true;
    }
  }

  onDragEnded(event: any, activity: Activity): void {
    if (this.isMobile) {
      this.isDragging = false;
      const dragDistance = event.distance.x;

      // If dragged more than halfway (-40px), trigger edit
      if (dragDistance <= -50) {
        this.editActivity(activity);
      }

      // Reset the position
      event.source.reset();
    }
  }
}
