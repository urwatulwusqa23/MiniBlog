import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-shell">

      <!-- Botanical SVG background -->
      <div class="auth-bg" aria-hidden="true">
        <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
          <path class="al" d="M60,180 C40,140 60,80 100,100 C140,120 100,200 60,180z M60,180 L100,100"/>
          <path class="al" style="--d:.4s" transform="translate(90,20) rotate(25)" d="M0,0 C-14,18 -16,50 -5,68 C0,78 5,80 5,80 C5,80 18,72 22,56 C30,36 24,8 0,0z"/>
          <path class="av" style="--d:.3s" transform="translate(760,80)" d="M0,0 C-18,22 4,50 -14,72 C-32,96 -6,124 -18,150"/>
          <path class="as" style="--d:.6s" transform="translate(380,40)" d="M0,-12 L2.6,-4 L10,-4 L4,1.5 L6.5,9.5 L0,5 L-6.5,9.5 L-4,1.5 L-10,-4 L-2.6,-4z"/>
          <path class="as" style="--d:1.1s" transform="translate(650,160)" d="M0,-9 L2,-3 L7.5,-3 L3,1 L5,7 L0,3.5 L-5,7 L-3,1 L-7.5,-3 L-2,-3z"/>
          <path class="as" style="--d:1.6s" transform="translate(120,480)" d="M0,-10 L2.2,-3.4 L8.5,-3.4 L3.4,1.2 L5.5,8.5 L0,4.3 L-5.5,8.5 L-3.4,1.2 L-8.5,-3.4 L-2.2,-3.4z"/>
          <g style="--d:1.3s" transform="translate(680,440)">
            <path class="af" d="M0,0 C-7,-18 7,-26 8,-8 C10,6 -3,18 0,0z"/>
            <path class="af" d="M0,0 C12,-6 18,8 8,10 C-6,12 -8,-3 0,0z"/>
            <path class="af" d="M0,0 C7,18 -7,26 -8,8 C-10,-6 3,-18 0,0z"/>
            <path class="af" d="M0,0 C-12,6 -18,-8 -8,-10 C6,-12 8,3 0,0z"/>
          </g>
          <circle class="ad" style="--d:2s"  cx="550" cy="300" r="3"/>
          <circle class="ad" style="--d:2.3s" cx="564" cy="290" r="2"/>
          <circle class="ad" style="--d:2.6s" cx="570" cy="306" r="2.5"/>
        </svg>
      </div>

      <!-- Brand panel (desktop left) -->
      <div class="auth-brand">
        <div class="brand-content">
          <h1 class="brand-logo">blooom</h1>
          <p class="brand-sub">your world · your words · your vibe</p>
          <div class="brand-quote">
            <p class="quote-text">"even small words add up."</p>
          </div>
        </div>
      </div>

      <!-- Form panel -->
      <div class="auth-form-panel">
        <div class="auth-card glass">
          <h2 class="form-title">welcome back</h2>
          <p class="form-sub">sign in to continue writing</p>

          <form class="auth-form" (ngSubmit)="onSubmit()">
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
                       placeholder="your password" autocomplete="current-password" required>
                <button type="button" class="pw-toggle" (click)="showPw.set(!showPw())">
                  <i [class]="showPw() ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary submit-btn" [disabled]="loading()">
              @if (loading()) { <span class="spinner spinner-sm"></span> }
              @else { <i class="fas fa-seedling"></i> }
              sign in
            </button>
          </form>

          <p class="auth-link">
            new here? <a routerLink="/signup">create an account</a>
          </p>
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

    /* botanical elements */
    .al { fill: none; stroke: rgba(232,213,176,0.12); stroke-width: 1; stroke-linecap: round;
          stroke-dasharray: 400; stroke-dashoffset: 400;
          animation: draw-in 3s ease forwards; animation-delay: var(--d,0s); }
    .av { fill: none; stroke: rgba(232,213,176,0.11); stroke-width: 1; stroke-linecap: round;
          stroke-dasharray: 300; stroke-dashoffset: 300;
          animation: draw-in 2.5s ease forwards; animation-delay: var(--d,0s); }
    .as { fill: rgba(232,213,176,0.1); stroke: rgba(232,213,176,0.13); stroke-width: 0.8;
          opacity: 0; animation: star-appear 0.8s ease forwards; animation-delay: var(--d,0s); }
    .af { fill: none; stroke: rgba(232,213,176,0.11); stroke-width: 1; stroke-linecap: round;
          stroke-dasharray: 200; stroke-dashoffset: 200;
          animation: draw-in 2s ease forwards; animation-delay: var(--d,0s); }
    .ad { fill: rgba(196,96,58,0.2); opacity: 0;
          animation: star-appear 0.6s ease forwards; animation-delay: var(--d,0s); }

    @keyframes draw-in {
      from { stroke-dashoffset: var(--len, 400); }
      to   { stroke-dashoffset: 0; }
    }
    @keyframes star-appear { from { opacity: 0; } to { opacity: 1; } }

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

    .brand-content { text-align: center; }

    .brand-logo {
      font-family: var(--font-display);
      font-size: 88px; font-style: italic; font-weight: 600;
      color: var(--terracotta); letter-spacing: -0.04em; line-height: 1;
      margin-bottom: 12px;
      text-shadow: 0 0 60px rgba(196,96,58,0.25);
    }

    .brand-sub {
      font-size: 11px; font-weight: 600; letter-spacing: 0.15em;
      text-transform: uppercase; color: var(--text-muted); margin-bottom: 40px;
    }

    .brand-quote {
      padding: 20px 28px;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface-1);
      backdrop-filter: blur(12px);
      display: inline-block;
    }

    .quote-text {
      font-family: var(--font-display);
      font-style: italic; font-size: 20px;
      color: var(--text-secondary);
    }

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
        width: 440px;
        flex-shrink: 0;
        padding: 60px 48px;
        border-left: 1px solid var(--border);
        background: rgba(16,12,8,0.65);
        backdrop-filter: blur(24px);
      }
    }

    .auth-card {
      width: 100%; max-width: 380px;
      padding: 36px 32px;
      border-radius: var(--radius-2xl);
    }

    .form-title {
      font-family: var(--font-display);
      font-size: 36px; font-style: italic; font-weight: 600;
      color: var(--cream); margin-bottom: 6px;
    }

    .form-sub { font-size: 14px; color: var(--text-muted); margin-bottom: 28px; }

    .auth-form { display: flex; flex-direction: column; gap: 18px; }

    .field { display: flex; flex-direction: column; gap: 6px; }

    .field-label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }

    .input-wrap { position: relative; }

    .input-wrap .form-control { padding-left: 38px; }
    .input-wrap .input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 13px; pointer-events: none; }

    .pw-toggle {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; color: var(--text-muted); cursor: pointer;
      font-size: 13px; padding: 4px;
      &:hover { color: var(--terracotta); }
    }

    .submit-btn { width: 100%; margin-top: 6px; }

    .auth-link { text-align: center; margin-top: 20px; font-size: 13px; color: var(--text-muted); }
    .auth-link a { color: var(--terracotta); font-weight: 600; &:hover { color: var(--rose); } }
  `]
})
export class LoginComponent {
  email    = '';
  password = '';
  loading  = signal(false);
  showPw   = signal(false);

  constructor(private auth: AuthService, private toast: ToastService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password || this.loading()) return;
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: r => {
        this.toast.success(`welcome back, ${r?.user?.username ?? ''} 🌿`);
        this.router.navigate(['/home']);
        this.loading.set(false);
      },
      error: err => {
        this.toast.error(err?.error?.message || 'invalid credentials');
        this.loading.set(false);
      },
    });
  }
}
