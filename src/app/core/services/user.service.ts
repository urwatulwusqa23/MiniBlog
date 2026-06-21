import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Tweet } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>('/api/users/me');
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http.put<any>('/api/users/me', formData);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }

  getUserTweets(userId: number): Observable<Tweet[]> {
    return this.http.get<Tweet[]>(`/api/users/${userId}/tweets`);
  }

  searchUsers(q: string): Observable<User[]> {
    return this.http.get<User[]>(`/api/users?q=${encodeURIComponent(q)}`);
  }

  follow(userId: number): Observable<any> {
    return this.http.post<any>(`/api/users/${userId}/follow`, {});
  }

  unfollow(userId: number): Observable<any> {
    return this.http.delete<any>(`/api/users/${userId}/follow`);
  }

  isFollowing(userId: number): Observable<{ isFollowing: boolean }> {
    return this.http.get<{ isFollowing: boolean }>(`/api/users/${userId}/is-following`);
  }

  getFollowers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users/me/followers');
  }

  getFollowing(): Observable<User[]> {
    return this.http.get<User[]>('/api/users/me/following');
  }

  getUserFollowers(userId: number): Observable<User[]> {
    return this.http.get<User[]>(`/api/users/${userId}/followers`);
  }

  getUserFollowing(userId: number): Observable<User[]> {
    return this.http.get<User[]>(`/api/users/${userId}/following`);
  }

  avatarUrl(pic: string | null | undefined): string {
    if (!pic || pic === 'default-profile.png') return '/assets/default-avatar.svg';
    if (pic.startsWith('/') || pic.startsWith('http')) return pic;
    return `/Profiles/${pic}`;
  }
}
