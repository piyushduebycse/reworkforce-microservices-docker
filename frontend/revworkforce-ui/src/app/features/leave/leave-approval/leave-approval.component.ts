import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveService } from '../../../core/services/leave.service';
import { LeaveApplication } from '../../../core/models/leave.model';

@Component({
  selector: 'app-leave-approval',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="page-header"><h1>Leave Approvals</h1><p>Pending requests from your team</p></div>
    <mat-card *ngFor="let app of applications" class="app-card">
      <mat-card-content>
        <div class="app-row">
          <div>
            <strong>Employee #{{ app.userId }}</strong>
            <p>{{ app.leaveTypeName }} | {{ app.startDate | date:'mediumDate' }} – {{ app.endDate | date:'mediumDate' }} ({{ app.numberOfDays }} days)</p>
            <p *ngIf="app.reason" class="reason">{{ app.reason }}</p>
            <small>Applied: {{ app.appliedAt | date:'medium' }}</small>
          </div>
          <div class="actions">
            <button mat-raised-button color="primary" (click)="approve(app.id)">Approve</button>
            <button mat-raised-button color="warn" (click)="reject(app.id)">Reject</button>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
    <p *ngIf="applications.length === 0" class="empty-state">No pending leave requests</p>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .app-card { margin-bottom: 12px; }
    .app-row { display: flex; justify-content: space-between; align-items: center; }
    .actions { display: flex; gap: 8px; }
    p { color: #666; font-size: 13px; margin-top: 4px; }
    small { color: #999; font-size: 12px; }
    .reason { font-style: italic; }
    .empty-state { text-align: center; color: #999; padding: 48px; }
  `]
})
export class LeaveApprovalComponent implements OnInit {
  private leaveService = inject(LeaveService);
  private snackBar = inject(MatSnackBar);
  applications: LeaveApplication[] = [];

  ngOnInit(): void { this.load(); }
  load(): void { this.leaveService.getPendingApprovals().subscribe({ next: r => this.applications = r.data || [], error: () => {} }); }

  approve(id: number): void {
    this.leaveService.approveLeave(id).subscribe({
      next: () => { this.snackBar.open('Leave approved!', 'Close', { duration: 2000 }); this.load(); },
      error: err => this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 3000 })
    });
  }

  reject(id: number): void {
    this.leaveService.rejectLeave(id).subscribe({
      next: () => { this.snackBar.open('Leave rejected', 'Close', { duration: 2000 }); this.load(); },
      error: err => this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 3000 })
    });
  }
}
