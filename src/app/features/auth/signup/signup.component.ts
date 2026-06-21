import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-shell">

      <!-- Botanical SVG background -->
      <div class="auth-bg" aria-hidden="true">
        <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
          <!-- top-right vine -->
          <path class="av" style="--d:.2s" transform="translate(770,40)"
            d="M0,0 C-16,24 6,52 -12,76 C-28,100 -4,128 -16,156 C-28,184 -6,212 -18,240"/>
          <!-- top-left leaf -->
          <path class="al" d="M45,160 C20,120 45,60 85,82 C125,104 88,188 45,160z M45,160 L85,82"/>
          <!-- small leaf rotated -->
          <path class="al" style="--d:.5s" transform="translate(110,40) rotate(35)"
            d="M0,0 C-12,16 -14,44 -4,60 C0,68 4,70 4,70 C4,70 16,62 18,48 C26,30 20,6 0,0z"/>
          <!-- stars -->
          <path class="as" style="--d:.7s" transform="translate(420,55)"
            d="M0,-13 L2.8,-4.4 L12,-4.4 L4.6,1.6 L7.5,11 L0,5.5 L-7.5,11 L-4.6,1.6 L-12,-4.4 L-2.8,-4.4z"/>
          <path class="as" style="--d:1.2s" transform="translate(200,400)"
            d="M0,-10 L2.2,-3.4 L8.5,-3.4 L3.2,1.2 L5.3,8.5 L0,4.3 L-5.3,8.5 L-3.2,1.2 L-8.5,-3.4 L-2.2,-3.4z"/>
          <path class="as" style="--d:1.7s" transform="translate(660,350)"
            d="M0,-8 L1.7,-2.7 L7.2,-2.7 L2.8,1 L4.5,7 L0,3.5 L-4.5,7 L-2.8,1 L-7.2,-2.7 L-1.7,-2.7z"/>
          <path class="as" style="--d:2.2s" transform="translate(550,500)"
            d="M0,-11 L2.4,-3.6 L10,-3.6 L3.8,1.4 L6.2,8.9 L0,4.5 L-6.2,8.9 L-3.8,1.4 L-10,-3.6 L-2.4,-3.6z"/>
          <!-- bottom-right flower -->
          <g style="--d:1.4s" transform="translate(700,480)">
            <path class="af" d="M0,0 C-7,-19 7,-27 9,-8 C11,6 -3,19 0,0z"/>
            <path class="af" d="M0,0 C13,-7 19,7 9,10 C-6,13 -8,-3 0,0z"/>
            <path class="af" d="M0,0 C7,19 -7,27 -9,8 C-11,-6 3,-19 0,0z"/>
            <path class="af" d="M0,0 C-13,7 -19,-7 -9,-10 C6,-13 8,3 0,0z"/>
          </g>
          <!-- bottom-left tendril -->
          <path class="av" style="--d:.9s" transform="translate(30,500)"
            d="M0,0 C16,18 -6,40 12,62 C30,84 8,106 20,128"/>
          <!-- berry dots -->
          <circle class="ad" style="--d:1.8s" cx="360" cy="240" r="3"/>
          <circle class="ad" style="--d:2.1s" cx="374" cy="230" r="2"/>
          <circle class="ad" style="--d:2.4s" cx="381" cy="248" r="2.5"/>
        </svg>
      </div>

      <!-- Form panel -->
      <div class="auth-form-panel">
        <div class="auth-card glass">
          <h2 class="form-title">join blooom</h2>
          <p class="form-sub">start writing your world today</p>

          <form class="auth-form" (ngSubmit)="onSubmit()">
            <div class="field">
              <label class="field-label">username</label>
              <div class="input-wrap">
                <i class="fas fa-user input-icon"></i>
                <input class="form-control" type="text" [(ngModel)]="username" name="username"
                       placeholder="yourname" autocomplete="username" required>
              </div>
            </div>

            <div class="field">
              <label class="field-label">email</label>
              <div class="input-wrap">
                <i class="fas fa-at input-icon"></i>
                <input class="form-control" type="email" [(ngModel)]="email" name="email"
                       placeholder="your@email.com" autocomplete="email" required>
              </div>
            </div>

            <div class="field">
              <label class="field-label">password</label>
              <div class="input-wrap">
                <i class="fas fa-lock input-icon"></i>
                <input class="form-control" [type]="showPw() ? 'text' : 'password'"
                       [(ngModel)]="password" name="password"
                       placeholder="create a password" autocomplete="new-password" required>
                <button type="button" class="pw-toggle" (click)="showPw.set(!showPw())">
                  <i [class]="showPw() ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="field">
              <label class="field-label">confirm password</label>
              <div class="input-wrap">
                <i class="fas fa-lock input-icon"></i>
                <input class="form-control" [type]="showPw() ? 'text' : 'password'"
                       [(ngModel)]="confirmPassword" name="confirmPassword"
                       placeholder="repeat your password" autocomplete="new-password" required>
              </div>
              @if (passwordMismatch()) {
                <span class="field-error">passwords don't match</span>
              }
            </div>

            <button type="submit" class="btn btn-primary submit-btn"
                    [disabled]="loading() || !canSubmit()">
              @if (loading()) { <span class="spinner spinner-sm"></span> }
              @else { <i class="fas fa-seedling"></i> }
              create account
            </button>
          </form>

          <p class="auth-link">
            already here? <a routerLink="/login">sign in</a>
          </p>
        </div>
      </div>

      <!-- Brand panel (desktop right) -->
      <div class="auth-brand">
        <div class="brand-content">
          <h1 class="brand-logo">blooom</h1>
          <p class="brand-sub">your world · your words · your vibe</p>
          <ul class="brand-reasons">
            <li><i class="fas fa-feather"></i> write anything, big or small</li>
            <li><i class="fas fa-seedling"></i> grow a community around your words</li>
            <li><i class="fas fa-heart"></i> connect with people who get it</li>
          </ul>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .auth-shell {
      min-height: 100vh;
      display: flex;
      position: relative;
      background: var(--bg);
    }

    .auth-bg {
      position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
    }

    /* botanical draw-in animations */
    .al { fill: none; stroke: rgba(232,213,176,0.12); stroke-width: 1; stroke-linecap: round;
          stroke-dasharray: 400; stroke-dashoffset: 400;
          animation: draw-in 3s ease forwards; animation-delay: var(--d,0s); }
    .av { fill: none; stroke: rgba(232,213,176,0.10); stroke-width: 1; stroke-linecap: round;
          stroke-dasharray: 350; stroke-dashoffset: 350;
          animation: draw-in 2.8s ease forwards; animation-delay: var(--d,0s); }
    .as { fill: rgba(232,213,176,0.10); stroke: rgba(232,213,176,0.13); stroke-width: 0.8;
          opacity: 0; animation: star-appear .8s ease forwards; animation-delay: var(--d,0s); }
    .af { fill: none; stroke: rgba(232,213,176,0.10); stroke-width: 1; stroke-linecap: round;
          stroke-dasharray: 200; stroke-dashoffset: 200;
          animation: draw-in 2s ease forwards; animation-delay: var(--d,0s); }
    .ad { fill: rgba(196,96,58,0.22); opacity: 0;
          animation: star-appear .6s ease forwards; animation-delay: var(--d,0s); }

    @keyframes draw-in    { from { stroke-dashoffset: 400; } to { stroke-dashoffset: 0; } }
    @keyframes star-appear { from { opacity: 0; } to { opacity: 1; } }

    /* ── Form panel ── */
    .auth-form-panel {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 40px 20px;
      position: relative;
      z-index: 1;

      @media (min-width: 900px) {
        width: 460px;
        flex-shrink: 0;
        padding: 60px 48px;
        border-right: 1px solid var(--border);
        background: rgba(16,12,8,0.7);
        backdrop-filter: blur(24px);
      }
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 36px 32px;
      border-radius: var(--radius-2xl);
    }

    .form-title {
      font-family: var(--font-display);
      font-size: 34px; font-style: italic; font-weight: 600;
      color: var(--cream); margin-bottom: 6px;
    }

    .form-sub { font-size: 14px; color: var(--text-muted); margin-bottom: 26px; }

    .auth-form { display: flex; flex-direction: column; gap: 16px; }

    .field { display: flex; flex-direction: column; gap: 6px; }

    .field-label {
      font-size: 11px; font-weight: 600; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.09em;
    }

    .field-error {
      font-size: 12px; color: var(--rose);
      display: flex; align-items: center; gap: 5px;
      &::before { content: '·'; font-size: 18px; line-height: 1; }
    }

    .input-wrap { position: relative; }
    .input-wrap .form-control { padding-left: 38px; }
    .input-wrap .input-icon {
      position: absolute; left: 13px; top: 50%;
      transform: translateY(-50%); color: var(--text-muted); font-size: 13px; pointer-events: none;
    }

    .pw-toggle {
      position: absolute; right: 12px; top: 50%;
      transform: translateY(-50%); background: none; border: none;
      color: var(--text-muted); cursor: pointer; font-size: 13px; padding: 4px;
      &:hover { color: var(--terracotta); }
    }

    .submit-btn { width: 100%; margin-top: 4px; }

    .auth-link {
      text-align: center; margin-top: 20px; font-size: 13px; color: var(--text-muted);
      a { color: var(--terracotta); font-weight: 600; &:hover { color: var(--rose); } }
    }

    /* ── Brand panel ── */
    .auth-brand {
      display: none;

      @media (min-width: 900px) {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        padding: 60px;
        position: relative;
        z-index: 1;
      }
    }

    .brand-content { max-width: 360px; }

    .brand-logo {
      font-family: var(--font-display);
      font-size: 80px; font-style: italic; font-weight: 600;
      color: var(--terracotta); letter-spacing: -0.04em; line-height: 1;
      margin-bottom: 10px;
      text-shadow: 0 0 50px rgba(196,96,58,0.22);
    }

    .brand-sub {
      font-size: 10px; font-weight: 600; letter-spacing: 0.15em;
      text-transform: uppercase; color: var(--text-muted); margin-bottom: 36px;
    }

    .brand-reasons {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 16px;

      li {
        display: flex;
        align-items: center;
        gap: 14px;
        font-family: var(--font-display);
        font-style: italic;
        font-size: 17px;
        color: var(--text-secondary);

        i {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: rgba(196,96,58,0.12);
          border: 1px solid rgba(196,96,58,0.22);
          color: var(--terracotta);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; flex-shrink: 0; font-style: normal;
        }
      }
    }
  `]
})
export class SignupComponent {
  username        = '';
  email           = '';
  password        = '';
  confirmPassword = '';
  loading         = signal(false);
  showPw          = signal(false);

  passwordMismatch = () => this.confirmPassword.length > 0 && this.password !== this.confirmPassword;
  canSubmit = () => this.username.trim() && this.email.trim() && this.password.length >= 6 && this.password === this.confirmPassword;

  constructor(private auth: AuthService, private toast: ToastService, private router: Router) {}

  onSubmit(): void {
    if (!this.canSubmit() || this.loading()) return;
    this.loading.set(true);
    const fd = new FormData();
    fd.append('username', this.username.trim());
    fd.append('email', this.email.trim());
    fd.append('password', this.password);
    this.auth.signup(fd).subscribe({
      next: () => {
        this.toast.success('account created — welcome to blooom 🌿');
        this.router.navigate(['/login']);
        this.loading.set(false);
      },
      error: err => {
        this.toast.error(err?.error?.message || 'could not create account');
        this.loading.set(false);
      },
    });
  }
}
