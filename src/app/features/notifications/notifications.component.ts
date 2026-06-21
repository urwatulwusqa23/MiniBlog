import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';
import { Notification } from '../../core/models/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-page">
      <div class="page-head">
        <h1 class="page-title">Notifications</h1>
        @if (hasUnread()) {
          <button class="btn btn-outline btn-sm" (click)="markAllRead()">
            <i class="fas fa-check-double"></i> Mark all read
          </button>
        }
      </div>

      @if (loading()) {
        <div class="notif-skeleton">
          @for (i of [1,2,3,4]; track i) {
            <div class="ns-item glass">
              <div class="skeleton ns-icon"></div>
              <div class="ns-lines">
                <div class="skeleton ns-line w70"></div>
                <div class="skeleton ns-line w40"></div>
              </div>
            </div>
          }
        </div>
      } @else if (notifications().length === 0) {
        <div class="empty-state">
          <i class="fas fa-bell-slash"></i>
          <p>All caught up!<br>Notifications from likes, comments and follows appear here.</p>
        </div>
      } @else {
        <div class="notif-list">
          @for (n of notifications(); track n.id) {
            <div class="notif-card glass" [class.unread]="!n.isRead" (click)="markRead(n)">
              <div class="notif-icon" [ngClass]="iconBg(n.type)">
                <i class="fas" [ngClass]="iconClass(n.type)"></i>
              </div>
              <div class="notif-content">
                <p class="notif-msg">{{ n.message }}</p>
                <span class="notif-time">{{ n.timestamp | date:'MMM d · h:mm a' }}</span>
              </div>
              @if (!n.isRead) {
                <div class="unread-pip"></div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .notif-page { max-width: 660px; margin: 0 auto; }

    .page-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .page-title {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      position: relative;
      &::after {
        content: '';
        position: absolute;
        left: 0; bottom: -4px;
        width: 32px; height: 3px;
        background: var(--gradient);
        border-radius: 99px;
      }
    }

    /* ── Notification cards ── */
    .notif-list { display: flex; flex-direction: column; gap: 10px; }

    .notif-card {
      display: flex;
      align-items: center;
      gap: 14px;
      border-radius: var(--radius-xl);
      padding: 16px 20px;
      cursor: pointer;
      transition: var(--transition);

      &:hover {
        border-color: rgba(139,92,246,0.3);
        transform: translateX(2px);
      }

      &.unread {
        background: rgba(139,92,246,0.07);
        border-color: rgba(139,92,246,0.2);
      }
    }

    .notif-icon {
      width: 44px; height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .bg-like    { background: rgba(244,63,94,0.15);  color: var(--like); }
    .bg-comment { background: rgba(96,165,250,0.15); color: var(--info); }
    .bg-follow  { background: rgba(34,197,94,0.15);  color: var(--success); }
    .bg-default { background: var(--surface-2);      color: var(--text-muted); }

    .notif-content { flex: 1; min-width: 0; }

    .notif-msg {
      font-size: 14px;
      color: var(--text-primary);
      line-height: 1.4;
      margin-bottom: 4px;
    }

    .notif-time { font-size: 12px; color: var(--text-muted); }

    .unread-pip {
      width: 8px; height: 8px;
      background: var(--accent);
      border-radius: 50%;
      flex-shrink: 0;
      box-shadow: 0 0 6px var(--glow);
    }

    /* ── Skeleton ── */
    .notif-skeleton { display: flex; flex-direction: column; gap: 10px; }

    .ns-item {
      display: flex;
      align-items: center;
      gap: 14px;
      border-radius: var(--radius-xl);
      padding: 16px 20px;
    }

    .ns-icon { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; }
    .ns-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .ns-line { height: 12px; border-radius: 6px; }
    .w70 { width: 70%; } .w40 { width: 40%; }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications = signal<Notification[]>([]);
  loading       = signal(true);
  hasUnread     = computed(() => this.notifications().some(n => !n.isRead));

  constructor(
    private notifSvc: NotificationService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.notifSvc.loadAll().subscribe({
      next: data => {
        this.notifications.set(
          [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        );
        this.loading.set(false);
        this.notifSvc.unreadCount.set(0);
      },
      error: () => this.loading.set(false),
    });
  }

  markRead(n: Notification): void {
    if (n.isRead) return;
    this.notifSvc.markAsRead(n.id).subscribe({ error: () => {} });
    this.notifications.update(list => list.map(x => x.id === n.id ? { ...x, isRead: true } : x));
  }

  markAllRead(): void {
    this.notifications().filter(n => !n.isRead).forEach(n => this.markRead(n));
    this.toast.info('All notifications marked as read');
  }

  iconClass(type: string): string {
    const map: Record<string, string> = { Like: 'fa-heart', Comment: 'fa-comment', Follow: 'fa-user-plus', Message: 'fa-envelope' };
    return map[type] ?? 'fa-bell';
  }

  iconBg(type: string): string {
    const map: Record<string, string> = { Like: 'bg-like', Comment: 'bg-comment', Follow: 'bg-follow', Message: 'bg-comment' };
    return map[type] ?? 'bg-default';
  }
}
