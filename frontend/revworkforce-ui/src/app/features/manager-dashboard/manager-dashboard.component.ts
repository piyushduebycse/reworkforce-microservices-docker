import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { LeaveService } from '../../core/services/leave.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { EmployeeManagementService } from '../../core/services/employee-management.service';
import { LeaveApplication } from '../../core/models/leave.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="page-header">
      <h1>Manager Dashboard</h1>
      <p>Welcome back, {{ currentUser?.firstName }}! Here's your team overview.</p>
    </div>

    <div class="card-grid">
      <mat-card class="stat-card">
        <mat-card-content>
          <div class="stat-icon-wrap blue"><mat-icon>people</mat-icon></div>
          <div class="stat-body">
            <div class="stat-value">{{ teamMembers.length }}</div>
            <div class="stat-label">Team Members</div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card clickable" routerLink="/leave/approvals">
        <mat-card-content>
          <div class="stat-icon-wrap orange"><mat-icon>pending_actions</mat-icon></div>
          <div class="stat-body">
            <div class="stat-value">{{ pendingApplications.length }}</div>
            <div class="stat-label">Pending Approvals</div>
            <div class="stat-sub alert" *ngIf="pendingApplications.length > 0">Needs review</div>
            <div class="stat-sub ok" *ngIf="pendingApplications.length === 0">All clear</div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-content>
          <div class="stat-icon-wrap green"><mat-icon>event_available</mat-icon></div>
          <div class="stat-body">
            <div class="stat-value">{{ upcomingHolidays.length }}</div>
            <div class="stat-label">Upcoming Holidays</div>
            <div class="stat-sub ok" *ngIf="upcomingHolidays[0]">Next: {{ upcomingHolidays[0].name }}</div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-content>
          <div class="stat-icon-wrap purple"><mat-icon>assignment</mat-icon></div>
          <div class="stat-body">
            <div class="stat-value">{{ teamApplications.length }}</div>
            <div class="stat-label">All Leave Requests</div>
            <div class="stat-sub ok">this team</div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="section-grid">
      <!-- Pending Approvals -->
      <div>
        <div class="section-header-row">
          <h2>Pending Approvals</h2>
          <button mat-stroked-button routerLink="/leave/approvals">View All</button>
        </div>

        <ng-container *ngIf="pendingApplications.length > 0">
          <mat-card *ngFor="let app of pendingApplications.slice(0, 4)" class="leave-card">
            <mat-card-content>
              <div class="leave-top">
                <div class="leave-left">
                  <div class="employee-name">{{ getEmployeeName(app.userId) }}</div>
                  <p class="leave-details">
                    {{ app.leaveTypeName }} &bull;
                    {{ app.startDate | date:'dd MMM' }} – {{ app.endDate | date:'dd MMM' }}
                    ({{ app.numberOfDays }} day{{ app.numberOfDays !== 1 ? 's' : '' }})
                  </p>
                  <p class="reason" *ngIf="app.reason">{{ app.reason }}</p>
                </div>
              </div>
              <div class="actions">
                <button mat-stroked-button color="primary" (click)="approveLeave(app.id)" [disabled]="processingId === app.id">
                  <mat-icon>check</mat-icon> Approve
                </button>
                <button mat-stroked-button color="warn" (click)="rejectLeave(app.id)" [disabled]="processingId === app.id">
                  <mat-icon>close</mat-icon> Reject
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </ng-container>

        <mat-card *ngIf="pendingApplications.length === 0" class="empty-card">
          <mat-card-content>
            <mat-icon class="empty-icon success-icon">check_circle_outline</mat-icon>
            <p>No pending approvals</p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Team Members -->
      <div>
        <h2>My Team</h2>
        <mat-card class="team-card">
          <mat-card-content style="padding: 0;">
            <div *ngFor="let member of teamMembers; let last = last" class="team-member" [class.last]="last">
              <div class="member-avatar">{{ getInitials(member) }}</div>
              <div class="member-info">
                <strong>{{ member.firstName }} {{ member.lastName }}</strong>
                <span class="member-id">{{ member.employeeId }}</span>
              </div>
              <span class="status-dot" [class.active]="member.isActive" [title]="member.isActive ? 'Active' : 'Inactive'"></span>
            </div>
            <div *ngIf="teamMembers.length === 0" class="empty-team">No direct reports</div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <!-- Upcoming Holidays -->
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

    <style>
      h2 { margin: 0; font-size: 17px; font-weight: 600; color: var(--text-1); }

      .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
      @media (max-width: 768px) { .section-grid { grid-template-columns: 1fr; } }

      .section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }

      /* Leave approval cards */
      .leave-card { margin-bottom: 10px; background: var(--bg-card); border: 1px solid var(--border); }
      .leave-top { margin-bottom: 12px; }
      .employee-name { font-size: 14px; font-weight: 700; color: var(--text-1); }
      .leave-details { color: var(--text-3); font-size: 13px; margin: 4px 0 0; }
      .reason { color: var(--text-3); font-size: 12px; font-style: italic; margin: 4px 0 0; }
      .actions { display: flex; gap: 8px; padding-top: 12px; border-top: 1px solid var(--border); }

      /* Empty card */
      .empty-card { background: var(--bg-card); border: 1px solid var(--border); }
      .empty-card mat-card-content { display: flex; flex-direction: column; align-items: center; padding: 28px !important; color: var(--text-3); }
      .empty-icon { font-size: 32px; width: 32px; height: 32px; display: block; margin-bottom: 8px; }
      .success-icon { color: var(--success); }

      /* Team list */
      .team-card { overflow: hidden; }
      .team-member { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--border); }
      .team-member.last { border-bottom: none; }
      .member-avatar {
        width: 36px; height: 36px; border-radius: 50%;
        background: linear-gradient(135deg, var(--primary), var(--accent));
        color: #fff; display: flex; align-items: center; justify-content: center;
        font-size: 13px; font-weight: 700; flex-shrink: 0;
      }
      .member-info { flex: 1; }
      .member-info strong { display: block; font-size: 14px; color: var(--text-1); }
      .member-id { font-size: 11px; color: var(--text-3); font-family: monospace; }
      .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); flex-shrink: 0; }
      .status-dot.active { background: var(--success); box-shadow: 0 0 5px var(--success); }
      .empty-team { color: var(--text-3); text-align: center; padding: 20px; font-size: 14px; }

      /* Holidays */
      .holidays-card { margin-bottom: 28px; overflow: hidden; }
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
    </style>
  `
})
export class ManagerDashboardComponent implements OnInit {
  private leaveService = inject(LeaveService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private empMgmtService = inject(EmployeeManagementService);

  currentUser = this.authService.getCurrentUser();
  pendingApplications: LeaveApplication[] = [];
  teamApplications: LeaveApplication[] = [];
  teamMembers: User[] = [];
  upcomingHolidays: any[] = [];
  allUsers: User[] = [];
  processingId: number | null = null;

  ngOnInit(): void {
    this.leaveService.getPendingApprovals().subscribe({ next: r => this.pendingApplications = r.data || [], error: () => {} });
    this.leaveService.getTeamApplications().subscribe({ next: r => this.teamApplications = r.data || [], error: () => {} });
    this.empMgmtService.getUpcomingHolidays().subscribe({ next: r => this.upcomingHolidays = (r.data || []).slice(0, 5), error: () => {} });
    this.userService.getDirectory().subscribe({
      next: r => {
        this.allUsers = r.data || [];
        const currentId = this.currentUser?.userId;
        this.teamMembers = this.allUsers.filter((u: any) => u.managerId === currentId);
      },
      error: () => {}
    });
  }

  getEmployeeName(userId: number): string {
    const u = this.allUsers.find(x => x.id === userId);
    return u ? `${u.firstName} ${u.lastName}` : `Employee #${userId}`;
  }

  getInitials(user: User): string {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  }

  approveLeave(id: number): void {
    this.processingId = id;
    this.leaveService.approveLeave(id).subscribe({
      next: () => {
        this.pendingApplications = this.pendingApplications.filter(a => a.id !== id);
        this.processingId = null;
      },
      error: () => { this.processingId = null; }
    });
  }

  rejectLeave(id: number): void {
    this.processingId = id;
    this.leaveService.rejectLeave(id).subscribe({
      next: () => {
        this.pendingApplications = this.pendingApplications.filter(a => a.id !== id);
        this.processingId = null;
      },
      error: () => { this.processingId = null; }
    });
  }
}
