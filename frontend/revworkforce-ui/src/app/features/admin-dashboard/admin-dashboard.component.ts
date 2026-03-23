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
          <mat-icon class="stat-icon blue">people</mat-icon>
          <div class="stat-body">
            <div class="stat-value">{{ stats.totalEmployees }}</div>
            <div class="stat-label">Total Employees</div>
            <div class="stat-sub">{{ stats.activeEmployees }} active</div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card clickable" routerLink="/leave/approvals">
        <mat-card-content>
          <mat-icon class="stat-icon orange">pending_actions</mat-icon>
          <div class="stat-body">
            <div class="stat-value">{{ stats.pendingApprovals }}</div>
            <div class="stat-label">Pending Approvals</div>
            <div class="stat-sub" *ngIf="stats.pendingApprovals > 0" style="color:#e65100">Needs attention</div>
            <div class="stat-sub" *ngIf="stats.pendingApprovals === 0" style="color:#2e7d32">All clear</div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card clickable" routerLink="/admin/departments">
        <mat-card-content>
          <mat-icon class="stat-icon purple">apartment</mat-icon>
          <div class="stat-body">
            <div class="stat-value">{{ stats.totalDepartments }}</div>
            <div class="stat-label">Departments</div>
            <div class="stat-sub">{{ stats.activeDepartments }} active</div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-content>
          <mat-icon class="stat-icon green">event_available</mat-icon>
          <div class="stat-body">
            <div class="stat-value">{{ stats.upcomingHolidays }}</div>
            <div class="stat-label">Upcoming Holidays</div>
            <div class="stat-sub" *ngIf="nextHoliday">Next: {{ nextHoliday.name }} ({{ nextHoliday.date | date:'dd MMM' }})</div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Role distribution -->
    <div class="section-grid">
      <div>
        <h2>Team Breakdown</h2>
        <mat-card class="breakdown-card">
          <mat-card-content>
            <div class="breakdown-item">
              <div class="breakdown-label">
                <span class="dot blue"></span> Employees
              </div>
              <div class="breakdown-bar-wrap">
                <div class="breakdown-bar" [style.width.%]="getPercent(stats.employeeCount, stats.totalEmployees)" style="background:#3f51b5"></div>
              </div>
              <span class="breakdown-count">{{ stats.employeeCount }}</span>
            </div>
            <div class="breakdown-item">
              <div class="breakdown-label">
                <span class="dot orange"></span> Managers
              </div>
              <div class="breakdown-bar-wrap">
                <div class="breakdown-bar" [style.width.%]="getPercent(stats.managerCount, stats.totalEmployees)" style="background:#e65100"></div>
              </div>
              <span class="breakdown-count">{{ stats.managerCount }}</span>
            </div>
            <div class="breakdown-item">
              <div class="breakdown-label">
                <span class="dot red"></span> Admins
              </div>
              <div class="breakdown-bar-wrap">
                <div class="breakdown-bar" [style.width.%]="getPercent(stats.adminCount, stats.totalEmployees)" style="background:#c62828"></div>
              </div>
              <span class="breakdown-count">{{ stats.adminCount }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Upcoming holidays -->
      <div>
        <h2>Upcoming Holidays</h2>
        <mat-card>
          <mat-card-content>
            <div *ngFor="let h of upcomingHolidays" class="holiday-item">
              <div>
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
      <button mat-raised-button color="primary" routerLink="/admin/employees">
        <mat-icon>person_add</mat-icon> Add Employee
      </button>
      <button mat-raised-button color="accent" routerLink="/admin/departments">
        <mat-icon>apartment</mat-icon> Manage Departments
      </button>
      <button mat-raised-button routerLink="/admin/announcements">
        <mat-icon>campaign</mat-icon> Post Announcement
      </button>
      <button mat-raised-button routerLink="/admin/holidays">
        <mat-icon>calendar_month</mat-icon> Manage Holidays
      </button>
      <button mat-raised-button routerLink="/leave/approvals">
        <mat-icon>approval</mat-icon> Leave Approvals
      </button>
    </div>

    <style>
      .page-header { margin-bottom: 24px; }
      .page-header h1 { margin: 0; }
      .page-header p { color: #666; margin: 4px 0 0; }
      .stat-card mat-card-content { display: flex; align-items: center; gap: 16px; padding: 20px; }
      .stat-icon { font-size: 40px; width: 40px; height: 40px; }
      .stat-icon.blue { color: #3f51b5; }
      .stat-icon.orange { color: #e65100; }
      .stat-icon.purple { color: #6a1b9a; }
      .stat-icon.green { color: #2e7d32; }
      .stat-body { flex: 1; }
      .stat-value { font-size: 32px; font-weight: 700; color: #222; line-height: 1; }
      .stat-label { font-size: 14px; color: #666; margin: 4px 0 2px; }
      .stat-sub { font-size: 12px; color: #999; }
      .clickable { cursor: pointer; transition: box-shadow 0.2s; }
      .clickable:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
      h2 { margin: 24px 0 16px; font-size: 18px; }
      .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 0 0 24px; }
      @media (max-width: 768px) { .section-grid { grid-template-columns: 1fr; } }
      .breakdown-card mat-card-content { padding: 16px; }
      .breakdown-item { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
      .breakdown-label { width: 90px; font-size: 13px; display: flex; align-items: center; gap: 6px; }
      .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
      .dot.blue { background: #3f51b5; }
      .dot.orange { background: #e65100; }
      .dot.red { background: #c62828; }
      .breakdown-bar-wrap { flex: 1; height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
      .breakdown-bar { height: 100%; border-radius: 4px; transition: width 0.5s; }
      .breakdown-count { font-weight: 600; font-size: 14px; width: 28px; text-align: right; }
      .holiday-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
      .holiday-item:last-child { border-bottom: none; }
      .holiday-date { color: #666; font-size: 12px; margin: 2px 0 0; }
      .type-badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
      .type-national { background: #e3f2fd; color: #1565c0; }
      .type-regional { background: #e8f5e9; color: #2e7d32; }
      .type-optional { background: #fff9c4; color: #f57f17; }
      .type-company { background: #f3e5f5; color: #6a1b9a; }
      .empty-msg { color: #999; text-align: center; padding: 16px; }
      .quick-actions { display: flex; gap: 12px; flex-wrap: wrap; }
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
