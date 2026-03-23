import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { LeaveService } from '../../core/services/leave.service';
import { PerformanceService } from '../../core/services/performance.service';
import { AuthService } from '../../core/services/auth.service';
import { LeaveApplication } from '../../core/models/leave.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div class="page-header">
      <h1>Manager Dashboard</h1>
      <p>Manage your team's leaves and performance</p>
    </div>

    <div class="card-grid">
      <mat-card class="stat-card">
        <mat-card-content>
          <mat-icon class="icon">pending_actions</mat-icon>
          <div><div class="value">{{ pendingApplications.length }}</div><div class="label">Pending Approvals</div></div>
        </mat-card-content>
      </mat-card>
      <mat-card class="stat-card">
        <mat-card-content>
          <mat-icon class="icon">people</mat-icon>
          <div><div class="value">{{ teamApplications.length }}</div><div class="label">Team Leave Requests</div></div>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="section">
      <div class="section-header">
        <h2>Pending Leave Approvals</h2>
        <button mat-button color="primary" routerLink="/leave/approvals">View All</button>
      </div>
      <mat-card *ngFor="let app of pendingApplications.slice(0, 5)" class="leave-card">
        <mat-card-content>
          <div class="leave-info">
            <div>
              <strong>Employee #{{ app.userId }}</strong>
              <p class="leave-details">{{ app.leaveTypeName }} | {{ app.startDate | date:'mediumDate' }} - {{ app.endDate | date:'mediumDate' }} ({{ app.numberOfDays }} days)</p>
              <p class="reason" *ngIf="app.reason">Reason: {{ app.reason }}</p>
            </div>
            <div class="actions">
              <button mat-raised-button color="primary" (click)="approveLeave(app.id)">Approve</button>
              <button mat-raised-button color="warn" (click)="rejectLeave(app.id)">Reject</button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
      <p *ngIf="pendingApplications.length === 0" class="empty-state">No pending approvals</p>
    </div>
  `,
  styles: [`
    h2 { margin: 24px 0 16px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .leave-card { margin-bottom: 8px; }
    .leave-info { display: flex; justify-content: space-between; align-items: center; }
    .leave-details { color: #666; font-size: 13px; margin-top: 4px; }
    .reason { color: #888; font-size: 12px; font-style: italic; }
    .actions { display: flex; gap: 8px; }
    .empty-state { color: #999; text-align: center; padding: 24px; }
  `]
})
export class ManagerDashboardComponent implements OnInit {
  private leaveService = inject(LeaveService);
  private authService = inject(AuthService);

  pendingApplications: LeaveApplication[] = [];
  teamApplications: LeaveApplication[] = [];

  ngOnInit(): void {
    this.leaveService.getPendingApprovals().subscribe({ next: r => this.pendingApplications = r.data || [], error: () => {} });
    this.leaveService.getTeamApplications().subscribe({ next: r => this.teamApplications = r.data || [], error: () => {} });
  }

  approveLeave(id: number): void {
    this.leaveService.approveLeave(id).subscribe({
      next: () => this.pendingApplications = this.pendingApplications.filter(a => a.id !== id),
      error: () => {}
    });
  }

  rejectLeave(id: number): void {
    this.leaveService.rejectLeave(id).subscribe({
      next: () => this.pendingApplications = this.pendingApplications.filter(a => a.id !== id),
      error: () => {}
    });
  }
}
