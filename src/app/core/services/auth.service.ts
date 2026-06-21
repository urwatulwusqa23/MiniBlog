import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthState } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _state = signal<AuthState>({
    userId: null,
    username: null,
    profilePicture: null,
    isLoggedIn: false,
  });

  readonly isLoggedIn            = computed(() => this._state().isLoggedIn);
  readonly currentUserId         = computed(() => this._state().userId);
  readonly currentUsername       = computed(() => this._state().username);
  readonly currentProfilePicture = computed(() => this._state().profilePicture);

  constructor(private http: HttpClient, private router: Router) {
    this.restoreFromStorage();
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>('/api/auth/login', { email, password }).pipe(
      tap((r: any) => {
        const { token, user } = r;
        localStorage.setItem('token',          token);
        localStorage.setItem('userId',         String(user.id));
        localStorage.setItem('username',       user.username);
        localStorage.setItem('profilePicture', user.profilePicture ?? '');
        this._state.set({
          userId: user.id,
          username: user.username,
          profilePicture: user.profilePicture ?? null,
          isLoggedIn: true,
        });
      })
    );
  }

  signup(formData: FormData): Observable<any> {
    return this.http.post<any>('/api/auth/signup', formData);
  }

  logout(): void {
    this.http.post('/api/auth/logout', {}).subscribe({ error: () => {} });
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('profilePicture');
    this._state.set({ userId: null, username: null, profilePicture: null, isLoggedIn: false });
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  updateLocalProfile(username: string, profilePicture: string): void {
    localStorage.setItem('username',       username);
    localStorage.setItem('profilePicture', profilePicture);
    this._state.update(s => ({ ...s, username, profilePicture }));
  }

  restoreFromStorage(): void {
    const token    = localStorage.getItem('token');
    const userId   = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const pic      = localStorage.getItem('profilePicture');
    if (token && userId && username) {
      this._state.set({
        userId: Number(userId),
        username,
        profilePicture: pic ?? null,
        isLoggedIn: true,
      });
    }
  }

  setAuth(userId: number, username: string): void {
    localStorage.setItem('userId',   String(userId));
    localStorage.setItem('username', username);
    this._state.update(s => ({ ...s, userId, username, isLoggedIn: true }));
  }
}
