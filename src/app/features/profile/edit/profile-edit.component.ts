import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/models';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="edit-page">
      <div class="edit-header">
        <a routerLink="/profile" class="btn btn-ghost btn-sm">
          <i class="fas fa-arrow-left"></i>
        </a>
        <h2 class="edit-title">Edit Profile</h2>
      </div>

      <div class="edit-card glass">
        @if (loading()) {
          <div class="spinner" style="margin: 60px auto"></div>
        } @else {
          <!-- Avatar section -->
          <div class="avatar-section" (click)="fileInput.click()">
            <div class="avatar-ring">
              <img [src]="previewUrl() || avatarUrl()" class="avatar-preview"
                   (error)="onImgErr($event)" alt="avatar">
            </div>
            <div class="avatar-overlay">
              <i class="fas fa-camera"></i>
              <span>Change Photo</span>
            </div>
            <input #fileInput type="file" accept="image/*" (change)="onFile($event)" hidden>
          </div>

          <form (ngSubmit)="onSubmit()" class="edit-form">
            <div class="form-group">
              <label>Username</label>
              <div class="input-icon-wrap">
                <i class="fas fa-at input-icon"></i>
                <input class="form-control" type="text" [(ngModel)]="username" name="username" required>
              </div>
            </div>
            <div class="form-group">
              <label>Email address</label>
              <div class="input-icon-wrap">
                <i class="fas fa-envelope input-icon"></i>
                <input class="form-control" type="email" [(ngModel)]="email" name="email" required>
              </div>
            </div>
            <div class="form-group">
              <label>New Password <span class="optional">(leave blank to keep current)</span></label>
              <div class="input-icon-wrap">
                <i class="fas fa-lock input-icon"></i>
                <input class="form-control" type="password" [(ngModel)]="password"
                       name="password" placeholder="Enter new password">
              </div>
            </div>

            <div class="form-actions">
              <a routerLink="/profile" class="btn btn-outline">Cancel</a>
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                @if (saving()) { <span class="spinner spinner-sm"></span> }
                @else { <i class="fas fa-check"></i> }
                Save Changes
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .edit-page { max-width: 560px; margin: 0 auto; }

    .edit-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 24px;
    }

    .edit-title {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .edit-card {
      border-radius: var(--radius-xl);
      padding: 32px;
    }

    .avatar-section {
      position: relative;
      width: 110px;
      margin: 0 auto 28px;
      cursor: pointer;
      border-radius: 50%;
      overflow: hidden;
      &:hover .avatar-overlay { opacity: 1; }
    }

    .avatar-ring {
      width: 110px; height: 110px;
      border-radius: 50%;
      background: var(--gradient);
      padding: 3px;
      box-shadow: 0 4px 20px rgba(139,92,246,0.3);
    }

    .avatar-preview {
      width: 100%; height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--bg);
      display: block;
    }

    .avatar-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.58);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
      color: #fff;
      font-size: 12px;
      opacity: 0;
      transition: opacity .2s;
      border-radius: 50%;
      i { font-size: 22px; }
    }

    .input-icon-wrap {
      position: relative;
      .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 13px; pointer-events: none; }
      .form-control { padding-left: 40px; }
    }

    .optional { font-weight: 400; color: var(--text-muted); text-transform: none; letter-spacing: 0; font-size: 11px; }

    .edit-form { display: flex; flex-direction: column; }

    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
  `]
})
export class ProfileEditComponent implements OnInit {
  username   = '';
  email      = '';
  password   = '';
  loading    = signal(true);
  saving     = signal(false);
  previewUrl = signal<string | null>(null);
  private file: File | null = null;
  private currentUser: User | null = null;

  constructor(
    private userSvc: UserService,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.userSvc.getProfile().subscribe({
      next: u => {
        this.currentUser = u;
        this.username    = u.username;
        this.email       = u.email;
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Failed to load profile'); },
    });
  }

  avatarUrl(): string {
    return this.userSvc.avatarUrl(this.currentUser?.profilePicture);
  }

  onImgErr(e: Event): void {
    const img = e.target as HTMLImageElement; if (!img.src.includes('default-avatar')) img.src = '/assets/default-avatar.svg';
  }

  onFile(e: Event): void {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.file = f;
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(f);
  }

  onSubmit(): void {
    this.saving.set(true);
    const form = new FormData();
    form.append('Username', this.username);
    form.append('Email',    this.email);
    if (this.password) form.append('NewPassword', this.password);
    if (this.file)     form.append('profilePictureFile', this.file);

    this.userSvc.updateProfile(form).subscribe({
      next: (u: any) => {
        this.saving.set(false);
        this.toast.success('Profile updated!');
        const newUsername = u?.username ?? this.username;
        const newPic      = u?.profilePicture ?? '';
        this.auth.updateLocalProfile(newUsername, newPic);
        this.router.navigate(['/profile']);
      },
      error: () => { this.saving.set(false); this.toast.error('Failed to update profile'); },
    });
  }
}

