import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'login',  canActivate: [guestGuard], loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'signup', canActivate: [guestGuard], loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent) },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: 'home',          loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
      { path: 'profile',       loadComponent: () => import('./features/profile/view/profile-view.component').then(m => m.ProfileViewComponent) },
      { path: 'profile/edit',  loadComponent: () => import('./features/profile/edit/profile-edit.component').then(m => m.ProfileEditComponent) },
      { path: 'users/:id',     loadComponent: () => import('./features/users/user-profile.component').then(m => m.UserProfileComponent) },
      { path: 'tweet/:id',     loadComponent: () => import('./features/tweet/detail/tweet-detail.component').then(m => m.TweetDetailComponent) },
      { path: 'notifications', loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'messages',      loadComponent: () => import('./features/messages/messages.component').then(m => m.MessagesComponent) },
      { path: 'messages/:id',  loadComponent: () => import('./features/messages/messages.component').then(m => m.MessagesComponent) },
      { path: 'followers',     loadComponent: () => import('./features/followers/followers.component').then(m => m.FollowersComponent) },
      { path: 'following',     loadComponent: () => import('./features/following/following.component').then(m => m.FollowingComponent) },
    ],
  },

  { path: '**', redirectTo: 'home' },
];
