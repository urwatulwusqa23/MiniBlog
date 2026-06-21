import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Tweet, TweetViewModel } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TweetService {
  constructor(private http: HttpClient) {}

  getFeed(): Observable<TweetViewModel[]> {
    return this.http.get<TweetViewModel[]>('/api/tweets');
  }

  create(content: string): Observable<any> {
    return this.http.post<any>('/api/tweets', { content });
  }

  getById(id: number): Observable<{ tweet: Tweet; user: any; isLiked: boolean }> {
    return this.http.get<{ tweet: Tweet; user: any; isLiked: boolean }>(`/api/tweets/${id}`);
  }

  update(id: number, content: string): Observable<any> {
    return this.http.put<any>(`/api/tweets/${id}`, { content });
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`/api/tweets/${id}`);
  }

  toggleLike(id: number): Observable<{ success: boolean; isLiked: boolean; likesCount: number }> {
    return this.http.post<any>(`/api/tweets/${id}/like`, {});
  }

  getLikers(id: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/tweets/${id}/likers`);
  }
}
