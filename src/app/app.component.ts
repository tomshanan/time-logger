import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RewardService } from './services/reward.service';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { ActivitiesService } from './services/activities.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'time-logger';
  rewardMinutes = this.activitiesService.availableRewardMinutes();
  isAuthenticated$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private activitiesService: ActivitiesService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit() {

  }

  logout() {
    this.authService.logout();
  }
}
