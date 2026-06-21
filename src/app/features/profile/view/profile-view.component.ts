import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { TweetService } from '../../../core/services/tweet.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { User, Tweet } from '../../../core/models/models';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="profile-page">

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
          <!-- Banner gradient -->
          <div class="profile-banner"></div>

          <!-- Avatar area -->
          <div class="profile-avatar-wrap">
            <div class="avatar-ring">
              <img [src]="avatarUrl()" class="avatar avatar-xl"
                   (error)="onImgErr($event)" [alt]="user()!.username">
            </div>
          </div>

          <!-- Info -->
          <div class="profile-info">
            <div class="profile-names">
              <h2 class="profile-name">{{ user()!.username }}</h2>
              <span class="profile-handle">&#64;{{ user()!.username.toLowerCase() }}</span>
            </div>
            <a routerLink="/profile/edit" class="btn btn-outline btn-sm edit-btn">
              <i class="fas fa-pen-to-square"></i> Edit Profile
            </a>
          </div>

          <!-- Stats row -->
          <div class="profile-stats">
            <a routerLink="/followers" class="stat-item">
              <span class="stat-val">{{ user()!.followersCount }}</span>
              <span class="stat-lbl">Followers</span>
            </a>
            <a routerLink="/following" class="stat-item">
              <span class="stat-val">{{ user()!.followingCount }}</span>
              <span class="stat-lbl">Following</span>
            </a>
            <div class="stat-item">
              <span class="stat-val">{{ tweets().length }}</span>
              <span class="stat-lbl">Posts</span>
            </div>
          </div>
        </div>

        <!-- Posts section -->
        <div class="posts-section">
          <div class="section-head">
            <h3 class="section-title">Your Posts</h3>
          </div>

          @if (tweets().length === 0) {
            <div class="empty-state">
              <i class="fas fa-feather"></i>
              <p>Nothing posted yet. Share your first thought!</p>
            </div>
          } @else {
            @for (tweet of tweets(); track tweet.id) {
              <div class="post-card glass">
                <p class="post-body">{{ tweet.content }}</p>
                <div class="post-meta">
                  <span class="post-time">
                    <i class="far fa-clock"></i>
                    {{ tweet.createdAt | date:'MMM d · h:mm a' }}
                  </span>
                  <span class="post-likes">
                    <i class="fas fa-heart"></i> {{ tweet.likesCount }}
                  </span>
                </div>
                <div class="post-actions">
                  <a [routerLink]="['/tweet', tweet.id]" class="btn btn-ghost btn-sm">
                    <i class="far fa-comment"></i> Comments
                  </a>
                  <button class="btn btn-danger btn-sm" (click)="deleteTweet(tweet.id)">
                    <i class="fas fa-trash-can"></i> Delete
                  </button>
                </div>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-page { max-width: 680px; margin: 0 auto; }

    /* ── Hero card ── */
    .profile-hero {
      border-radius: var(--radius-xl);
      overflow: hidden;
      margin-bottom: 28px;
    }

    .profile-banner {
      height: 140px;
      background: var(--gradient);
      opacity: 0.7;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      }
    }

    .profile-avatar-wrap {
      padding: 0 24px;
      margin-top: -52px;
    }

    .avatar-ring {
      width: 104px;
      height: 104px;
      border-radius: 50%;
      background: var(--gradient);
      padding: 3px;
      box-shadow: 0 4px 20px rgba(139,92,246,0.3);
      display: inline-block;

      img {
        border: 3px solid var(--bg);
        width: 98px;
        height: 98px;
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

    .profile-names {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .profile-name {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .profile-handle {
      font-size: 14px;
      color: var(--text-muted);
    }

    /* Stats */
    .profile-stats {
      display: flex;
      gap: 0;
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
      text-decoration: none;
      border-right: 1px solid var(--border);
      padding: 4px 0;

      &:last-child { border-right: none; }
      &:hover .stat-val { color: var(--accent-2); }
    }

    .stat-val {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      color: var(--accent);
      transition: color .2s;
    }

    .stat-lbl {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: .06em;
    }

    /* Posts section */
    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .section-title {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;

      &::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 18px;
        background: var(--gradient);
        border-radius: 99px;
      }
    }

    .post-card {
      border-radius: var(--radius-xl);
      padding: 18px 20px;
      margin-bottom: 14px;
      transition: var(--transition);

      &:hover {
        border-color: rgba(139,92,246,0.3);
        transform: translateY(-1px);
        box-shadow: 0 4px 20px rgba(139,92,246,0.08);
      }
    }

    .post-body {
      font-size: 15px;
      line-height: 1.65;
      color: var(--text-primary);
      margin-bottom: 14px;
      word-break: break-word;
      white-space: pre-wrap;
    }

    .post-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }

    .post-time { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 5px; }
    .post-likes { font-size: 13px; color: var(--like); font-weight: 600; display: flex; align-items: center; gap: 5px; }

    .post-actions { display: flex; gap: 8px; justify-content: flex-end; }

    /* Skeleton */
    .profile-skel {
      border-radius: var(--radius-xl);
      overflow: hidden;
      margin-bottom: 28px;
    }
    .skel-banner { height: 140px; border-radius: 0; }
    .skel-avatar-wrap { padding: 0 24px; margin-top: -52px; }
    .skel-avatar { width: 104px; height: 104px; border-radius: 50%; }
    .skel-info { padding: 16px 24px; display: flex; flex-direction: column; gap: 10px; }
    .skel-name  { height: 22px; width: 40%; border-radius: 6px; }
    .skel-email { height: 14px; width: 55%; border-radius: 6px; }
  `]
})
export class ProfileViewComponent implements OnInit {
  user    = signal<User | null>(null);
  tweets  = signal<Tweet[]>([]);
  loading = signal(true);

  constructor(
    private userSvc: UserService,
    private tweetSvc: TweetService,
    private auth: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const uid = this.auth.currentUserId()!;
    forkJoin({
      user:   this.userSvc.getProfile(),
      tweets: this.userSvc.getUserTweets(uid),
    }).subscribe({
      next: ({ user, tweets }) => {
        this.user.set(user);
        this.tweets.set(tweets);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load profile');
      },
    });
  }

  avatarUrl(): string {
    return this.userSvc.avatarUrl(this.user()?.profilePicture);
  }

  onImgErr(e: Event): void {
    const img = e.target as HTMLImageElement;
    if (!img.src.includes('default-avatar')) img.src = '/assets/default-avatar.svg';
  }

  deleteTweet(id: number): void {
    if (!confirm('Delete this post?')) return;
    this.tweetSvc.delete(id).subscribe({
      next: () => { this.tweets.update(t => t.filter(tw => tw.id !== id)); this.toast.info('Post deleted'); },
      error: () => this.toast.error('Failed to delete'),
    });
  }
}
