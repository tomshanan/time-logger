import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { TimeLog } from '../../models/time-log.model';
import { ActivitiesService } from '../../services/activities.service';

@Component({
  selector: 'app-time-logs',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatSnackBarModule,
    MatCardModule
  ],
  templateUrl: './time-logs.component.html',
  styleUrls: ['./time-logs.component.scss']
})
export class TimeLogsComponent implements OnInit {
  timeLogs: TimeLog[] = [];
  displayedColumns: string[] = ['date', 'activity', 'minutes', 'type', 'actions'];
  isMobile = window.innerWidth < 768;

  constructor(
    private activitiesService: ActivitiesService,
    private snackBar: MatSnackBar
  ) {}

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit(): void {
    this.loadTimeLogs();
  }

  private async loadTimeLogs(): Promise<void> {
    try {
      this.timeLogs = await this.activitiesService.getRecentLogs();
    } catch (error) {
      console.error('Error loading time logs:', error);
      this.showError('Failed to load time logs');
    }
  }

  async deleteLog(log: TimeLog): Promise<void> {
    const confirmed = window.confirm('Are you sure you want to delete this time log?');
    if (confirmed) {
      try {
        await this.activitiesService.deleteTimeLog(log.id!);
        await this.loadTimeLogs();
        this.showSuccess('Time log deleted successfully');
      } catch (error) {
        console.error('Error deleting time log:', error);
        this.showError('Failed to delete time log');
      }
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 5000, panelClass: 'error-snackbar' });
  }
}
