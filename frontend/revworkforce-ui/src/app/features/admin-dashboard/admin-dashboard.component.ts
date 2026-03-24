import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../core/services/user.service';
import { LeaveService } from '../../core/services/leave.service';
import { EmployeeManagementService } from '../../core/services/employee-management.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressSpinnerModule],
  template: `
    <div class="page-header">
      <h1>HR Dashboard</h1>
      <p>Company-wide HR metrics and management</p>
    </div>

    <div class="card-grid">
      <mat-card class="stat-card clickable" routerLink="/admin/employees">
        <mat-card-content>
          <div class="stat-icon-wrap blue"><mat-icon>people</mat-icon></div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.totalEmployees }}</div>
            <div class="stat-label">Total Employees</div>
            <div class="stat-sub ok">{{ stats.activeEmployees }} active</div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card clickable" routerLink="/leave/approvals">
        <mat-card-content>
          <div class="stat-icon-wrap orange"><mat-icon>pending_actions</mat-icon></div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.pendingApprovals }}</div>
            <div class="stat-label">Pending Approvals</div>
            <div class="stat-sub alert" *ngIf="stats.pendingApprovals > 0">Needs attention</div>
            <div class="stat-sub ok" *ngIf="stats.pendingApprovals === 0">All clear</div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card clickable" routerLink="/admin/departments">
        <mat-card-content>
          <div class="stat-icon-wrap purple"><mat-icon>apartment</mat-icon></div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.totalDepartments }}</div>
            <div class="stat-label">Departments</div>
            <div class="stat-sub ok">{{ stats.activeDepartments }} active</div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-content>
          <div class="stat-icon-wrap green"><mat-icon>event_available</mat-icon></div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.upcomingHolidays }}</div>
            <div class="stat-label">Upcoming Holidays</div>
            <div class="stat-sub ok" *ngIf="nextHoliday">Next: {{ nextHoliday.name }} ({{ nextHoliday.date | date:'dd MMM' }})</div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Role distribution + upcoming holidays -->
    <div class="section-grid">
      <div>
        <h2>Team Breakdown</h2>
        <mat-card class="breakdown-card">
          <mat-card-content>
            <div class="breakdown-item">
              <div class="breakdown-label">
                <span class="dot" style="background: var(--blue);"></span> Employees
              </div>
              <div class="breakdown-bar-wrap">
                <div class="breakdown-bar" [style.width.%]="getPercent(stats.employeeCount, stats.totalEmployees)" style="background: var(--blue);"></div>
              </div>
              <span class="breakdown-count">{{ stats.employeeCount }}</span>
            </div>
            <div class="breakdown-item">
              <div class="breakdown-label">
                <span class="dot" style="background: var(--orange);"></span> Managers
              </div>
              <div class="breakdown-bar-wrap">
                <div class="breakdown-bar" [style.width.%]="getPercent(stats.managerCount, stats.totalEmployees)" style="background: var(--orange);"></div>
              </div>
              <span class="breakdown-count">{{ stats.managerCount }}</span>
            </div>
            <div class="breakdown-item">
              <div class="breakdown-label">
                <span class="dot" style="background: var(--danger);"></span> Admins
              </div>
              <div class="breakdown-bar-wrap">
                <div class="breakdown-bar" [style.width.%]="getPercent(stats.adminCount, stats.totalEmployees)" style="background: var(--danger);"></div>
              </div>
              <span class="breakdown-count">{{ stats.adminCount }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Upcoming holidays -->
      <div>
        <h2>Upcoming Holidays</h2>
        <mat-card class="holidays-card">
          <mat-card-content style="padding: 0;">
            <div *ngFor="let h of upcomingHolidays; let last = last" class="holiday-item" [class.last]="last">
              <div class="holiday-info">
                <strong>{{ h.name }}</strong>
                <p class="holiday-date">{{ h.date | date:'fullDate' }}</p>
              </div>
              <span class="type-badge type-{{ h.holidayType?.toLowerCase() }}">{{ h.holidayType || 'COMPANY' }}</span>
            </div>
            <div *ngIf="upcomingHolidays.length === 0" class="empty-msg">No upcoming holidays</div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <h2>Quick Actions</h2>
    <div class="quick-actions">
      <button mat-stroked-button routerLink="/admin/employees">
        <mat-icon>person_add</mat-icon> Add Employee
      </button>
      <button mat-stroked-button routerLink="/admin/departments">
        <mat-icon>apartment</mat-icon> Manage Departments
      </button>
      <button mat-stroked-button routerLink="/admin/announcements">
        <mat-icon>campaign</mat-icon> Post Announcement
      </button>
      <button mat-stroked-button routerLink="/admin/holidays">
        <mat-icon>calendar_month</mat-icon> Manage Holidays
      </button>
      <button mat-stroked-button routerLink="/leave/approvals">
        <mat-icon>approval</mat-icon> Leave Approvals
      </button>
    </div>

    <style>
      h2 { margin: 24px 0 14px; font-size: 17px; font-weight: 600; color: var(--text-1); }

      .breakdown-card mat-card-content { padding: 20px; }
      .breakdown-item { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
      .breakdown-item:last-child { margin-bottom: 0; }
      .breakdown-label { width: 90px; font-size: 13px; color: var(--text-2); display: flex; align-items: center; gap: 7px; }
      .dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
      .breakdown-bar-wrap { flex: 1; height: 7px; background: var(--bg-elevated); border-radius: 4px; overflow: hidden; }
      .breakdown-bar { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
      .breakdown-count { font-weight: 700; font-size: 14px; color: var(--text-1); width: 28px; text-align: right; }

      .holidays-card { overflow: hidden; }
      .holiday-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border); }
      .holiday-item.last { border-bottom: none; }
      .holiday-info strong { font-size: 14px; color: var(--text-1); display: block; }
      .holiday-date { color: var(--text-3); font-size: 12px; margin: 3px 0 0; }

      .type-badge { padding: 3px 9px; border-radius: 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
      .type-national { background: var(--blue-bg); color: var(--blue); }
      .type-regional { background: var(--success-bg); color: var(--success); }
      .type-optional { background: var(--warning-bg); color: var(--warning); }
      .type-company { background: var(--purple-bg); color: var(--purple); }

      .empty-msg { color: var(--text-3); text-align: center; padding: 20px; font-size: 14px; }

      .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 0 0 24px; }
      @media (max-width: 768px) { .section-grid { grid-template-columns: 1fr; } }
    </style>
  `
})
export class AdminDashboardComponent implements OnInit {
  private userService = inject(UserService);
  private leaveService = inject(LeaveService);
  private empMgmtService = inject(EmployeeManagementService);

