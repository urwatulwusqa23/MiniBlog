import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TweetCardComponent } from '../../shared/components/tweet-card/tweet-card.component';
import { TweetService } from '../../core/services/tweet.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { TweetViewModel, User } from '../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TweetCardComponent],
  template: `
    <div class="home-layout">

      <!-- ── Left: feed ── -->
      <div class="feed-col">

        <!-- Story circles -->
        @if (following().length > 0) {
          <div class="stories-row">
            <div class="story-wrap">
              <a routerLink="/profile" class="story-item me-story">
                <img [src]="myAvatar()" class="story-avatar" (error)="onImgErr($event)" alt="me">
              </a>
              <span class="story-label">your story</span>
            </div>
            @for (u of following().slice(0, 6); track u.id) {
              <div class="story-wrap">
                <a [routerLink]="['/users', u.id]" class="story-item">
                  <img [src]="avatarUrl(u.profilePicture)" class="story-avatar" (error)="onImgErr($event)" [alt]="u.username">
                </a>
                <span class="story-label">{{ u.username | slice:0:8 }}</span>
              </div>
            }
          </div>
        }

        <!-- Compose -->
        <div class="compose-card glass">
          <div class="compose-top">
            <img [src]="myAvatar()" class="avatar avatar-sm" (error)="onImgErr($event)" alt="me">
            <textarea class="compose-input" [(ngModel)]="draftText"
                      placeholder="give it a title. what's on your mind? even small words add up..."
                      rows="3" [maxlength]="280"
                      (input)="onDraftInput($event)"></textarea>
          </div>
          <div class="compose-foot">
            <div class="char-info" [class.near-limit]="charCount() > 240" [class.over]="charCount() > 270">
              {{ 280 - charCount() }} left
            </div>
            <button class="btn btn-primary compose-btn" [disabled]="!draftText.trim() || posting()" (click)="post()">
              @if (posting()) { <span class="spinner spinner-sm"></span> }
              @else { <i class="fas fa-feather"></i> }
              publish
            </button>
          </div>
        </div>

        <!-- Feed -->
        @if (loading()) {
          @for (i of [1,2,3]; track i) {
            <div class="card-skel glass">
              <div class="sk-head">
                <div class="skeleton sk-avatar"></div>
                <div class="sk-lines">
                  <div class="skeleton sk-line w50"></div>
                  <div class="skeleton sk-line w30"></div>
                </div>
              </div>
              <div class="skeleton sk-title"></div>
              <div class="skeleton sk-body"></div>
              <div class="skeleton sk-body w70"></div>
            </div>
          }
        } @else if (feed().length === 0) {
          <div class="empty-state">
            <i class="fas fa-seedling"></i>
            <p>nothing here yet.<br>follow people or write your first post.</p>
          </div>
        } @else {
          @for (vm of feed(); track vm.tweet.id) {
            <app-tweet-card [vm]="vm" (deleted)="onDeleted($event)" />
          }
        }
      </div>

      <!-- ── Right sidebar ── -->
      <aside class="right-sidebar">

        <!-- Trending topics -->
        <div class="sidebar-section glass">
          <h3 class="sidebar-title">trending today</h3>
          @for (tag of trendingTags(); track tag.tag) {
            <div class="trending-row">
              <span class="trend-hash">#</span>
              <span class="trend-name">{{ tag.tag }}</span>
              <span class="trend-count">{{ tag.count }}</span>
            </div>
          }
          @if (trendingTags().length === 0) {
            <p class="sidebar-empty">start writing to see trends</p>
          }
        </div>

        <!-- People to follow -->
        @if (suggested().length > 0) {
          <div class="sidebar-section glass">
            <h3 class="sidebar-title">people to follow</h3>
            @for (u of suggested().slice(0,4); track u.id) {
              <div class="suggest-row">
                <a [routerLink]="['/users', u.id]">
                  <img [src]="avatarUrl(u.profilePicture)" class="avatar avatar-sm" (error)="onImgErr($event)" [alt]="u.username">
                </a>
                <div class="suggest-info">
                  <a [routerLink]="['/users', u.id]" class="suggest-name">{{ u.username }}</a>
                  <span class="suggest-stat">{{ u.followersCount }} followers</span>
                </div>
                <a [routerLink]="['/users', u.id]" class="btn btn-outline btn-sm follow-cta">
                  + follow
                </a>
              </div>
            }
          </div>
        }

        <!-- Write prompt -->
        <div class="write-prompt glass">
          <h4 class="prompt-heading">write something today</h4>
          <p class="prompt-sub">even small words add up.</p>
          <button class="btn btn-primary prompt-btn" (click)="focusCompose()">
            <i class="fas fa-plus"></i> new post
          </button>
        </div>

      </aside>
    </div>
  `,
  styles: [`
    /* ── Two-column layout ── */
    .home-layout {
      max-width: 1060px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;

      @media (min-width: 1000px) {
        grid-template-columns: 1fr 276px;
        align-items: start;
      }
    }

    .feed-col { min-width: 0; }

    /* ── Stories ── */
    .stories-row {
      display: flex;
      gap: 18px;
      overflow-x: auto;
      padding: 4px 2px 16px;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    .story-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .story-item {
      display: block;
      width: 58px; height: 58px;
      border-radius: 50%;
      padding: 2.5px;
      background: var(--surface-2);
      border: 1.5px solid var(--border);
      transition: var(--transition);

      &:hover { border-color: var(--terracotta); box-shadow: 0 0 0 3px rgba(196,96,58,0.18); }
    }

    .me-story {
      background: linear-gradient(135deg, rgba(196,96,58,0.6), rgba(212,132,122,0.6));
      border-color: rgba(196,96,58,0.4);
    }

    .story-avatar {
      width: 100%; height: 100%;
      border-radius: 50%;
      object-fit: cover;
      display: block;
      background: var(--bg-3);
    }

    .story-label {
      font-size: 10px;
      color: var(--text-muted);
      text-align: center;
      max-width: 58px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ── Compose ── */
    .compose-card {
      border-radius: var(--radius-xl);
      padding: 18px 20px 14px;
      margin-bottom: 20px;
      transition: var(--transition);

      &:focus-within {
        border-color: rgba(196,96,58,0.35);
        box-shadow: 0 0 0 4px rgba(196,96,58,0.07);
      }
    }

    .compose-top {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .compose-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary);
      font-family: var(--font-display);
      font-size: 17px;
      font-style: italic;
      line-height: 1.6;
      resize: none;
      min-height: 72px;
      width: 100%;

      &::placeholder {
        color: var(--text-muted);
        font-style: italic;
      }
    }

    .compose-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 10px;
      border-top: 1px solid var(--border);
    }

    .char-info {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 500;

      &.near-limit { color: var(--warning); }
      &.over { color: var(--danger); }
    }

    .compose-btn { min-width: 110px; }

    /* ── Skeletons ── */
    .card-skel {
      border-radius: var(--radius-xl);
      padding: 20px;
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .sk-head { display: flex; gap: 12px; align-items: center; }
    .sk-avatar { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; }
    .sk-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .sk-line { height: 12px; border-radius: 6px; &.w50 { width: 50%; } &.w30 { width: 30%; } }
    .sk-title { height: 22px; width: 70%; border-radius: 8px; }
    .sk-body  { height: 13px; border-radius: 6px; &.w70 { width: 70%; } }

    /* ── Right sidebar ── */
    .right-sidebar {
      display: none;
      flex-direction: column;
      gap: 16px;
      position: sticky;
      top: 24px;

      @media (min-width: 1000px) { display: flex; }
    }

    .sidebar-section {
      border-radius: var(--radius-xl);
      padding: 18px 16px;
    }

    .sidebar-title {
      font-family: var(--font-display);
      font-size: 17px;
      font-style: italic;
      font-weight: 600;
      color: var(--cream);
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }

    /* trending */
    .trending-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 0;
      border-bottom: 1px solid rgba(232,200,150,0.06);

      &:last-child { border-bottom: none; }
    }

    .trend-hash { color: var(--terracotta); font-size: 14px; font-weight: 700; }
    .trend-name { flex: 1; font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .trend-count { font-size: 11px; color: var(--text-muted); }

    .sidebar-empty { font-size: 13px; color: var(--text-muted); font-style: italic; text-align: center; padding: 8px 0; }

    /* people to follow */
    .suggest-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(232,200,150,0.06);
      &:last-child { border-bottom: none; }
    }

    .suggest-info { flex: 1; min-width: 0; }
    .suggest-name { display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); &:hover { color: var(--terracotta); } }
    .suggest-stat { font-size: 11px; color: var(--text-muted); }
    .follow-cta   { font-size: 11px; padding: 4px 12px; flex-shrink: 0; }

    /* write prompt */
    .write-prompt {
      border-radius: var(--radius-xl);
      padding: 20px 18px;
      text-align: center;
      border-color: rgba(196,96,58,0.18);
      background: rgba(196,96,58,0.06);
    }

    .prompt-heading { font-family: var(--font-display); font-size: 18px; font-style: italic; font-weight: 600; color: var(--cream); margin-bottom: 6px; }
    .prompt-sub { font-size: 12px; color: var(--text-muted); margin-bottom: 14px; }
    .prompt-btn { width: 100%; }
  `]
})
export class HomeComponent implements OnInit {
  feed      = signal<TweetViewModel[]>([]);
  following = signal<User[]>([]);
  suggested = signal<User[]>([]);
  loading   = signal(true);
  posting   = signal(false);
  draftText = '';
  charCount = signal(0);

