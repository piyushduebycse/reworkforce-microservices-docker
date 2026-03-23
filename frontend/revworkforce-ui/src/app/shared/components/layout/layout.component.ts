import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule, MatBadgeModule, MatMenuModule],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon>business</mat-icon>
          <span>RevWorkforce</span>
        </div>
        <mat-nav-list>
          <!-- All users -->
          <a mat-list-item routerLink="/employee/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/directory" routerLinkActive="active">
            <mat-icon matListItemIcon>contacts</mat-icon>
            <span matListItemTitle>Directory</span>
          </a>
          <ng-container *ngIf="!isAdmin()">
            <mat-divider></mat-divider>
            <h3 matSubheader>Leave</h3>
            <a mat-list-item routerLink="/leave/balance" routerLinkActive="active">
              <mat-icon matListItemIcon>event_available</mat-icon>
              <span matListItemTitle>My Balance</span>
            </a>
            <a mat-list-item routerLink="/leave/apply" routerLinkActive="active">
              <mat-icon matListItemIcon>add_circle</mat-icon>
              <span matListItemTitle>Apply Leave</span>
            </a>
            <a mat-list-item routerLink="/leave/list" routerLinkActive="active">
              <mat-icon matListItemIcon>list</mat-icon>
              <span matListItemTitle>My Leaves</span>
            </a>
          </ng-container>
          <mat-divider></mat-divider>
          <h3 matSubheader>Performance</h3>
          <a mat-list-item routerLink="/performance/reviews" routerLinkActive="active">
            <mat-icon matListItemIcon>star_rate</mat-icon>
            <span matListItemTitle>Reviews</span>
          </a>
          <a mat-list-item routerLink="/performance/goals" routerLinkActive="active">
            <mat-icon matListItemIcon>flag</mat-icon>
            <span matListItemTitle>Goals</span>
          </a>

          <!-- Manager links -->
          <ng-container *ngIf="isManagerOrAdmin()">
            <mat-divider></mat-divider>
            <h3 matSubheader>Manager</h3>
            <a mat-list-item routerLink="/manager/dashboard" routerLinkActive="active">
              <mat-icon matListItemIcon>supervisor_account</mat-icon>
              <span matListItemTitle>Team Overview</span>
            </a>
            <a mat-list-item routerLink="/leave/approvals" routerLinkActive="active">
              <mat-icon matListItemIcon>approval</mat-icon>
              <span matListItemTitle>Leave Approvals</span>
            </a>
          </ng-container>

          <!-- Admin links -->
          <ng-container *ngIf="isAdmin()">
            <mat-divider></mat-divider>
            <h3 matSubheader>Admin</h3>
            <a mat-list-item routerLink="/admin/dashboard" routerLinkActive="active">
              <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
              <span matListItemTitle>HR Dashboard</span>
            </a>
            <a mat-list-item routerLink="/admin/employees" routerLinkActive="active">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Employees</span>
            </a>
            <a mat-list-item routerLink="/admin/departments" routerLinkActive="active">
              <mat-icon matListItemIcon>apartment</mat-icon>
              <span matListItemTitle>Departments</span>
            </a>
            <a mat-list-item routerLink="/admin/holidays" routerLinkActive="active">
              <mat-icon matListItemIcon>calendar_month</mat-icon>
              <span matListItemTitle>Holidays</span>
            </a>
            <a mat-list-item routerLink="/admin/announcements" routerLinkActive="active">
              <mat-icon matListItemIcon>campaign</mat-icon>
              <span matListItemTitle>Announcements</span>
            </a>
            <a mat-list-item routerLink="/admin/leave-balances" routerLinkActive="active">
              <mat-icon matListItemIcon>account_balance_wallet</mat-icon>
              <span matListItemTitle>Leave Balances</span>
            </a>
          </ng-container>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="spacer"></span>
          <button mat-icon-button routerLink="/notifications" [matBadge]="unreadCount() || null" matBadgeColor="warn">
            <mat-icon>notifications</mat-icon>
          </button>
          <button mat-button [matMenuTriggerFor]="userMenu" class="user-btn">
            <mat-icon>account_circle</mat-icon>
            <span class="user-name">{{ user?.firstName }} {{ user?.lastName }}</span>
            <span class="role-chip" [ngClass]="'role-' + (user?.role || '').toLowerCase()">{{ user?.role }}</span>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon> Profile
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon> Sign Out
            </button>
          </mat-menu>
        </mat-toolbar>

        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav { width: 240px; padding-top: 0; }
    .sidenav-header {
      display: flex; align-items: center; gap: 8px;
      padding: 16px; background: #3f51b5; color: white;
      mat-icon { font-size: 28px; }
      span { font-size: 18px; font-weight: 600; }
    }
    .toolbar { position: sticky; top: 0; z-index: 1; }
    .spacer { flex: 1; }
    .main-content { padding: 24px; }
    .active { background: rgba(63, 81, 181, 0.1); color: #3f51b5; }
    .user-btn { display: flex; align-items: center; gap: 6px; }
    .user-name { font-size: 14px; }
    .role-chip { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.3px; }
    .role-admin { background: rgba(244,67,54,0.2); color: #f44336; }
    .role-manager { background: rgba(255,152,0,0.2); color: #ff9800; }
    .role-employee { background: rgba(76,175,80,0.2); color: #4caf50; }
  `]
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  user = this.authService.getCurrentUser();
  unreadCount = this.notificationService.unreadCount;

  constructor() {
    this.notificationService.getUnreadCount().subscribe({ error: () => {} });
  }

  isAdmin(): boolean { return this.user?.role === 'ADMIN'; }
  isManagerOrAdmin(): boolean { return this.user?.role === 'MANAGER' || this.user?.role === 'ADMIN'; }

  logout(): void { this.authService.logout(); }
}
