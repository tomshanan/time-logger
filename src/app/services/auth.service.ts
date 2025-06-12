import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, User, authState } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  user$ = this.userSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    // Initialize with any existing auth state
    const currentUser = auth.currentUser;
    if (currentUser) {
      this.userSubject.next(currentUser);
      this.isAuthenticatedSubject.next(true);
    }

    // Listen for auth state changes
    authState(this.auth).subscribe((user) => {
      this.userSubject.next(user);
      this.isAuthenticatedSubject.next(!!user);

      if (user) {
        // If user is logged in and on the login page, redirect to home
        if (window.location.pathname === '/login') {
          this.router.navigate(['/']);
        }
      } else {
        // If user is logged out and not on the login page, redirect to login
        if (window.location.pathname !== '/login') {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser || this.userSubject.value;
  }
}
