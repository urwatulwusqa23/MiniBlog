import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `<!-- The layout component handles mobile bar; this component is kept for legacy imports -->`,
  styles: [`
    :host { display: none; }
  `]
})
export class NavbarComponent {
  readonly unread   = this.notifSvc.unreadCount;
  readonly username = this.auth.currentUsername;

  constructor(private auth: AuthService, private notifSvc: NotificationService) {}

  logout(): void { this.auth.logout(); }
}
