import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { LeaveService } from '../../core/services/leave.service';
import { PerformanceService } from '../../core/services/performance.service';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeManagementService } from '../../core/services/employee-management.service';
import { LeaveBalance, LeaveApplication } from '../../core/models/leave.model';
import { Goal } from '../../core/models/performance.model';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatChipsModule],
  template: `
    <div class="page-header">
      <h1>Welcome, {{ user?.firstName }}!</h1>
      <p>Here's your HR overview for today</p>
    </div>

    <!-- Leave Balances — hidden for ADMIN -->
    <ng-container *ngIf="!isAdmin">
      <div class="section-header">
        <h2>Leave Balances</h2>
      </div>
      <div class="card-grid">
        <mat-card *ngFor="let balance of leaveBalances" class="balance-card">
          <mat-card-content>
            <div class="bal-card">
              <div class="bal-top">
                <span class="bal-name">{{ balance.leaveTypeName }}</span>
                <span class="bal-days">{{ balance.remainingDays }}<small>/{{ balance.totalDays }}</small></span>
              </div>
              <mat-progress-bar mode="determinate" [value]="getUsagePercent(balance)"></mat-progress-bar>
              <span class="bal-used">{{ balance.usedDays }} days used</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Recent Leave Applications — hidden for ADMIN -->
      <div class="section">
        <div class="section-header">
          <h2>Recent Leave Applications</h2>
          <button mat-stroked-button routerLink="/leave/apply">
            <mat-icon>add</mat-icon> Apply Leave
          </button>
        </div>
        <mat-card class="list-container" *ngIf="recentApplications.length > 0">
          <mat-card-content style="padding: 0;">
            <div *ngFor="let app of recentApplications; let last = last" class="list-row">
              <div class="list-row-left">
                <mat-icon class="row-icon primary-icon">event_note</mat-icon>
                <div class="row-body">
                  <strong>{{ app.leaveTypeName }}</strong>
                  <p class="row-sub">{{ app.startDate | date:'mediumDate' }} – {{ app.endDate | date:'mediumDate' }} &bull; {{ app.numberOfDays }} day{{ app.numberOfDays !== 1 ? 's' : '' }}</p>
                </div>
              </div>
              <span class="status-badge" [class]="app.status.toLowerCase()">{{ app.status }}</span>
            </div>
          </mat-card-content>
        </mat-card>
        <div *ngIf="recentApplications.length === 0" class="empty-state">
          <mat-icon>inbox</mat-icon>
          <p>No leave applications yet</p>
        </div>
      </div>
    </ng-container>

    <!-- Goals -->
    <div class="section">
      <div class="section-header">
        <h2>My Goals</h2>
        <button mat-stroked-button routerLink="/performance/goals">View All</button>
      </div>
      <mat-card class="list-container" *ngIf="activeGoals.length > 0">
        <mat-card-content style="padding: 0;">
          <div *ngFor="let goal of activeGoals; let last = last" class="list-row goal-row">
            <div class="goal-info">
              <div class="goal-top">
                <strong>{{ goal.title }}</strong>
                <span class="goal-status-text">{{ goal.status }}</span>
              </div>
              <div class="goal-progress-wrap">
                <mat-progress-bar mode="determinate" [value]="goal.progress"></mat-progress-bar>
                <span class="progress-label">{{ goal.progress }}% complete</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
      <div *ngIf="activeGoals.length === 0" class="empty-state">
        <mat-icon>flag</mat-icon>
        <p>No active goals</p>
      </div>
    </div>

    <!-- Upcoming Holidays -->
    <div class="section">
      <div class="section-header">
        <h2>Upcoming Holidays</h2>
        <span class="year-badge">{{ currentYear }}</span>
      </div>
      <mat-card class="list-container" *ngIf="upcomingHolidays.length > 0">
        <mat-card-content style="padding: 0;">
          <div *ngFor="let h of upcomingHolidays; let last = last" class="list-row">
            <div class="list-row-left">
              <mat-icon class="row-icon holiday-icon">event</mat-icon>
              <div class="row-body">
                <strong>{{ h.name }}</strong>
                <p class="row-sub">{{ h.date | date:'fullDate' }}</p>
              </div>
            </div>
            <span class="type-badge type-{{ h.holidayType?.toLowerCase() }}">{{ h.holidayType || 'COMPANY' }}</span>
          </div>
        </mat-card-content>
      </mat-card>
      <div *ngIf="upcomingHolidays.length === 0" class="empty-state">
        <mat-icon>event_busy</mat-icon>
        <p>No upcoming holidays</p>
      </div>
    </div>

    <!-- Announcements -->
    <div class="section" *ngIf="announcements.length > 0">
      <div class="section-header">
        <h2>Announcements</h2>
      </div>
      <mat-card *ngFor="let a of announcements" class="announcement-card">
        <mat-card-content>
          <div class="announce-header">
            <strong>{{ a.title }}</strong>
            <span class="announce-date">{{ a.createdAt | date:'dd MMM yyyy' }}</span>
          </div>
          <p class="announce-body">{{ a.content }}</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    h2 { margin: 0; font-size: 17px; font-weight: 600; color: var(--text-1); }

    .section { margin-bottom: 32px; }
    .section-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 14px;
    }

    /* Balance Cards */
    .balance-card { background: var(--bg-card); border: 1px solid var(--border); }
    .balance-card mat-card-content { padding: 0 !important; }
    .bal-card { padding: 16px; }
    .bal-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .bal-name { font-size: 13px; font-weight: 600; color: var(--text-2); }
    .bal-days { font-size: 22px; font-weight: 800; color: var(--text-1); }
    .bal-days small { font-size: 13px; color: var(--text-3); }
    .bal-used { font-size: 11px; color: var(--text-3); margin-top: 6px; display: block; }

    /* List container */
    .list-container { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
    .list-container mat-card-content { padding: 0 !important; }

    /* List rows */
    .list-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 16px; border-bottom: 1px solid var(--border);
    }
    .list-row:last-child { border-bottom: none; }
    .list-row-left { display: flex; align-items: center; gap: 12px; flex: 1; }
    .row-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
    .primary-icon { color: var(--primary); }
    .holiday-icon { color: var(--purple); }
    .row-body strong { font-size: 14px; font-weight: 600; color: var(--text-1); display: block; }
    .row-sub { font-size: 12px; color: var(--text-3); margin: 3px 0 0; }

    /* Goals */
    .goal-row { flex-direction: column; align-items: flex-start; gap: 0; }
    .goal-info { width: 100%; }
    .goal-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .goal-top strong { font-size: 14px; font-weight: 600; color: var(--text-1); }
    .goal-status-text { font-size: 11px; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.05em; }
    .goal-progress-wrap { display: flex; flex-direction: column; gap: 5px; }
    .progress-label { font-size: 11px; color: var(--text-3); }

    /* Holiday type badges */
    .type-badge { padding: 3px 9px; border-radius: 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
    .type-national { background: var(--blue-bg); color: var(--blue); }
    .type-regional { background: var(--success-bg); color: var(--success); }
    .type-optional { background: var(--warning-bg); color: var(--warning); }
    .type-company { background: var(--purple-bg); color: var(--purple); }

    /* Year badge */
    .year-badge { font-size: 12px; color: var(--text-3); background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 3px 10px; }

    /* Empty state */
    .empty-state { text-align: center; color: var(--text-3); padding: 36px 24px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); }
    .empty-state mat-icon { font-size: 32px; width: 32px; height: 32px; display: block; margin: 0 auto 8px; opacity: 0.4; }
    .empty-state p { margin: 0; font-size: 14px; }

    /* Announcements */
    .announcement-card {
      margin-bottom: 10px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-left: 4px solid var(--primary);
      border-radius: var(--radius);
    }
    .announce-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .announce-header strong { font-size: 14px; font-weight: 600; color: var(--text-1); }
    .announce-date { font-size: 12px; color: var(--text-3); }
    .announce-body { color: var(--text-2); font-size: 14px; margin: 0; line-height: 1.6; }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  private leaveService = inject(LeaveService);
  private performanceService = inject(PerformanceService);
  private authService = inject(AuthService);
  private empMgmtService = inject(EmployeeManagementService);

  user = this.authService.getCurrentUser();
  isAdmin = this.user?.role === 'ADMIN';
  leaveBalances: LeaveBalance[] = [];
  recentApplications: LeaveApplication[] = [];
  activeGoals: Goal[] = [];
  upcomingHolidays: any[] = [];
  announcements: any[] = [];
  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (!this.isAdmin) {
      this.leaveService.getMyBalances().subscribe({ next: r => this.leaveBalances = r.data || [], error: () => {} });
      this.leaveService.getMyApplications().subscribe({ next: r => this.recentApplications = (r.data || []).slice(0, 3), error: () => {} });
    }
    this.performanceService.getMyGoals().subscribe({ next: r => this.activeGoals = (r.data || []).filter(g => g.status !== 'CANCELLED').slice(0, 3), error: () => {} });
    this.empMgmtService.getUpcomingHolidays().subscribe({ next: r => this.upcomingHolidays = (r.data || []).slice(0, 5), error: () => {} });
    this.empMgmtService.getAnnouncements().subscribe({ next: r => {
      const userRole = this.user?.role || '';
      this.announcements = (r.data || []).filter((a: any) =>
        a.active !== false &&
        (a.targetRole === 'ALL' || a.targetRole === userRole)
      ).slice(0, 5);
    }, error: () => {} });
  }

  getUsagePercent(balance: LeaveBalance): number {
    return balance.totalDays > 0 ? (balance.usedDays / balance.totalDays) * 100 : 0;
  }
}
