import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message, Contact } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MessageService {
  constructor(private http: HttpClient) {}

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>('/api/messages/contacts');
  }

  getConversation(contactId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`/api/messages?contactId=${contactId}`);
  }

  send(contactId: number, content: string): Observable<any> {
    return this.http.post<any>('/api/messages', { contactId, content });
  }

  markAsRead(messageId: number): Observable<any> {
    return this.http.put<any>(`/api/messages/${messageId}/read`, {});
  }
}
