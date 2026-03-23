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
          <mat-icon class="stat-icon blue">people</mat-icon>
          <div class="stat-body">
            <div class="stat-value">{{ teamMembers.length }}</div>
            <div class="stat-label">Team Members</div>
          </div>
        </mat-card-content>
      </mat-card>
      <mat-card class="stat-card clickable" routerLink="/leave/approvals">
        <mat-card-content>
          <mat-icon class="stat-icon orange">pending_actions</mat-icon>
          <div class="stat-body">
            <div class="stat-value">{{ pendingApplications.length }}</div>
            <div class="stat-label">Pending Approvals</div>
            <div class="stat-sub" *ngIf="pendingApplications.length > 0" style="color:#e65100">Needs review</div>
            <div class="stat-sub" *ngIf="pendingApplications.length === 0" style="color:#2e7d32">All clear</div>
          </div>
        </mat-card-content>
      </mat-card>
      <mat-card class="stat-card">
        <mat-card-content>
          <mat-icon class="stat-icon green">event_available</mat-icon>
          <div class="stat-body">
            <div class="stat-value">{{ upcomingHolidays.length }}</div>
            <div class="stat-label">Upcoming Holidays</div>
            <div class="stat-sub" *ngIf="upcomingHolidays[0]">Next: {{ upcomingHolidays[0].name }}</div>
          </div>
        </mat-card-content>
      </mat-card>
      <mat-card class="stat-card">
        <mat-card-content>
          <mat-icon class="stat-icon purple">assignment</mat-icon>
          <div class="stat-body">
            <div class="stat-value">{{ teamApplications.length }}</div>
            <div class="stat-label">All Leave Requests</div>
            <div class="stat-sub">this team</div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="section-grid">
      <!-- Pending Approvals -->
      <div>
        <div class="section-header">
          <h2>Pending Approvals</h2>
          <button mat-button color="primary" routerLink="/leave/approvals">View All</button>
        </div>
        <mat-card *ngFor="let app of pendingApplications.slice(0, 4)" class="leave-card">
          <mat-card-content>
            <div class="leave-info">
              <div class="leave-left">
                <div class="employee-name">{{ getEmployeeName(app.userId) }}</div>
                <p class="leave-details">
                  {{ app.leaveTypeName }} &bull;
                  {{ app.startDate | date:'dd MMM' }} - {{ app.endDate | date:'dd MMM' }}
                  ({{ app.numberOfDays }} day{{ app.numberOfDays !== 1 ? 's' : '' }})
                </p>
                <p class="reason" *ngIf="app.reason">{{ app.reason }}</p>
              </div>
              <div class="actions">
                <button mat-stroked-button color="primary" (click)="approveLeave(app.id)" [disabled]="processingId === app.id">
                  <mat-icon>check</mat-icon> Approve
                </button>
                <button mat-stroked-button color="warn" (click)="rejectLeave(app.id)" [disabled]="processingId === app.id">
                  <mat-icon>close</mat-icon> Reject
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card *ngIf="pendingApplications.length === 0" class="empty-card">
          <mat-card-content>
            <mat-icon>check_circle_outline</mat-icon>
            <p>No pending approvals</p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Team Members -->
      <div>
        <h2>My Team</h2>
        <mat-card>
          <mat-card-content class="team-list">
            <div *ngFor="let member of teamMembers" class="team-member">
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

    <style>
      .page-header { margin-bottom: 24px; }
      .page-header h1 { margin: 0; }
      .page-header p { color: #666; margin: 4px 0 0; }
      .stat-card mat-card-content { display: flex; align-items: center; gap: 16px; padding: 20px; }
      .stat-icon { font-size: 40px; width: 40px; height: 40px; }
      .stat-icon.blue { color: #3f51b5; }
      .stat-icon.orange { color: #e65100; }
      .stat-icon.green { color: #2e7d32; }
      .stat-icon.purple { color: #6a1b9a; }
      .stat-body { flex: 1; }
      .stat-value { font-size: 32px; font-weight: 700; color: #222; line-height: 1; }
      .stat-label { font-size: 14px; color: #666; margin: 4px 0 2px; }
      .stat-sub { font-size: 12px; color: #999; }
      .clickable { cursor: pointer; transition: box-shadow 0.2s; }
      .clickable:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
      h2 { margin: 24px 0 16px; font-size: 18px; }
      .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
      .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
      @media (max-width: 768px) { .section-grid { grid-template-columns: 1fr; } }
      .leave-card { margin-bottom: 8px; }
      .leave-info { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
      .leave-left { flex: 1; }
      .employee-name { font-weight: 600; font-size: 14px; }
      .leave-details { color: #666; font-size: 13px; margin: 3px 0; }
      .reason { color: #888; font-size: 12px; font-style: italic; margin: 0; }
      .actions { display: flex; gap: 8px; }
      .empty-card mat-card-content { display: flex; flex-direction: column; align-items: center; color: #999; padding: 24px; }
      .empty-card mat-icon { font-size: 32px; width: 32px; height: 32px; color: #4caf50; }
      .team-list { display: flex; flex-direction: column; gap: 0; }
      .team-member { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
      .team-member:last-child { border-bottom: none; }
      .member-avatar { width: 36px; height: 36px; border-radius: 50%; background: #3f51b5; color: white;
        display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
      .member-info { flex: 1; }
      .member-info strong { display: block; font-size: 14px; }
      .member-id { font-size: 11px; color: #888; font-family: monospace; }
      .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #ccc; }
      .status-dot.active { background: #4caf50; }
      .empty-team { color: #999; text-align: center; padding: 16px; }
      .holiday-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
      .holiday-item:last-child { border-bottom: none; }
      .holiday-date { color: #666; font-size: 12px; margin: 2px 0 0; }
      .type-badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
      .type-national { background: #e3f2fd; color: #1565c0; }
      .type-regional { background: #e8f5e9; color: #2e7d32; }
      .type-optional { background: #fff9c4; color: #f57f17; }
      .type-company { background: #f3e5f5; color: #6a1b9a; }
      .empty-msg { color: #999; text-align: center; padding: 16px; }
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
