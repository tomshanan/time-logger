import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export const authGuard = () => {
  const router = inject(Router);
  const auth = inject(Auth);

  // Check if there's a current user immediately
  if (auth.currentUser) {
    return true;
  }

  // If no current user, redirect to login
  router.navigate(['/login']);
  return false;
};
