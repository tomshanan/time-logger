import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TimeLog } from '../../../models/time-log.model';
import { Activity } from '../../../models/activity.model';
import { ActivitiesService } from '../../../services/activities.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-time-log-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './time-log-form.component.html',
  styleUrls: ['./time-log-form.component.scss']
})
export class TimeLogFormComponent implements OnInit, OnDestroy {
  timeLogForm: FormGroup;
  activities: Activity[] = [];
  isEditMode = false;
  private activitiesSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activitiesService: ActivitiesService,
    private snackBar: MatSnackBar
  ) {
    this.timeLogForm = this.fb.group({
      activityId: ['', Validators.required],
      minutes: ['', [Validators.required, Validators.min(1)]],
      loggedAt: [new Date(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.activitiesSubscription = this.activitiesService.activities()
      .subscribe({
        next: (activities) => {
          this.activities = activities;
        },
        error: (error) => {
          console.error('Error loading activities:', error);
          this.showError('Failed to load activities');
        }
      });
  }

  ngOnDestroy(): void {
    if (this.activitiesSubscription) {
      this.activitiesSubscription.unsubscribe();
    }
  }

  async onSubmit(): Promise<void> {
    if (this.timeLogForm.valid) {
      try {
        const formValue = this.timeLogForm.value;
        await this.activitiesService.logTime(formValue.activityId, formValue.minutes);
        this.showSuccess('Time logged successfully');
        this.router.navigate(['/time-logs']);
      } catch (error) {
        console.error('Error logging time:', error);
        this.showError('Failed to log time');
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/time-logs']);
  }

  getActivityIcon(activity: Activity): string {
    return activity.type === 'labour' ? 'work' : 'local_cafe';
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 5000, panelClass: 'error-snackbar' });
  }
}