  stats = {
    totalEmployees: 0, activeEmployees: 0,
    employeeCount: 0, managerCount: 0, adminCount: 0,
    pendingApprovals: 0, totalDepartments: 0, activeDepartments: 0,
    upcomingHolidays: 0
  };
  upcomingHolidays: any[] = [];
  nextHoliday: any = null;

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.userService.getAllUsers(0, 200).subscribe({
      next: r => {
        const users = r.data?.content || r.data || [];
        this.stats.totalEmployees = users.length;
        this.stats.activeEmployees = users.filter((u: any) => u.isActive).length;
        this.stats.employeeCount = users.filter((u: any) => u.role === 'EMPLOYEE').length;
        this.stats.managerCount = users.filter((u: any) => u.role === 'MANAGER').length;
        this.stats.adminCount = users.filter((u: any) => u.role === 'ADMIN').length;
      },
      error: () => {}
    });

    this.leaveService.getPendingApprovals().subscribe({
      next: r => this.stats.pendingApprovals = (r.data || []).length,
      error: () => {}
    });

    this.empMgmtService.getDepartments().subscribe({
      next: r => {
        const depts = r.data || [];
        this.stats.totalDepartments = depts.length;
        this.stats.activeDepartments = depts.filter((d: any) => d.isActive !== false).length;
      },
      error: () => {}
    });

    this.empMgmtService.getUpcomingHolidays().subscribe({
      next: r => {
        this.upcomingHolidays = (r.data || []).slice(0, 5);
        this.stats.upcomingHolidays = this.upcomingHolidays.length;
        this.nextHoliday = this.upcomingHolidays[0] || null;
      },
      error: () => {}
    });
  }

  getPercent(count: number, total: number): number {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }
}
