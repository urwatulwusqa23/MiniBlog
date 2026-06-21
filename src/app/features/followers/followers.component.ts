import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models/models';

@Component({
  selector: 'app-followers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="follow-page">
      <div class="page-head">
        <a routerLink="/profile" class="btn btn-ghost btn-sm">
          <i class="fas fa-arrow-left"></i>
        </a>
        <h1 class="page-title">Followers</h1>
      </div>

      @if (loading()) {
        <div class="user-skeleton">
          @for (i of [1,2,3]; track i) {
            <div class="us-card glass">
              <div class="skeleton us-avatar"></div>
              <div class="us-lines">
                <div class="skeleton us-name"></div>
                <div class="skeleton us-stat"></div>
              </div>
            </div>
          }
        </div>
      } @else if (users().length === 0) {
        <div class="empty-state">
          <i class="fas fa-user-group"></i>
          <p>No followers yet.<br>Keep posting and they'll come!</p>
        </div>
      } @else {
        <div class="user-list">
          @for (u of users(); track u.id) {
            <div class="user-card glass">
              <a [routerLink]="['/users', u.id]" class="user-avatar-link">
                <img [src]="avatarUrl(u.profilePicture)" class="avatar avatar-md"
                     (error)="onImgErr($event)" [alt]="u.username">
              </a>
              <div class="user-info">
                <a [routerLink]="['/users', u.id]" class="user-name">{{ u.username }}</a>
                <span class="user-stat">{{ u.followersCount }} followers</span>
              </div>
              <button class="btn btn-sm" (click)="toggleFollow(u)"
                      [class.btn-outline]="followMap()[u.id]"
                      [class.btn-primary]="!followMap()[u.id]">
                @if (followMap()[u.id]) {
                  <i class="fas fa-user-check"></i> Following
                } @else {
                  <i class="fas fa-user-plus"></i> Follow Back
                }
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .follow-page { max-width: 640px; margin: 0 auto; }

    .page-head { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }

    .page-title {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .user-list { display: flex; flex-direction: column; gap: 10px; }

    .user-card {
      display: flex;
      align-items: center;
      gap: 14px;
      border-radius: var(--radius-xl);
      padding: 14px 18px;
      transition: var(--transition);
      &:hover { border-color: rgba(139,92,246,0.3); transform: translateX(2px); }
    }

    .user-avatar-link { flex-shrink: 0; }

    .user-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }

    .user-name {
      font-size: 15px; font-weight: 700; color: var(--text-primary);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      &:hover { color: var(--accent); }
    }

    .user-stat { font-size: 12px; color: var(--text-muted); }

    .user-skeleton { display: flex; flex-direction: column; gap: 10px; }
    .us-card { display: flex; align-items: center; gap: 14px; border-radius: var(--radius-xl); padding: 14px 18px; }
    .us-avatar { width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0; }
    .us-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .us-name { height: 14px; width: 40%; border-radius: 6px; }
    .us-stat  { height: 11px; width: 25%; border-radius: 6px; }
  `]
})
export class FollowersComponent implements OnInit {
  users     = signal<User[]>([]);
  loading   = signal(true);
  followMap = signal<Record<number, boolean>>({});

  constructor(private userSvc: UserService, private toast: ToastService) {}

  ngOnInit(): void {
    this.userSvc.getFollowers().subscribe({
      next: u => { this.users.set(u); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  avatarUrl(pic: string): string { return this.userSvc.avatarUrl(pic); }
  onImgErr(e: Event): void { const img = e.target as HTMLImageElement; if (!img.src.includes('default-avatar')) img.src = '/assets/default-avatar.svg'; }

  toggleFollow(u: User): void {
    const already = this.followMap()[u.id];
    const obs = already ? this.userSvc.unfollow(u.id) : this.userSvc.follow(u.id);
    obs.subscribe({
      next: () => {
        this.followMap.update(m => ({ ...m, [u.id]: !already }));
        this.toast.info(already ? 'Unfollowed' : 'Now following!');
      },
      error: () => this.toast.error('Action failed'),
    });
  }
}
