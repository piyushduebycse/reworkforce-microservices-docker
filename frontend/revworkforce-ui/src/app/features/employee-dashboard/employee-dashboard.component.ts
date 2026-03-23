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

    <!-- Leave Balances -->
    <h2>Leave Balances</h2>
    <div class="card-grid">
      <mat-card *ngFor="let balance of leaveBalances" class="balance-card">
        <mat-card-content>
          <div class="balance-info">
            <span class="leave-type">{{ balance.leaveTypeName }}</span>
            <span class="days">{{ balance.remainingDays }}<small>/{{ balance.totalDays }}</small></span>
          </div>
          <mat-progress-bar mode="determinate" [value]="getUsagePercent(balance)"></mat-progress-bar>
          <span class="used-text">{{ balance.usedDays }} days used</span>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Recent Leave Applications -->
    <div class="section">
      <div class="section-header">
        <h2>Recent Leave Applications</h2>
        <button mat-button color="primary" routerLink="/leave/apply">+ Apply Leave</button>
      </div>
      <mat-card *ngFor="let app of recentApplications" class="list-card">
        <mat-card-content>
          <div class="list-item">
            <div>
              <strong>{{ app.leaveTypeName }}</strong>
              <p class="date-range">{{ app.startDate | date:'mediumDate' }} - {{ app.endDate | date:'mediumDate' }} ({{ app.numberOfDays }} days)</p>
            </div>
            <span class="status-badge" [class]="app.status.toLowerCase()">{{ app.status }}</span>
          </div>
        </mat-card-content>
      </mat-card>
      <p *ngIf="recentApplications.length === 0" class="empty-state">No leave applications yet</p>
    </div>

    <!-- Goals -->
    <div class="section">
      <div class="section-header">
        <h2>My Goals</h2>
        <button mat-button color="primary" routerLink="/performance/goals">View All</button>
      </div>
      <mat-card *ngFor="let goal of activeGoals" class="list-card">
        <mat-card-content>
          <strong>{{ goal.title }}</strong>
          <p class="goal-status">{{ goal.status }}</p>
          <mat-progress-bar mode="determinate" [value]="goal.progress"></mat-progress-bar>
          <span class="progress-text">{{ goal.progress }}% complete</span>
        </mat-card-content>
      </mat-card>
      <p *ngIf="activeGoals.length === 0" class="empty-state">No active goals</p>
    </div>

    <!-- Upcoming Holidays -->
    <div class="section">
      <div class="section-header">
        <h2>Upcoming Holidays</h2>
        <span class="holiday-year">{{ currentYear }}</span>
      </div>
      <mat-card *ngFor="let h of upcomingHolidays" class="list-card">
        <mat-card-content>
          <div class="list-item">
            <div>
              <strong>{{ h.name }}</strong>
              <p class="date-range">{{ h.date | date:'fullDate' }}</p>
            </div>
            <span class="type-badge type-{{ h.holidayType?.toLowerCase() }}">{{ h.holidayType || 'COMPANY' }}</span>
          </div>
        </mat-card-content>
      </mat-card>
      <p *ngIf="upcomingHolidays.length === 0" class="empty-state">No upcoming holidays</p>
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
    h2 { margin: 24px 0 16px; font-size: 18px; color: #333; }
    .balance-card mat-card-content { padding: 16px; }
    .balance-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .leave-type { font-weight: 500; color: #333; }
    .days { font-size: 24px; font-weight: 700; color: #3f51b5; small { font-size: 14px; color: #666; } }
    .used-text { font-size: 12px; color: #666; margin-top: 4px; display: block; }
    .section { margin-bottom: 32px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .list-card { margin-bottom: 8px; }
    .list-item { display: flex; justify-content: space-between; align-items: center; }
    .date-range { color: #666; font-size: 13px; margin-top: 4px; }
    .goal-status { color: #666; font-size: 13px; margin: 4px 0; }
    .progress-text { font-size: 12px; color: #666; }
    .empty-state { color: #999; text-align: center; padding: 24px; }
    .type-badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
    .holiday-year { font-size: 13px; color: #999; }
    .type-national { background: #e3f2fd; color: #1565c0; }
    .type-regional { background: #e8f5e9; color: #2e7d32; }
    .type-optional { background: #fff9c4; color: #f57f17; }
    .type-company { background: #f3e5f5; color: #6a1b9a; }
    .announcement-card { margin-bottom: 8px; border-left: 4px solid #1976d2; }
    .announce-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .announce-date { font-size: 12px; color: #888; }
    .announce-body { color: #444; font-size: 14px; margin: 0; line-height: 1.5; }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  private leaveService = inject(LeaveService);
  private performanceService = inject(PerformanceService);
  private authService = inject(AuthService);
  private empMgmtService = inject(EmployeeManagementService);

  user = this.authService.getCurrentUser();
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
    this.leaveService.getMyBalances().subscribe({ next: r => this.leaveBalances = r.data || [], error: () => {} });
    this.leaveService.getMyApplications().subscribe({ next: r => this.recentApplications = (r.data || []).slice(0, 3), error: () => {} });
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
