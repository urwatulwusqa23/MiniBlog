import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastContainerComponent } from '../toast-container/toast-container.component';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, SidebarComponent, ToastContainerComponent],
  template: `
    <!-- Animated botanical SVG background -->
    <div class="botanical-bg" aria-hidden="true">
      <svg class="botanical-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">

        <!-- Top-left leaf cluster -->
        <g transform="translate(50, 110)">
          <path class="b-leaf" d="M0,0 C-18,22 -22,58 -8,80 C0,93 8,96 8,96 C8,96 26,88 30,68 C42,46 36,10 0,0z" />
          <line class="b-vein" x1="0" y1="0" x2="8" y2="96" />
          <path class="b-leaf" style="--d:0.4s" transform="translate(30,-20) rotate(30)" d="M0,0 C-12,15 -14,40 -5,55 C0,63 5,66 5,66 C5,66 17,59 20,44 C28,28 22,6 0,0z" />
          <line class="b-vein" style="--d:0.4s" transform="translate(30,-20) rotate(30)" x1="0" y1="0" x2="5" y2="66" />
        </g>

        <!-- Stars appearing one by one -->
        <path class="b-star" style="--d:0.2s" transform="translate(320,65)"
          d="M0,-11 L2.4,-3.6 L10,-3.6 L3.8,1.4 L6.2,8.9 L0,4.5 L-6.2,8.9 L-3.8,1.4 L-10,-3.6 L-2.4,-3.6z"/>
        <path class="b-star" style="--d:0.7s" transform="translate(740,38)"
          d="M0,-14 L3.2,-4.6 L13,-4.6 L4.9,1.8 L8,11.3 L0,5.7 L-8,11.3 L-4.9,1.8 L-13,-4.6 L-3.2,-4.6z"/>
        <path class="b-star" style="--d:1.1s" transform="translate(1080,155)"
          d="M0,-9 L2,-3 L8.5,-3 L3.2,1.2 L5.2,7.3 L0,3.7 L-5.2,7.3 L-3.2,1.2 L-8.5,-3 L-2,-3z"/>
        <path class="b-star" style="--d:1.6s" transform="translate(510,310)"
          d="M0,-7 L1.5,-2.4 L6.6,-2.4 L2.5,0.9 L4,5.7 L0,2.8 L-4,5.7 L-2.5,0.9 L-6.6,-2.4 L-1.5,-2.4z"/>
        <path class="b-star" style="--d:2s" transform="translate(175,440)"
          d="M0,-11 L2.4,-3.6 L10,-3.6 L3.8,1.4 L6.2,8.9 L0,4.5 L-6.2,8.9 L-3.8,1.4 L-10,-3.6 L-2.4,-3.6z"/>
        <path class="b-star" style="--d:2.5s" transform="translate(900,500)"
          d="M0,-8 L1.8,-2.6 L7.6,-2.6 L2.9,1 L4.7,6.5 L0,3.3 L-4.7,6.5 L-2.9,1 L-7.6,-2.6 L-1.8,-2.6z"/>
        <path class="b-star" style="--d:3s" transform="translate(1300,720)"
          d="M0,-11 L2.4,-3.6 L10,-3.6 L3.8,1.4 L6.2,8.9 L0,4.5 L-6.2,8.9 L-3.8,1.4 L-10,-3.6 L-2.4,-3.6z"/>

        <!-- Right-side vine -->
        <path class="b-vine" style="--d:0.3s" transform="translate(1405, 60)"
          d="M0,0 C-18,22 6,50 -12,74 C-30,98 -6,128 -18,155 C-30,182 -8,210 -18,238"/>

        <!-- Left side tendril -->
        <path class="b-vine" style="--d:1s" transform="translate(18, 520)"
          d="M0,0 C16,18 -8,40 12,60 C32,80 8,102 20,125"/>

        <!-- Bottom-left petal flower -->
        <g class="b-flower" style="--d:1.4s" transform="translate(95, 820)">
          <path d="M0,0 C-8,-22 8,-30 10,-10 C12,8 -4,22 0,0z"/>
          <path d="M0,0 C14,-8 22,8 10,12 C-8,14 -10,-4 0,0z"/>
          <path d="M0,0 C8,22 -8,30 -10,10 C-12,-8 4,-22 0,0z"/>
          <path d="M0,0 C-14,8 -22,-8 -10,-12 C8,-14 10,4 0,0z"/>
          <circle cx="0" cy="0" r="3" class="b-dot"/>
        </g>

        <!-- Top-right botanical leaf -->
        <g style="--d:0.6s" transform="translate(1370, 80)">
          <path class="b-leaf" d="M0,0 C12,15 14,40 5,55 C0,63 -5,66 -5,66 C-5,66 -17,59 -20,44 C-28,28 -22,6 0,0z"/>
          <line class="b-vein" x1="0" y1="0" x2="-5" y2="66"/>
        </g>

        <!-- Mid-right flower -->
        <g class="b-flower" style="--d:1.8s" transform="translate(1400, 440)">
          <path d="M0,-16 C-6,-13 -13,-6 -13,0 C-13,6 -6,13 0,16 C6,13 13,6 13,0 C13,-6 6,-13 0,-16z"/>
          <path d="M-16,0 C-13,-6 -6,-13 0,-13 C6,-13 13,-6 16,0 C13,6 6,13 0,13 C-6,13 -13,6 -16,0z"/>
          <circle cx="0" cy="0" r="4" class="b-dot"/>
        </g>

        <!-- Bottom-right leaf -->
        <g style="--d:2.2s" transform="translate(1320, 790)">
          <path class="b-leaf" transform="rotate(-30)" d="M0,0 C-15,20 -18,52 -6,72 C0,82 6,85 6,85 C6,85 22,76 26,58 C36,38 28,8 0,0z"/>
          <line class="b-vein" transform="rotate(-30)" x1="0" y1="0" x2="6" y2="85"/>
        </g>

        <!-- Scattered small berries / dots -->
        <circle class="b-dot-s" style="--d:1.3s" cx="650" cy="200" r="3.5"/>
        <circle class="b-dot-s" style="--d:1.7s" cx="680" cy="188" r="2"/>
        <circle class="b-dot-s" style="--d:2.1s" cx="700" cy="208" r="2.5"/>
        <circle class="b-dot-s" style="--d:2.4s" cx="400" cy="750" r="3"/>
        <circle class="b-dot-s" style="--d:2.8s" cx="420" cy="738" r="2"/>

        <!-- Subtle arc -->
        <path class="b-arc" style="--d:0.9s" transform="translate(700,850)"
          d="M-80,0 Q0,-50 80,0"/>
      </svg>
    </div>

    <!-- Shell -->
    <div class="app-shell">
      <!-- Desktop sidebar (hidden on mobile) -->
      <app-sidebar class="desktop-only"></app-sidebar>

      <!-- Main scroll area -->
      <main class="main-area">
        <router-outlet />
      </main>
    </div>

    <!-- Mobile top bar -->
    <header class="mobile-topbar">
      <a routerLink="/home" class="mob-brand">blooom</a>
      <div class="mob-actions">
        <a routerLink="/notifications" class="mob-icon">
          <i class="fas fa-bell"></i>
          @if (notifSvc.unreadCount() > 0) {
            <span class="mob-dot"></span>
          }
        </a>
        <a routerLink="/profile" class="mob-icon">
          <i class="fas fa-user-pen"></i>
        </a>
      </div>
    </header>

    <!-- Mobile bottom nav -->
    <nav class="mobile-bottom-nav">
      <a routerLink="/home" routerLinkActive="active" class="mob-nav-btn">
        <i class="fas fa-seedling"></i><span>home</span>
      </a>
      <a routerLink="/messages" routerLinkActive="active" class="mob-nav-btn">
        <i class="fas fa-envelope-open-text"></i><span>messages</span>
      </a>
      <a routerLink="/home" class="mob-compose-btn">
        <i class="fas fa-plus"></i>
      </a>
      <a routerLink="/notifications" routerLinkActive="active" class="mob-nav-btn">
        <i class="fas fa-bell"></i><span>alerts</span>
      </a>
      <a routerLink="/profile" routerLinkActive="active" class="mob-nav-btn">
        <i class="fas fa-user-pen"></i><span>me</span>
      </a>
    </nav>

    <app-toast-container />
  `,
  styles: [`
    /* ── Botanical background ── */
    .botanical-bg {
      position: fixed; inset: 0;
      z-index: 0; pointer-events: none; overflow: hidden;
    }

    .botanical-svg {
      width: 100%; height: 100%;
      animation: botanical-drift 25s ease-in-out infinite;
    }

    @keyframes botanical-drift {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-18px); }
    }

    /* Botanical element base styles */
    .b-leaf, .b-vein, .b-vine, .b-arc {
      fill: none;
      stroke: rgba(232,213,176,0.13);
      stroke-width: 1;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 500;
      stroke-dashoffset: 500;
      animation: draw-in 3s ease forwards;
      animation-delay: var(--d, 0s);
    }

    @keyframes draw-in {
      from { stroke-dashoffset: 500; }
      to   { stroke-dashoffset: 0; }
    }

    .b-star {
      fill: rgba(232,213,176,0.12);
      stroke: rgba(232,213,176,0.14);
      stroke-width: 0.8;
      opacity: 0;
      animation: star-appear 1s ease forwards;
      animation-delay: var(--d, 0s);
    }

    @keyframes star-appear {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .b-flower path {
      fill: none;
      stroke: rgba(232,213,176,0.12);
      stroke-width: 1;
      stroke-linecap: round;
      stroke-dasharray: 200;
      stroke-dashoffset: 200;
      animation: draw-in 2.5s ease forwards;
      animation-delay: var(--d, 0s);
    }

    .b-dot {
      fill: rgba(232,213,176,0.1);
      stroke: rgba(232,213,176,0.14);
      stroke-width: 0.8;
      opacity: 0;
      animation: star-appear 1s ease forwards;
      animation-delay: calc(var(--d, 0s) + 1.5s);
    }

    .b-dot-s {
      fill: rgba(196,96,58,0.18);
      stroke: none;
      opacity: 0;
      animation: star-appear 0.8s ease forwards;
      animation-delay: var(--d, 0s);
    }

    /* ── App shell ── */
    .app-shell {
      position: relative;
      z-index: 1;
      min-height: 100vh;
    }

    .main-area {
      padding: 32px 24px;
      padding-bottom: 90px;

      @media (min-width: 768px) {
        margin-left: var(--sidebar-w);
        padding: 36px 32px;
      }
    }

    /* ── Desktop only ── */
    .desktop-only {
      @media (max-width: 767px) { display: none !important; }
    }

    /* ── Mobile top bar ── */
    .mobile-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: fixed; top: 0; left: 0; right: 0;
      z-index: 50;
      padding: 14px 20px;
      background: rgba(16,12,8,0.9);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);

      @media (min-width: 768px) { display: none; }
    }

    .mob-brand {
      font-family: var(--font-display);
      font-size: 28px; font-style: italic; font-weight: 600;
      color: var(--terracotta); text-decoration: none;
    }

    .mob-actions { display: flex; gap: 16px; align-items: center; }

    .mob-icon {
      position: relative;
      color: var(--text-muted);
      font-size: 18px;
      text-decoration: none;
      &:hover { color: var(--terracotta); }
    }

    .mob-dot {
      position: absolute; top: -2px; right: -4px;
      width: 7px; height: 7px;
      background: var(--terracotta);
      border-radius: 50%;
      border: 1.5px solid var(--bg);
    }

    /* ── Mobile bottom nav ── */
    .mobile-bottom-nav {
      display: none;
      position: fixed; bottom: 0; left: 0; right: 0;
      z-index: 50;
      height: 64px;
      background: rgba(16,12,8,0.95);
      backdrop-filter: blur(20px);
      border-top: 1px solid var(--border);
      align-items: center;
      justify-content: space-around;
      padding: 0 8px;

      @media (max-width: 767px) { display: flex; }
    }

    .mob-nav-btn {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      color: var(--text-muted); text-decoration: none; font-size: 10px;
      font-weight: 600; padding: 8px 12px; border-radius: var(--radius-md);
      transition: var(--transition);
      i { font-size: 18px; }
      &:hover, &.active { color: var(--terracotta); }
    }

    .mob-compose-btn {
      width: 48px; height: 48px; border-radius: 50%;
      background: var(--gradient);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 18px; text-decoration: none;
      box-shadow: 0 4px 16px var(--glow);
      transition: var(--transition);
      &:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(196,96,58,0.5); }
    }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  constructor(
    readonly notifSvc: NotificationService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void { this.notifSvc.startConnection(); }
  ngOnDestroy(): void { this.notifSvc.stopConnection(); }
}
