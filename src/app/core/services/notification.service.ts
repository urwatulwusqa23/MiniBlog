import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../models/models';
import * as signalR from '@microsoft/signalr';
import { ToastService } from './toast.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private hub!: signalR.HubConnection;
  readonly unreadCount  = signal(0);
  readonly notifications = signal<Notification[]>([]);

  constructor(private http: HttpClient, private toast: ToastService) {}

  startConnection(): void {
    if (this.hub && this.hub.state !== signalR.HubConnectionState.Disconnected) return;

    const hubUrl = `${environment.apiUrl}/notificationHub`;
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem('token') ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.hub.off('ReceiveNotification');
    this.hub.on('ReceiveNotification', (payload: any) => {
      const msg  = payload.message || String(payload);
      const type = (payload.type || 'general').toLowerCase();
      const icon = type === 'like' ? '❤️' : type === 'comment' ? '💬' : type === 'follow' ? '👤' : '🔔';
      this.toast.show(`${icon} ${msg}`, 'info');
      this.unreadCount.update(c => c + 1);
      this.notifications.update(list => [{
        id: Date.now(), message: msg, type, isRead: false,
        timestamp: new Date().toISOString()
      } as any, ...list]);
    });

    this.hub.start()
      .then(() => this.refreshUnreadCount())
      .catch(err => console.warn('[SignalR]', err));
  }

  stopConnection(): void {
    this.hub?.stop().catch(() => {});
    this.hub = undefined as any;
  }

  loadAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>('/api/notifications');
  }

  refreshUnreadCount(): void {
    this.http.get<{ count: number }>('/api/notifications/unread-count').subscribe({
      next: r => this.unreadCount.set(r.count),
      error: () => {},
    });
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put<any>(`/api/notifications/${id}/read`, {});
  }
}
