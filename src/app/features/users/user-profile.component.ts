import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { User, Tweet } from '../../core/models/models';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="profile-page">
      <div class="page-head">
        <a routerLink="/home" class="btn btn-ghost btn-sm">
          <i class="fas fa-arrow-left"></i>
        </a>
      </div>

      @if (loading()) {
        <div class="profile-skel glass">
          <div class="skeleton skel-banner"></div>
          <div class="skel-avatar-wrap">
            <div class="skeleton skel-avatar"></div>
          </div>
          <div class="skel-info">
            <div class="skeleton skel-name"></div>
            <div class="skeleton skel-email"></div>
          </div>
        </div>
      } @else if (user()) {

        <!-- Profile hero -->
        <div class="profile-hero glass">
          <div class="profile-banner"></div>

          <div class="profile-avatar-wrap">
            <div class="avatar-ring">
              <img [src]="avatarUrl()" class="avatar" (error)="onImgErr($event)" [alt]="user()!.username">
            </div>
          </div>

          <div class="profile-info">
            <div class="profile-names">
              <h2 class="profile-name">{{ user()!.username }}</h2>
              <span class="profile-handle">&#64;{{ user()!.username.toLowerCase() }}</span>
            </div>
            <button class="btn follow-action-btn" (click)="toggleFollow()"
                    [class.btn-outline]="isFollowing()"
                    [class.btn-primary]="!isFollowing()"
                    [disabled]="followLoading()">
              @if (followLoading()) {
                <span class="spinner spinner-sm"></span>
              } @else if (isFollowing()) {
                <i class="fas fa-user-check"></i> Following
              } @else {
                <i class="fas fa-user-plus"></i> Follow
              }
            </button>
          </div>

          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-val">{{ user()!.followersCount }}</span>
              <span class="stat-lbl">Followers</span>
            </div>
            <div class="stat-item">
              <span class="stat-val">{{ user()!.followingCount }}</span>
              <span class="stat-lbl">Following</span>
            </div>
            <div class="stat-item">
              <span class="stat-val">{{ tweets().length }}</span>
              <span class="stat-lbl">Posts</span>
            </div>
          </div>
        </div>

        <!-- Posts -->
        <div class="posts-section">
          <h3 class="section-title">Posts</h3>

          @if (tweets().length === 0) {
            <div class="empty-state">
              <i class="fas fa-feather"></i>
              <p>No posts yet.</p>
            </div>
          } @else {
            @for (tweet of tweets(); track tweet.id) {
              <a [routerLink]="['/tweet', tweet.id]" class="post-card glass">
                <p class="post-body">{{ tweet.content }}</p>
                <div class="post-meta">
                  <span class="post-time"><i class="far fa-clock"></i> {{ tweet.createdAt | date:'MMM d Â· h:mm a' }}</span>
                  <span class="post-likes"><i class="fas fa-heart"></i> {{ tweet.likesCount }}</span>
                </div>
              </a>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-page { max-width: 680px; margin: 0 auto; }
    .page-head { margin-bottom: 20px; }

    .profile-hero { border-radius: var(--radius-xl); overflow: hidden; margin-bottom: 28px; }

    .profile-banner {
      height: 130px;
      background: linear-gradient(135deg, #4c1d95 0%, #7e22ce 50%, #6b21a8 100%);
      opacity: 0.65;
    }

    .profile-avatar-wrap { padding: 0 24px; margin-top: -52px; }

    .avatar-ring {
      width: 104px; height: 104px;
      border-radius: 50%;
      background: var(--gradient);
      padding: 3px;
      box-shadow: 0 4px 20px rgba(139,92,246,0.3);
      display: inline-block;

      img {
        border: 3px solid var(--bg);
        width: 98px; height: 98px;
        border-radius: 50%;
        object-fit: cover;
        display: block;
      }
    }

    .profile-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 24px 0;
    }

    .profile-names { display: flex; flex-direction: column; gap: 3px; }

    .profile-name { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); }
    .profile-handle { font-size: 13px; color: var(--text-muted); }

    .follow-action-btn { min-width: 110px; }

    .profile-stats {
      display: flex;
      padding: 20px 24px;
      border-top: 1px solid var(--border);
      margin-top: 18px;
    }

    .stat-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      border-right: 1px solid var(--border);
      &:last-child { border-right: none; }
    }

    .stat-val { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--accent); }
    .stat-lbl { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; }

    .section-title {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      &::before { content: ''; display: inline-block; width: 4px; height: 18px; background: var(--gradient); border-radius: 99px; }
    }

    .post-card {
      display: block;
      border-radius: var(--radius-xl);
      padding: 18px 20px;
      margin-bottom: 12px;
      text-decoration: none;
      transition: var(--transition);
      &:hover { border-color: rgba(139,92,246,0.3); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(139,92,246,0.08); }
    }

    .post-body { font-size: 15px; line-height: 1.65; color: var(--text-primary); margin-bottom: 12px; word-break: break-word; white-space: pre-wrap; }

    .post-meta { display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
    .post-time { color: var(--text-muted); display: flex; align-items: center; gap: 5px; }
    .post-likes { color: var(--like); font-weight: 600; display: flex; align-items: center; gap: 5px; }

    /* Skeleton */
    .profile-skel { border-radius: var(--radius-xl); overflow: hidden; margin-bottom: 28px; }
    .skel-banner { height: 130px; border-radius: 0; }
    .skel-avatar-wrap { padding: 0 24px; margin-top: -52px; }
    .skel-avatar { width: 104px; height: 104px; border-radius: 50%; }
    .skel-info { padding: 16px 24px; display: flex; flex-direction: column; gap: 10px; }
    .skel-name  { height: 22px; width: 40%; border-radius: 6px; }
    .skel-email { height: 14px; width: 55%; border-radius: 6px; }
  `]
})
export class UserProfileComponent implements OnInit {
  user         = signal<User | null>(null);
  tweets       = signal<Tweet[]>([]);
  isFollowing  = signal(false);
  loading      = signal(true);
  followLoading = signal(false);

  private userId = 0;

  constructor(
    private route: ActivatedRoute,
    private userSvc: UserService,
    private auth: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.userId === this.auth.currentUserId()) {
      window.location.href = '/profile';
      return;
    }

    forkJoin({
      user:        this.userSvc.getUserById(this.userId),
      tweets:      this.userSvc.getUserTweets(this.userId),
      isFollowing: this.userSvc.isFollowing(this.userId),
    }).subscribe({
      next: ({ user, tweets, isFollowing }) => {
        this.user.set(user);
        this.tweets.set(tweets);
        this.isFollowing.set(isFollowing.isFollowing);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Failed to load profile'); },
    });
  }

  avatarUrl(): string {
    return this.userSvc.avatarUrl(this.user()?.profilePicture);
  }

  onImgErr(e: Event): void {
    const img = e.target as HTMLImageElement; if (!img.src.includes('default-avatar')) img.src = '/assets/default-avatar.svg';
  }

  toggleFollow(): void {
    this.followLoading.set(true);
    const obs = this.isFollowing()
      ? this.userSvc.unfollow(this.userId)
      : this.userSvc.follow(this.userId);

    obs.subscribe({
      next: () => {
        const wasFollowing = this.isFollowing();
        this.isFollowing.set(!wasFollowing);
        this.user.update(u => u ? {
          ...u,
          followersCount: u.followersCount + (wasFollowing ? -1 : 1),
        } : u);
        this.followLoading.set(false);
        this.toast.info(wasFollowing ? 'Unfollowed' : `Now following ${this.user()?.username}`);
      },
      error: () => { this.followLoading.set(false); this.toast.error('Action failed'); },
    });
  }
}

