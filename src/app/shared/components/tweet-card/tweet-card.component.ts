import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TweetViewModel, Comment } from '../../../core/models/models';
import { TweetService } from '../../../core/services/tweet.service';
import { CommentService } from '../../../core/services/comment.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-tweet-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <article class="bcard" [class.is-liked]="liked()" (dblclick)="onDblClick($event)">

      <!-- Double-click heart -->
      @if (dblHeart()) {
        <div class="dbl-heart">❤️</div>
      }

      <!-- Hover glow ring -->
      <div class="bcard-glow" [class.active]="likedGlow()"></div>

      <div class="bcard-inner">

        <!-- Author row -->
        <div class="bc-author">
          <a [routerLink]="isMe() ? '/profile' : ['/users', vm.user?.id]">
            <img [src]="avatarUrl(vm.user?.profilePicture)" class="avatar avatar-sm"
                 (error)="onImgErr($event)" [alt]="vm.user?.username">
          </a>
          <div class="bc-meta">
            <a [routerLink]="isMe() ? '/profile' : ['/users', vm.user?.id]" class="bc-name">
              {{ vm.user?.username }}
            </a>
            <span class="bc-time">{{ vm.tweet.createdAt | date:'MMM d, y' }}</span>
          </div>

          @if (postTag()) {
            <span class="bc-tag">{{ postTag() }}</span>
          }

          @if (!isMe()) {
            <button class="follow-pill" [class.active]="following()" (click)="onFollow()">
              @if (following()) { <i class="fas fa-check"></i> following } @else { + follow }
            </button>
          } @else {
            <button class="delete-pill" (click)="onDelete()"><i class="fas fa-trash-can"></i></button>
          }
        </div>

        <!-- Post title + body -->
        @if (postTitle()) {
          <h3 class="bc-title">{{ postTitle() }}</h3>
          @if (postBody()) {
            <p class="bc-body">{{ postBody() }}</p>
          }
        } @else {
          <p class="bc-content">{{ vm.tweet.content }}</p>
        }

        <!-- Inline hashtag pills -->
        @if (hashtags().length > 0) {
          <div class="bc-tags">
            @for (tag of hashtags(); track tag) {
              <span class="tag-pill">{{ tag }}</span>
            }
          </div>
        }

        <!-- Stats + actions -->
        <div class="bc-footer">
          <button class="bc-stat likes-stat" [class.liked]="liked()" (click)="openLikers()">
            <i [class]="liked() ? 'fas fa-heart' : 'far fa-heart'" [class.heart-pop]="heartPop()"></i>
            <span>{{ likeCount() }}</span>
          </button>

          <button class="bc-stat" (click)="toggleComments()">
            <i class="far fa-comment-dots"></i>
            <span>{{ inlineComments().length }}</span>
          </button>

          <a [routerLink]="['/tweet', vm.tweet.id]" class="bc-stat">
            <i class="fas fa-expand-alt"></i>
          </a>

          <button class="bc-like-btn" [class.liked]="liked()" (click)="onLike()">
            <i [class]="liked() ? 'fas fa-heart' : 'far fa-heart'"></i>
            {{ liked() ? 'liked' : 'like' }}
          </button>
        </div>

        <!-- Comment panel -->
        @if (showComments()) {
          <div class="bc-comments">
            <div class="cc-row">
              <img [src]="myAvatar()" class="avatar avatar-xs" (error)="onImgErr($event)" alt="me">
              <div class="cc-inner">
                <textarea class="cc-input" [(ngModel)]="commentText"
                          placeholder="add a comment…" rows="2"
                          (keydown.enter)="$event.preventDefault(); postComment()"></textarea>
                <div class="cc-actions">
                  <button class="btn btn-ghost btn-sm" (click)="showComments.set(false)">cancel</button>
                  <button class="btn btn-primary btn-sm" (click)="postComment()"
                          [disabled]="!commentText.trim() || posting()">
                    @if (posting()) { <span class="spinner spinner-sm"></span> }
                    post
                  </button>
                </div>
              </div>
            </div>

            @for (c of inlineComments(); track c.id) {
              <div class="cc-item">
                <img [src]="commentAvatar(c)" class="avatar avatar-xs" (error)="onImgErr($event)" alt="">
                <div class="cc-bubble">
                  <span class="cc-user">{{ c.username || 'user' }}</span>
                  <span class="cc-text">{{ c.content }}</span>
                </div>
                <button class="cc-heart" [class.liked]="commentLiked(c.id)" (click)="likeComment(c.id)">
                  <i [class]="commentLiked(c.id) ? 'fas fa-heart' : 'far fa-heart'"></i>
                  <span>{{ commentLikeCount(c.id) }}</span>
                </button>
              </div>
            }
          </div>
        }
      </div>
    </article>

    <!-- Who liked modal -->
    @if (showLikers()) {
      <div class="modal-overlay" (click)="showLikers.set(false)">
        <div class="modal-panel" (click)="$event.stopPropagation()">
          <div class="modal-handle"></div>
          <div class="modal-title">❤️ liked by</div>
          @if (likersLoading()) {
            <div class="spinner" style="margin:24px auto"></div>
          } @else {
            @for (u of likers(); track u.id) {
              <a [routerLink]="['/users', u.id]" class="liker-row" (click)="showLikers.set(false)">
                <img [src]="avatarUrl(u.profilePicture)" class="avatar avatar-sm" (error)="onImgErr($event)" alt="">
                <span class="liker-name">{{ u.username }}</span>
              </a>
            }
            @if (likers().length === 0) {
              <p style="text-align:center;color:var(--text-muted);padding:20px 0;font-style:italic">no likes yet</p>
            }
          }
        </div>
      </div>
    }
  `,
  styles: [`
    /* ── Card shell ── */
    .bcard {
      position: relative;
      background: var(--surface-1);
      backdrop-filter: var(--blur);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      margin-bottom: 16px;
      transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
      overflow: visible;
      cursor: default;
      user-select: none;

      &:hover {
        transform: translateY(-3px);
        border-color: rgba(212,132,122,0.35);
        box-shadow: 0 8px 32px rgba(196,96,58,0.12), 0 0 0 1px rgba(212,132,122,0.12);
      }
    }

    .bcard-glow {
      position: absolute; inset: -2px;
      border-radius: calc(var(--radius-xl) + 2px);
      pointer-events: none; z-index: -1;
      transition: box-shadow .45s ease;

      &.active {
        box-shadow: 0 0 0 2px rgba(212,132,122,0.4), 0 6px 32px rgba(212,132,122,0.18);
      }
    }

    .dbl-heart {
      position: absolute; top: 50%; left: 50%;
      font-size: 60px; pointer-events: none; z-index: 10;
      animation: dblLike .72s ease forwards;
    }

    .bcard-inner { padding: 18px 20px 16px; position: relative; z-index: 1; }

    /* ── Author ── */
    .bc-author {
      display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
    }

    .bc-meta { flex: 1; min-width: 0; }

    .bc-name {
      display: block; font-size: 14px; font-weight: 600;
      color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      &:hover { color: var(--terracotta); }
    }

    .bc-time { font-size: 11px; color: var(--text-muted); }

    .bc-tag {
      padding: 3px 10px; border-radius: var(--radius-full);
      font-size: 10px; font-weight: 600;
      background: rgba(196,96,58,0.12); color: var(--terracotta);
      border: 1px solid rgba(196,96,58,0.22); flex-shrink: 0;
    }

    .follow-pill {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 13px; border-radius: var(--radius-full);
      font-size: 12px; font-weight: 600; cursor: pointer;
      border: 1.5px solid rgba(196,96,58,0.4);
      background: rgba(196,96,58,0.08); color: var(--terracotta);
      transition: var(--transition); white-space: nowrap; flex-shrink: 0;
      font-family: var(--font-body);

      &:hover { background: rgba(196,96,58,0.18); }
      &.active {
        border-color: var(--border); color: var(--text-muted); background: var(--surface-2);
        &:hover { border-color: rgba(196,96,58,0.4); color: var(--terracotta); background: rgba(196,96,58,0.08); }
      }
    }

    .delete-pill {
      width: 30px; height: 30px; border-radius: 50%;
      border: 1px solid var(--border); background: transparent; color: var(--text-muted);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 11px; transition: var(--transition); flex-shrink: 0;
      &:hover { border-color: rgba(196,96,58,0.5); color: var(--terracotta); background: rgba(196,96,58,0.08); }
    }

    /* ── Content ── */
    .bc-title {
      font-family: var(--font-display);
      font-size: 20px; font-style: italic; font-weight: 600;
      color: var(--cream); line-height: 1.4; margin-bottom: 8px;
      word-break: break-word;
    }

    .bc-body {
      font-size: 14px; line-height: 1.7;
      color: var(--text-secondary); word-break: break-word;
      margin-bottom: 12px; white-space: pre-wrap;
    }

    .bc-content {
      font-family: var(--font-display);
      font-size: 17px; font-style: italic;
      color: var(--cream); line-height: 1.6;
      word-break: break-word; margin-bottom: 12px;
      white-space: pre-wrap; cursor: text; user-select: text;
    }

    .bc-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }

    /* ── Footer ── */
    .bc-footer {
      display: flex; align-items: center; gap: 2px;
      border-top: 1px solid var(--border); padding-top: 12px; margin-top: 4px;
    }

    .bc-stat {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 10px; border-radius: var(--radius-full);
      background: none; border: none; color: var(--text-muted);
      font-size: 13px; font-weight: 500; cursor: pointer;
      transition: var(--transition); text-decoration: none; font-family: var(--font-body);

      &:hover { background: var(--surface-2); color: var(--text-secondary); }
      &.liked { color: var(--rose); }
      &.likes-stat:hover { color: var(--rose); background: rgba(212,132,122,0.1); }
    }

    .bc-like-btn {
      margin-left: auto;
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 16px; border-radius: var(--radius-full);
      font-family: var(--font-body); font-size: 13px; font-weight: 600;
      cursor: pointer; border: 1.5px solid rgba(212,132,122,0.3);
      background: rgba(212,132,122,0.06); color: var(--text-muted);
      transition: var(--transition); flex-shrink: 0;

      &:hover { background: rgba(212,132,122,0.14); border-color: var(--rose); color: var(--rose); }
      &.liked { color: var(--rose); border-color: var(--rose); background: rgba(212,132,122,0.12); }
    }

    @keyframes heartPop { 0%{transform:scale(1)} 35%{transform:scale(1.65)} 65%{transform:scale(0.85)} 100%{transform:scale(1)} }
    .heart-pop { animation: heartPop .38s cubic-bezier(0.34,1.56,0.64,1); }

    /* ── Comments ── */
    .bc-comments {
      margin-top: 14px; padding-top: 14px;
      border-top: 1px solid var(--border);
      display: flex; flex-direction: column; gap: 10px;
    }

    .cc-row { display: flex; gap: 10px; align-items: flex-start; }
    .cc-inner { flex: 1; min-width: 0; }

    .cc-input {
      width: 100%; background: var(--surface-2); border: 1.5px solid var(--border);
      border-radius: var(--radius-lg); color: var(--text-primary);
      font-family: var(--font-display); font-style: italic; font-size: 14px;
      padding: 9px 13px; outline: none; resize: none; min-height: 54px;
      transition: var(--transition);
      &::placeholder { color: var(--text-muted); font-style: italic; }
      &:focus { border-color: rgba(196,96,58,0.4); box-shadow: 0 0 0 3px rgba(196,96,58,0.07); }
    }

    .cc-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }

    .cc-item { display: flex; align-items: flex-start; gap: 9px; }

    .cc-bubble {
      flex: 1; min-width: 0;
      background: var(--surface-2);
      border-radius: 2px var(--radius-lg) var(--radius-lg) var(--radius-lg);
      padding: 8px 12px;
      display: flex; flex-direction: column; gap: 3px;
    }

    .cc-user { font-size: 11px; font-weight: 700; color: var(--terracotta); }
    .cc-text { font-family: var(--font-display); font-style: italic; font-size: 13px; color: var(--text-secondary); line-height: 1.5; word-break: break-word; }

    .cc-heart {
      display: flex; flex-direction: column; align-items: center; gap: 1px;
      background: none; border: none; color: var(--text-muted);
      font-size: 10px; cursor: pointer; padding: 6px 3px;
      border-radius: var(--radius-md); transition: var(--transition); flex-shrink: 0;
      i { font-size: 12px; transition: var(--spring); }
      &:hover { color: var(--rose); }
      &.liked { color: var(--rose); }
    }

    /* ── Likers modal ── */
    .liker-row {
      display: flex; align-items: center; gap: 12px;
      padding: 9px 6px; border-radius: var(--radius-lg);
      transition: var(--transition);
      &:hover { background: var(--surface-2); }
    }

    .liker-name { font-size: 14px; font-weight: 600; color: var(--cream); flex: 1; }
  `]
})
export class TweetCardComponent implements OnInit {
  @Input({ required: true }) vm!: TweetViewModel;
  @Output() deleted = new EventEmitter<number>();

  liked          = signal(false);
  likeCount      = signal(0);
  following      = signal(false);
  showComments   = signal(false);
  inlineComments = signal<Comment[]>([]);
  likedGlow      = signal(false);
  heartPop       = signal(false);
  dblHeart       = signal(false);
  posting        = signal(false);
  showLikers     = signal(false);
  likers         = signal<any[]>([]);
  likersLoading  = signal(false);
  commentText    = '';

  private _commentLikes = signal<Record<number, { liked: boolean; count: number }>>({});

  commentLiked = (id: number) => !!this._commentLikes()[id]?.liked;
  commentLikeCount = (id: number) => this._commentLikes()[id]?.count ?? 0;

  postTitle(): string {
    const content = this.vm.tweet.content;
    const firstLine = content.split('\n')[0].trim();
    if (firstLine.length > 12 && content.includes('\n')) return firstLine;
    const firstSentence = content.split(/[.!?]/)[0].trim();
    if (firstSentence.length > 20 && firstSentence.length < 100) return firstSentence;
    return '';
  }

  postBody(): string {
    const title = this.postTitle();
    if (!title) return '';
    const rest = this.vm.tweet.content.slice(title.length).replace(/^[\s.!?\n]+/, '');
    return rest.replace(/#\w+/g, '').trim();
  }

  hashtags(): string[] {
    return (this.vm.tweet.content.match(/#(\w+)/g) ?? []).slice(0, 4);
  }

  postTag(): string {
    const tags = this.hashtags();
    return tags.length > 0 ? tags[0].slice(1) : '';
  }

  constructor(
    private tweetSvc: TweetService,
    private commentSvc: CommentService,
    private userSvc: UserService,
    private auth: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.liked.set(this.vm.isLiked);
    this.likeCount.set(this.vm.tweet.likesCount);
    this.following.set(this.vm.isFollowing);
  }

  isMe(): boolean { return this.vm.user?.id === this.auth.currentUserId(); }
  myAvatar(): string { return this.userSvc.avatarUrl(this.auth.currentProfilePicture()); }
  avatarUrl(pic?: string | null): string { return this.userSvc.avatarUrl(pic); }
  commentAvatar(c: Comment): string { return this.userSvc.avatarUrl((c as any).userAvatar ?? null); }

  onImgErr(e: Event): void {
    const img = e.target as HTMLImageElement;
    if (!img.src.includes('default-avatar')) img.src = '/assets/default-avatar.svg';
  }

  onLike(): void {
    this.tweetSvc.toggleLike(this.vm.tweet.id).subscribe({
      next: r => {
        this.liked.set(r.isLiked);
        this.likeCount.set(r.likesCount);
        if (r.isLiked) {
          this.heartPop.set(true);
          this.likedGlow.set(true);
          setTimeout(() => { this.heartPop.set(false); this.likedGlow.set(false); }, 500);
        }
      },
      error: () => this.toast.error('Could not update like'),
    });
  }

  onDblClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).closest('button,a,textarea,input')) return;
    if (!this.liked()) this.onLike();
    this.dblHeart.set(true);
    setTimeout(() => this.dblHeart.set(false), 780);
  }

  onFollow(): void {
    const obs = this.following() ? this.userSvc.unfollow(this.vm.user!.id) : this.userSvc.follow(this.vm.user!.id);
    obs.subscribe({
      next: () => {
        this.following.set(!this.following());
        this.toast.info(this.following() ? `following ${this.vm.user?.username}` : 'unfollowed');
      },
      error: () => this.toast.error('Action failed'),
    });
  }

  toggleComments(): void { this.showComments.set(!this.showComments()); }

  postComment(): void {
    const text = this.commentText.trim();
    if (!text || this.posting()) return;
    this.posting.set(true);
    this.commentSvc.create(this.vm.tweet.id, text).subscribe({
      next: r => {
        this.inlineComments.update(c => [...c, {
          id: r.id ?? Date.now(), tweetId: this.vm.tweet.id,
          userId: this.auth.currentUserId()!, content: r.content ?? text,
          createdAt: new Date().toISOString(),
          username: r.username ?? this.auth.currentUsername() ?? 'you',
          userAvatar: r.userAvatar ?? null,
        }]);
        this.commentText = '';
        this.posting.set(false);
      },
      error: () => { this.posting.set(false); this.toast.error('Could not post'); },
    });
  }

  likeComment(id: number): void {
    const cur = this._commentLikes()[id] ?? { liked: false, count: 0 };
    this._commentLikes.update(m => ({ ...m, [id]: { liked: !cur.liked, count: cur.count + (cur.liked ? -1 : 1) } }));
  }

  openLikers(): void {
    this.showLikers.set(true);
    if (this.likers().length > 0) return;
    this.likersLoading.set(true);
    this.tweetSvc.getLikers(this.vm.tweet.id).subscribe({
      next: r => { this.likers.set(r); this.likersLoading.set(false); },
      error: () => this.likersLoading.set(false),
    });
  }

  onDelete(): void {
    if (!confirm('Delete this post?')) return;
    this.tweetSvc.delete(this.vm.tweet.id).subscribe({
      next: () => { this.toast.info('Post deleted'); this.deleted.emit(this.vm.tweet.id); },
      error: () => this.toast.error('Failed to delete'),
    });
  }
}
