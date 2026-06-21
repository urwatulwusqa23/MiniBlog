import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="brand">
        <a routerLink="/home" class="brand-name">blooom</a>
        <span class="brand-tagline">your world · your words · your vibe</span>
      </div>

      <nav class="nav">
        <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-item">
          <i class="fas fa-seedling"></i><span>home</span>
        </a>
        <a routerLink="/messages" routerLinkActive="active" class="nav-item">
          <i class="fas fa-envelope-open-text"></i><span>messages</span>
        </a>
        <a routerLink="/notifications" routerLinkActive="active" class="nav-item">
          <i class="fas fa-bell"></i><span>alerts</span>
          @if (notifSvc.unreadCount() > 0) {
            <span class="badge">{{ notifSvc.unreadCount() > 9 ? '9+' : notifSvc.unreadCount() }}</span>
          }
        </a>
        <a routerLink="/profile" routerLinkActive="active" class="nav-item">
          <i class="fas fa-user-pen"></i><span>me</span>
        </a>
      </nav>

      <div class="user-card">
        @if (username()) {
          <a routerLink="/profile" class="user-link">
            <img [src]="avatar()" class="avatar avatar-sm" (error)="onImgErr($event)" alt="me">
            <div class="user-info">
              <span class="user-name">{{ username() }}</span>
              <span class="user-handle">&#64;{{ username()?.toLowerCase() }}</span>
            </div>
          </a>
          <button class="logout-btn" (click)="logout()" title="Sign out">
            <i class="fas fa-arrow-right-from-bracket"></i>
          </button>
        }
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed; top: 0; left: 0;
      width: var(--sidebar-w); height: 100vh;
      display: flex; flex-direction: column;
      padding: 36px 18px 24px;
      border-right: 1px solid var(--border);
      background: rgba(16,12,8,0.88);
      backdrop-filter: blur(24px);
      z-index: 100;
    }

    .brand { margin-bottom: 44px; padding-left: 6px; }

    .brand-name {
      display: block;
      font-family: var(--font-display);
      font-size: 40px; font-style: italic; font-weight: 600;
      color: var(--terracotta); line-height: 1; letter-spacing: -0.03em;
      transition: color .2s;
      &:hover { color: var(--rose); }
    }

    .brand-tagline {
      display: block; font-size: 9px; font-weight: 500;
      color: var(--text-muted); letter-spacing: 0.12em;
      text-transform: uppercase; margin-top: 5px;
    }

    .nav { display: flex; flex-direction: column; gap: 3px; flex: 1; }

    .nav-item {
      display: flex; align-items: center; gap: 13px;
      padding: 11px 14px; border-radius: var(--radius-lg);
      font-size: 15px; font-weight: 500; color: var(--text-muted);
      transition: var(--transition); position: relative; text-decoration: none;

      i { width: 20px; text-align: center; font-size: 14px; transition: color .2s; }

      .badge {
        margin-left: auto; background: var(--gradient); color: #fff;
        font-size: 10px; font-weight: 700; min-width: 18px; height: 18px;
        border-radius: 99px; display: inline-flex; align-items: center;
        justify-content: center; padding: 0 5px;
      }

      &:hover { color: var(--cream); background: var(--surface-2); i { color: var(--terracotta); } }

      &.active {
        color: var(--terracotta); background: rgba(196,96,58,0.1); font-weight: 600;
        i { color: var(--terracotta); }
        &::before {
          content: ''; position: absolute; left: 0; top: 22%; bottom: 22%;
          width: 3px; background: var(--gradient); border-radius: 0 3px 3px 0;
        }
      }
    }

    .user-card {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 8px; border-top: 1px solid var(--border); margin-top: auto;
    }

    .user-link {
      flex: 1; min-width: 0; display: flex; align-items: center; gap: 10px;
      text-decoration: none; border-radius: var(--radius-md); padding: 4px;
      transition: var(--transition);
      &:hover { background: var(--surface-2); }
      img { border: 1.5px solid rgba(196,96,58,0.3); }
    }

    .user-info { flex: 1; min-width: 0; }
    .user-name { display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-handle { font-size: 11px; color: var(--text-muted); }

    .logout-btn {
      width: 32px; height: 32px; border-radius: 50%;
      background: transparent; border: 1px solid var(--border);
      color: var(--text-muted); cursor: pointer;
      display: flex; align-items: center; justify-content: center; font-size: 12px;
      transition: var(--transition); flex-shrink: 0;
      &:hover { border-color: rgba(196,96,58,0.5); color: var(--terracotta); background: rgba(196,96,58,0.08); }
    }
  `]
})
export class SidebarComponent implements OnInit {
  username = this.auth.currentUsername;
  avatar   = signal('/assets/default-avatar.svg');

  constructor(
    private auth: AuthService,
    private userSvc: UserService,
    readonly notifSvc: NotificationService,
  ) {}

  ngOnInit(): void {
    const pic = this.auth.currentProfilePicture();
    if (pic) this.avatar.set(this.userSvc.avatarUrl(pic));
  }

  onImgErr(e: Event): void {
    const img = e.target as HTMLImageElement;
    if (!img.src.includes('default-avatar')) img.src = '/assets/default-avatar.svg';
  }

  logout(): void { this.auth.logout(); }
}
