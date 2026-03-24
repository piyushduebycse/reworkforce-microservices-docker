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
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatBadgeModule, MatMenuModule, MatDividerModule],
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav #sidenav mode="side" opened class="sidebar">

        <div class="brand">
          <div class="brand-icon"><mat-icon>hub</mat-icon></div>
          <div>
            <div class="brand-name">RevWorkforce</div>
            <div class="brand-sub">HR Platform</div>
          </div>
        </div>

        <nav class="nav-menu">
          <div class="nav-group">
            <span class="nav-label">General</span>
            <a class="nav-item" routerLink="/employee/dashboard" routerLinkActive="nav-active">
              <div class="ni"><mat-icon>grid_view</mat-icon></div><span>Dashboard</span>
            </a>
            <a class="nav-item" routerLink="/directory" routerLinkActive="nav-active">
              <div class="ni"><mat-icon>group</mat-icon></div><span>Directory</span>
            </a>
          </div>

          <ng-container *ngIf="!isAdmin()">
            <div class="nav-group">
              <span class="nav-label">Leave</span>
              <a class="nav-item" routerLink="/leave/balance" routerLinkActive="nav-active">
                <div class="ni"><mat-icon>event_available</mat-icon></div><span>My Balance</span>
              </a>
              <a class="nav-item" routerLink="/leave/apply" routerLinkActive="nav-active">
                <div class="ni"><mat-icon>add_circle_outline</mat-icon></div><span>Apply Leave</span>
              </a>
              <a class="nav-item" routerLink="/leave/list" routerLinkActive="nav-active">
                <div class="ni"><mat-icon>list_alt</mat-icon></div><span>My Leaves</span>
              </a>
            </div>
          </ng-container>

          <div class="nav-group">
            <span class="nav-label">Performance</span>
            <a class="nav-item" routerLink="/performance/reviews" routerLinkActive="nav-active">
              <div class="ni"><mat-icon>star_rate</mat-icon></div><span>Reviews</span>
            </a>
            <a class="nav-item" routerLink="/performance/goals" routerLinkActive="nav-active">
              <div class="ni"><mat-icon>flag</mat-icon></div><span>Goals</span>
            </a>
          </div>

          <ng-container *ngIf="isManagerOrAdmin()">
            <div class="nav-group">
              <span class="nav-label">Manager</span>
              <a class="nav-item" routerLink="/manager/dashboard" routerLinkActive="nav-active">
                <div class="ni"><mat-icon>supervisor_account</mat-icon></div><span>Team Overview</span>
              </a>
              <a class="nav-item" routerLink="/leave/approvals" routerLinkActive="nav-active">
                <div class="ni"><mat-icon>approval</mat-icon></div><span>Leave Approvals</span>
              </a>
            </div>
          </ng-container>

          <ng-container *ngIf="isAdmin()">
            <div class="nav-group">
              <span class="nav-label">Admin</span>
              <a class="nav-item" routerLink="/admin/dashboard" routerLinkActive="nav-active">
                <div class="ni"><mat-icon>admin_panel_settings</mat-icon></div><span>HR Dashboard</span>
              </a>
              <a class="nav-item" routerLink="/admin/employees" routerLinkActive="nav-active">
                <div class="ni"><mat-icon>people</mat-icon></div><span>Employees</span>
              </a>
              <a class="nav-item" routerLink="/admin/departments" routerLinkActive="nav-active">
                <div class="ni"><mat-icon>corporate_fare</mat-icon></div><span>Departments</span>
              </a>
              <a class="nav-item" routerLink="/leave/approvals" routerLinkActive="nav-active">
                <div class="ni"><mat-icon>approval</mat-icon></div><span>Leave Approvals</span>
              </a>
              <a class="nav-item" routerLink="/admin/leave-balances" routerLinkActive="nav-active">
                <div class="ni"><mat-icon>account_balance_wallet</mat-icon></div><span>Leave Config</span>
              </a>
              <a class="nav-item" routerLink="/admin/holidays" routerLinkActive="nav-active">
                <div class="ni"><mat-icon>calendar_month</mat-icon></div><span>Holidays</span>
              </a>
              <a class="nav-item" routerLink="/admin/announcements" routerLinkActive="nav-active">
                <div class="ni"><mat-icon>campaign</mat-icon></div><span>Announcements</span>
              </a>
            </div>
          </ng-container>
        </nav>

        <div class="sidebar-footer">
          <div class="user-mini" routerLink="/profile">
            <div class="uavs">{{ getInitials() }}</div>
            <div>
              <div class="um-name">{{ user?.firstName }} {{ user?.lastName }}</div>
              <div class="um-role">{{ user?.role }}</div>
            </div>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="main-area">
        <header class="topbar">
          <button class="topbar-btn" (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="topbar-right">
            <button class="topbar-btn" routerLink="/notifications"
              [matBadge]="unreadCount() > 0 ? unreadCount() : null" matBadgeColor="warn" matBadgeSize="small">
              <mat-icon>notifications_none</mat-icon>
            </button>
            <button class="user-btn" [matMenuTriggerFor]="userMenu">
              <div class="uav">{{ getInitials() }}</div>
              <div class="ubinfo">
                <span class="ubn">{{ user?.firstName }} {{ user?.lastName }}</span>
                <span class="role-chip role-{{ (user?.role || '').toLowerCase() }}">{{ user?.role }}</span>
              </div>
              <mat-icon style="font-size:18px;color:var(--text-3)">expand_more</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu" xPosition="before">
              <button mat-menu-item routerLink="/profile">
                <mat-icon>person_outline</mat-icon> My Profile
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()" style="color:var(--danger)">
                <mat-icon style="color:var(--danger)">logout</mat-icon> Sign Out
              </button>
            </mat-menu>
          </div>
        </header>
        <main class="page-content"><router-outlet></router-outlet></main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .shell { height: 100vh; }
    .sidebar {
      width: 246px;
      background: var(--bg-surface) !important;
      border-right: 1px solid var(--border) !important;
      display: flex; flex-direction: column; overflow: hidden;
    }
    .brand {
      display: flex; align-items: center; gap: 12px;
      padding: 18px 16px 14px; border-bottom: 1px solid var(--border); flex-shrink: 0;
    }
    .brand-icon {
      width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--primary), var(--primary-h));
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px var(--primary-glow);
    }
    .brand-icon mat-icon { color: #fff; font-size: 20px; }
    .brand-name { font-size: 14px; font-weight: 700; color: var(--text-1); }
    .brand-sub  { font-size: 11px; color: var(--text-3); }
    .nav-menu { flex: 1; overflow-y: auto; padding: 4px 8px 12px; }
    .nav-group { margin-bottom: 4px; }
    .nav-label {
      display: block; font-size: 10px; font-weight: 700; letter-spacing: 1.2px;
      text-transform: uppercase; color: var(--text-3); padding: 14px 10px 5px;
    }
    .nav-item {
      display: flex; align-items: center; gap: 10px; padding: 8px 10px;
      border-radius: 9px; color: var(--text-2); font-size: 13.5px; font-weight: 500;
      text-decoration: none; cursor: pointer; margin-bottom: 1px;
      transition: background 0.15s, color 0.15s;
    }
    .nav-item:hover { background: rgba(255,255,255,0.05); color: var(--text-1); }
    .nav-item.nav-active { background: var(--primary-glow); color: var(--primary); }
    .ni {
      width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .ni mat-icon { font-size: 17px; width: 17px; height: 17px; }
    .sidebar-footer { border-top: 1px solid var(--border); padding: 10px 12px; flex-shrink: 0; }
    .user-mini {
      display: flex; align-items: center; gap: 10px; cursor: pointer;
      border-radius: 9px; padding: 6px; transition: background 0.15s;
    }
    .user-mini:hover { background: rgba(255,255,255,0.05); }
    .uavs {
      width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, var(--primary), var(--primary-h));
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #fff;
    }
    .um-name { font-size: 12.5px; font-weight: 600; color: var(--text-1); }
    .um-role { font-size: 10px; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.5px; }
    .main-area { display: flex; flex-direction: column; overflow: hidden; }
    .topbar {
      display: flex; align-items: center; justify-content: space-between;
      height: 58px; padding: 0 20px; flex-shrink: 0;
      background: var(--bg-surface); border-bottom: 1px solid var(--border);
      position: sticky; top: 0; z-index: 100;
    }
    .topbar-right { display: flex; align-items: center; gap: 8px; }
    .topbar-btn {
      width: 36px; height: 36px; border-radius: 9px; border: none; background: transparent;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: var(--text-2); transition: background 0.15s, color 0.15s; position: relative;
    }
    .topbar-btn:hover { background: rgba(255,255,255,0.07); color: var(--text-1); }
    .topbar-btn mat-icon { font-size: 20px; }
    .user-btn {
      display: flex; align-items: center; gap: 9px; background: transparent;
      border: 1px solid var(--border); border-radius: 10px; padding: 5px 11px;
      cursor: pointer; transition: border-color 0.15s, background 0.15s;
    }
    .user-btn:hover { border-color: var(--border-a); background: rgba(255,255,255,0.04); }
    .uav {
      width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, var(--primary), var(--primary-h));
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #fff;
    }
    .ubinfo { display: flex; flex-direction: column; align-items: flex-start; }
    .ubn { font-size: 13px; font-weight: 600; color: var(--text-1); line-height: 1.3; }
    .role-chip {
      font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 20px;
      text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.7;
    }
    .role-admin    { background: var(--danger-bg);  color: var(--danger); }
    .role-manager  { background: var(--warning-bg); color: var(--warning); }
    .role-employee { background: var(--success-bg); color: var(--success); }
    .page-content { flex: 1; overflow-y: auto; padding: 28px; }
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
  getInitials(): string {
    return ((this.user?.firstName?.[0] || '') + (this.user?.lastName?.[0] || '')).toUpperCase();
  }
  logout(): void { this.authService.logout(); }
}
