import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(private http: HttpClient) {}

  getByTweet(tweetId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`/api/comments?tweetId=${tweetId}`);
  }

  create(tweetId: number, content: string): Observable<any> {
    return this.http.post<any>('/api/comments', { tweetId, content });
  }

  delete(commentId: number): Observable<any> {
    return this.http.delete<any>(`/api/comments/${commentId}`);
  }
}
