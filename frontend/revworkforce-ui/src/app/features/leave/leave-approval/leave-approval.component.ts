import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveService } from '../../../core/services/leave.service';
import { UserService } from '../../../core/services/user.service';
import { LeaveApplication } from '../../../core/models/leave.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-leave-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <h1>Leave Approvals</h1>
      <p>{{ applications.length }} pending request{{ applications.length !== 1 ? 's' : '' }} from your team</p>
    </div>

    <div *ngIf="applications.length === 0" class="empty-state">
      <mat-icon>check_circle_outline</mat-icon>
      <p>No pending leave requests</p>
    </div>

    <mat-card *ngFor="let app of applications" class="app-card">
      <mat-card-content>

        <!-- Header: avatar + name + status -->
        <div class="app-header">
          <div class="emp-info">
            <div class="emp-avatar">{{ getInitials(app.userId) }}</div>
            <div class="emp-meta">
              <strong class="emp-name">{{ getEmployeeName(app.userId) }}</strong>
              <span class="emp-id">{{ getEmployeeId(app.userId) }}</span>
            </div>
          </div>
          <span class="status-badge pending">PENDING</span>
        </div>

        <!-- Leave details -->
        <div class="leave-details">
          <div class="detail-item">
            <mat-icon>event</mat-icon>
            <span>{{ app.startDate | date:'dd MMM yyyy' }} – {{ app.endDate | date:'dd MMM yyyy' }}</span>
          </div>
          <div class="detail-item">
            <mat-icon>schedule</mat-icon>
            <span><strong>{{ app.numberOfDays }} working day{{ app.numberOfDays !== 1 ? 's' : '' }}</strong> &middot; {{ app.leaveTypeName }}</span>
          </div>
          <div class="detail-item" *ngIf="app.reason">
            <mat-icon>notes</mat-icon>
            <span class="reason-text">{{ app.reason }}</span>
          </div>
          <div class="detail-item applied-at">
            <mat-icon>access_time</mat-icon>
            <span>Applied {{ app.appliedAt | date:'medium' }}</span>
          </div>
        </div>

        <!-- Comment + confirm (shown after clicking Approve/Reject) -->
        <div *ngIf="activeId === app.id" class="comment-section">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ pendingAction === 'approve' ? 'Approval' : 'Rejection' }} Comment (optional)</mat-label>
            <textarea matInput [(ngModel)]="comments[app.id]" rows="2"
              [placeholder]="pendingAction === 'approve' ? 'e.g. Approved, enjoy your leave!' : 'e.g. Please reschedule due to project deadline'">
            </textarea>
          </mat-form-field>
          <div class="confirm-actions">
            <button mat-stroked-button (click)="cancel()">Cancel</button>
            <button mat-raised-button [color]="pendingAction === 'approve' ? 'primary' : 'warn'"
              (click)="confirm(app.id)" [disabled]="processingId === app.id">
              <mat-icon>{{ pendingAction === 'approve' ? 'check' : 'close' }}</mat-icon>
              {{ processingId === app.id ? 'Processing...' : (pendingAction === 'approve' ? 'Confirm Approve' : 'Confirm Reject') }}
            </button>
          </div>
        </div>

        <!-- Primary action buttons -->
        <div *ngIf="activeId !== app.id" class="actions">
          <button mat-stroked-button color="primary" (click)="startAction(app.id, 'approve')">
            <mat-icon>check</mat-icon> Approve
          </button>
          <button mat-stroked-button color="warn" (click)="startAction(app.id, 'reject')">
            <mat-icon>close</mat-icon> Reject
          </button>
        </div>

      </mat-card-content>
    </mat-card>

    <style>
      .empty-state {
        text-align: center; padding: 64px 24px;
        color: var(--text-3); background: var(--bg-card);
        border: 1px solid var(--border); border-radius: var(--radius);
      }
      .empty-state mat-icon {
        font-size: 48px; width: 48px; height: 48px; color: var(--success);
        display: block; margin: 0 auto 12px;
      }
      .empty-state p { margin: 0; font-size: 16px; }

      .app-card {
        margin-bottom: 16px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
      }

      /* Header */
      .app-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .emp-info { display: flex; align-items: center; gap: 12px; }
      .emp-avatar {
        width: 42px; height: 42px; border-radius: 50%;
        background: linear-gradient(135deg, var(--primary), var(--accent));
        color: #fff; display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 14px; flex-shrink: 0;
      }
      .emp-meta { display: flex; flex-direction: column; gap: 2px; }
      .emp-name { font-size: 15px; font-weight: 700; color: var(--text-1); }
      .emp-id { font-size: 12px; color: var(--text-3); font-family: monospace; }
      .status-badge.pending { background: var(--warning-bg); color: var(--warning); padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }

      /* Leave details */
      .leave-details {
        display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;
        padding: 14px; background: var(--bg-elevated); border: 1px solid var(--border);
        border-radius: var(--radius-sm);
      }
      .detail-item { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--text-2); }
      .detail-item mat-icon { font-size: 17px; width: 17px; height: 17px; color: var(--text-3); margin-top: 2px; flex-shrink: 0; }
      .reason-text { font-style: italic; color: var(--text-3); }
      .applied-at { color: var(--text-3); font-size: 12px; }

      /* Comment section */
      .comment-section { padding-top: 14px; border-top: 1px solid var(--border); }
      .full-width { width: 100%; }
      .confirm-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }

      /* Primary actions */
      .actions { display: flex; gap: 8px; padding-top: 14px; border-top: 1px solid var(--border); }
    </style>
  `
})
export class LeaveApprovalComponent implements OnInit {
  private leaveService = inject(LeaveService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  applications: LeaveApplication[] = [];
  allUsers: User[] = [];
  comments: Record<number, string> = {};
  activeId: number | null = null;
  pendingAction: 'approve' | 'reject' | null = null;
  processingId: number | null = null;

  ngOnInit(): void {
    this.load();
    this.userService.getDirectory().subscribe({ next: r => this.allUsers = r.data || [], error: () => {} });
  }

  load(): void {
    this.leaveService.getPendingApprovals().subscribe({ next: r => this.applications = r.data || [], error: () => {} });
  }

  getEmployeeName(userId: number): string {
    const u = this.allUsers.find(x => x.id === userId);
    return u ? `${u.firstName} ${u.lastName}` : `Employee #${userId}`;
  }

  getEmployeeId(userId: number): string {
    return this.allUsers.find(x => x.id === userId)?.employeeId || '';
  }

  getInitials(userId: number): string {
    const u = this.allUsers.find(x => x.id === userId);
    return u ? `${u.firstName[0]}${u.lastName[0]}`.toUpperCase() : '?';
  }

  startAction(id: number, action: 'approve' | 'reject'): void {
    this.activeId = id;
    this.pendingAction = action;
    if (!this.comments[id]) this.comments[id] = '';
  }

  cancel(): void { this.activeId = null; this.pendingAction = null; }

  confirm(id: number): void {
    this.processingId = id;
    const comment = this.comments[id] || undefined;
    const call = this.pendingAction === 'approve'
      ? this.leaveService.approveLeave(id, comment)
      : this.leaveService.rejectLeave(id, comment);

    call.subscribe({
      next: () => {
        this.snackBar.open(
          this.pendingAction === 'approve' ? 'Leave approved!' : 'Leave rejected',
          'Close', { duration: 3000 }
        );
        this.processingId = null;
        this.activeId = null;
        this.pendingAction = null;
        delete this.comments[id];
        this.load();
      },
      error: err => {
        this.processingId = null;
        this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 3000 });
      }
    });
  }
}
