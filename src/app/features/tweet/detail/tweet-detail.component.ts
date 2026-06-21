import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TweetService } from '../../../core/services/tweet.service';
import { CommentService } from '../../../core/services/comment.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Tweet, Comment } from '../../../core/models/models';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tweet-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="detail-page">
      <div class="detail-header">
        <a routerLink="/home" class="btn btn-ghost btn-sm">
          <i class="fas fa-arrow-left"></i>
        </a>
        <h1 class="detail-title">Post</h1>
      </div>

      @if (loading()) {
        <div class="spinner" style="margin: 60px auto"></div>
      } @else if (tweet()) {

        <!-- Original tweet card -->
        <div class="orig-card glass">
          <!-- Author -->
          <div class="orig-author">
            <img [src]="authorAvatar()" class="avatar avatar-md" (error)="onImgErr($event)" alt="author">
            <div>
              <span class="orig-name">{{ authorName() }}</span>
              <span class="orig-time">{{ tweet()!.createdAt | date:'MMMM d, y Â· h:mm a' }}</span>
            </div>
          </div>

          <!-- Content -->
          <p class="orig-content">{{ tweet()!.content }}</p>

          <!-- Stats row -->
          <div class="orig-stats">
            <span class="stat-pill">
              <i class="fas fa-heart" style="color:var(--like)"></i>
              {{ tweet()!.likesCount }} likes
            </span>
            <span class="stat-pill">
              <i class="fas fa-comment" style="color:var(--accent)"></i>
              {{ comments().length }} comments
            </span>
          </div>
        </div>

        <!-- Comment composer -->
        <div class="comment-composer glass">
          <div class="cc-row">
            <img [src]="myAvatar()" class="avatar avatar-sm" (error)="onImgErr($event)" alt="you">
            <textarea class="form-control cc-ta" [(ngModel)]="commentText"
                      placeholder="Share your thoughtsâ€¦" rows="3"></textarea>
          </div>
          <div class="cc-foot">
            <button class="btn btn-primary btn-sm" (click)="postComment()"
                    [disabled]="!commentText.trim() || posting()">
              @if (posting()) { <span class="spinner spinner-sm"></span> }
              @else { <i class="fas fa-paper-plane"></i> }
              Post Comment
            </button>
          </div>
        </div>

        <!-- Comments list -->
        @if (comments().length === 0) {
          <div class="empty-state" style="padding: 40px 20px">
            <i class="far fa-comment-dots"></i>
            <p>No comments yet. Be the first to respond!</p>
          </div>
        } @else {
          <div class="comments-section">
            <h3 class="comments-title">
              {{ comments().length }} Comment{{ comments().length !== 1 ? 's' : '' }}
            </h3>
            @for (c of comments(); track c.id) {
              <div class="comment-card glass">
                <img [src]="commentAvatar(c)" class="avatar avatar-sm" (error)="onImgErr($event)" alt="">
                <div class="comment-body">
                  <div class="comment-head">
                    <span class="comment-user">{{ c.username || 'User' }}</span>
                    <span class="comment-time">{{ c.createdAt | date:'MMM d Â· h:mm a' }}</span>
                  </div>
                  <p class="comment-text">{{ c.content }}</p>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .detail-page { max-width: 680px; margin: 0 auto; }

    .detail-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 24px;
    }

    .detail-title {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary);
    }

    /* â”€â”€ Original tweet â”€â”€ */
    .orig-card {
      border-radius: var(--radius-xl);
      padding: 22px 24px;
      margin-bottom: 16px;
    }

    .orig-author {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .orig-name {
      display: block;
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .orig-time {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
    }

    .orig-content {
      font-size: 18px;
      line-height: 1.7;
      color: var(--text-primary);
      margin-bottom: 20px;
      word-break: break-word;
      white-space: pre-wrap;
    }

    .orig-stats {
      display: flex;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }

    .stat-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    /* â”€â”€ Comment composer â”€â”€ */
    .comment-composer {
      border-radius: var(--radius-xl);
      padding: 16px 18px;
      margin-bottom: 24px;

      &:focus-within {
        border-color: rgba(139,92,246,0.4);
        box-shadow: 0 0 0 3px rgba(139,92,246,0.08);
      }
    }

    .cc-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .cc-ta { flex: 1; min-height: 72px; }

    .cc-foot { display: flex; justify-content: flex-end; }

    /* â”€â”€ Comments â”€â”€ */
    .comments-title {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }

    .comment-card {
      display: flex;
      gap: 12px;
      border-radius: var(--radius-lg);
      padding: 14px 16px;
      margin-bottom: 10px;
      transition: var(--transition);
      &:hover { border-color: rgba(139,92,246,0.25); }
    }

    .comment-body { flex: 1; min-width: 0; }

    .comment-head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .comment-user { font-weight: 700; font-size: 14px; color: var(--accent); }
    .comment-time { font-size: 11px; color: var(--text-muted); }

    .comment-text { font-size: 14px; color: var(--text-secondary); line-height: 1.5; word-break: break-word; }
  `]
})
export class TweetDetailComponent implements OnInit {
  tweet    = signal<Tweet | null>(null);
  comments = signal<Comment[]>([]);
  loading  = signal(true);
  posting  = signal(false);
  commentText = '';

  private _authorName   = signal<string>('');
  private _authorAvatar = signal<string>('/assets/default-avatar.svg');

  authorName   = this._authorName.asReadonly();
  authorAvatar = this._authorAvatar.asReadonly();
  myAvatar     = signal('/assets/default-avatar.svg');

  constructor(
    private route: ActivatedRoute,
    private tweetSvc: TweetService,
    private commentSvc: CommentService,
    private userSvc: UserService,
    private auth: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    forkJoin({
      detail:   this.tweetSvc.getById(id),
      comments: this.commentSvc.getByTweet(id),
    }).subscribe({
      next: ({ detail, comments }) => {
        this.tweet.set(detail.tweet);
        this._authorName.set(detail.user?.username ?? 'Unknown');
        this._authorAvatar.set(this.userSvc.avatarUrl(detail.user?.profilePicture));
        this.comments.set(comments);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Could not load post'); },
    });

    const pic = this.auth.currentProfilePicture();
    if (pic) this.myAvatar.set(this.userSvc.avatarUrl(pic));
  }

  commentAvatar(c: Comment): string {
    return this.userSvc.avatarUrl((c as any).userAvatar ?? null);
  }

  onImgErr(e: Event): void {
    const img = e.target as HTMLImageElement; if (!img.src.includes('default-avatar')) img.src = '/assets/default-avatar.svg';
  }

  postComment(): void {
    const text = this.commentText.trim();
    if (!text || !this.tweet()) return;
    this.posting.set(true);

    this.commentSvc.create(this.tweet()!.id, text).subscribe({
      next: r => {
        const newComment: Comment = {
          id:        r.id ?? Date.now(),
          tweetId:   this.tweet()!.id,
          userId:    this.auth.currentUserId()!,
          content:   r.content ?? text,
          createdAt: new Date().toISOString(),
          username:  r.username ?? this.auth.currentUsername() ?? 'You',
        };
        this.comments.update(c => [newComment, ...c]);
        this.commentText = '';
        this.posting.set(false);
        this.toast.success('Comment posted!');
      },
      error: () => { this.posting.set(false); this.toast.error('Failed to post comment'); },
    });
  }
}