  trendingTags = computed(() => {
    const tagMap: Record<string, number> = {};
    for (const vm of this.feed()) {
      const tags = vm.tweet.content.match(/#(\w+)/g) ?? [];
      for (const t of tags) {
        const key = t.slice(1).toLowerCase();
        tagMap[key] = (tagMap[key] ?? 0) + 1;
      }
    }
    return Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  });

  constructor(
    private tweetSvc: TweetService,
    private userSvc: UserService,
    private auth: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const me = this.auth.currentUserId()!;

    forkJoin({
      feed:      this.tweetSvc.getFeed(),
      following: this.userSvc.getFollowing(),
      all:       this.userSvc.searchUsers(''),
    }).subscribe({
      next: ({ feed, following, all }) => {
        this.feed.set(feed);
        this.following.set(following);
        const followingIds = new Set(following.map(u => u.id));
        this.suggested.set(all.filter(u => u.id !== me && !followingIds.has(u.id)));
        this.loading.set(false);
      },
      error: () => {
        this.tweetSvc.getFeed().subscribe({ next: f => { this.feed.set(f); this.loading.set(false); }, error: () => this.loading.set(false) });
      },
    });
  }

  myAvatar(): string { return this.userSvc.avatarUrl(this.auth.currentProfilePicture()); }
  avatarUrl(pic: string): string { return this.userSvc.avatarUrl(pic); }

  onImgErr(e: Event): void {
    const img = e.target as HTMLImageElement;
    if (!img.src.includes('default-avatar')) img.src = '/assets/default-avatar.svg';
  }

  onDraftInput(e: Event): void {
    this.charCount.set((e.target as HTMLTextAreaElement).value.length);
  }

  post(): void {
    const text = this.draftText.trim();
    if (!text || this.posting()) return;
    this.posting.set(true);
    this.tweetSvc.create(text).subscribe({
      next: t => {
        const me = this.auth.currentUserId()!;
        const username = this.auth.currentUsername()!;
        const newVm: TweetViewModel = {
          tweet: { ...t, id: t.id ?? Date.now(), likesCount: 0, createdAt: new Date().toISOString() },
          user: { id: me, username, email: '', profilePicture: this.auth.currentProfilePicture() ?? '', followersCount: 0, followingCount: 0 },
          isFollowing: false,
          isLiked: false,
        };
        this.feed.update(f => [newVm, ...f]);
        this.draftText = '';
        this.charCount.set(0);
        this.posting.set(false);
        this.toast.success('Posted!');
      },
      error: () => { this.posting.set(false); this.toast.error('Could not post'); },
    });
  }

  onDeleted(id: number): void { this.feed.update(f => f.filter(vm => vm.tweet.id !== id)); }

  focusCompose(): void {
    const el = document.querySelector('.compose-input') as HTMLTextAreaElement;
    el?.focus();
  }
}
