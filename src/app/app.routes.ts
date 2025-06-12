import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'activities',
    pathMatch: 'full'
  },
  {
    path: 'time-logs',
    loadComponent: () => import('./features/time-logs/time-logs.component').then(m => m.TimeLogsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'time-logs/new',
    loadComponent: () => import('./features/time-logs/time-log-form/time-log-form.component').then(m => m.TimeLogFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'activities',
    loadComponent: () => import('./features/activities/activities.component').then(m => m.ActivitiesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  }
];
