import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveService } from '../../../core/services/leave.service';
import { LeaveApplication } from '../../../core/models/leave.model';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <h1>My Leave Applications</h1>
      <button mat-raised-button color="primary" routerLink="/leave/apply">
        <mat-icon>add</mat-icon> Apply Leave
      </button>
    </div>

    <mat-card class="list-container" *ngIf="applications.length > 0">
      <mat-card-content style="padding: 0;">
        <div *ngFor="let app of applications; let last = last" class="leave-row" [class.last]="last">
          <div class="row-left">
            <div class="leave-icon-wrap">
              <mat-icon>event_note</mat-icon>
            </div>
            <div class="row-body">
              <strong>{{ app.leaveTypeName }}</strong>
              <p class="date-line">
                {{ app.startDate | date:'mediumDate' }} – {{ app.endDate | date:'mediumDate' }}
                &bull; {{ app.numberOfDays }} day{{ app.numberOfDays !== 1 ? 's' : '' }}
              </p>
              <p *ngIf="app.reason" class="reason">{{ app.reason }}</p>
              <p *ngIf="app.managerComment" class="manager-comment">
                <mat-icon class="inline-icon">comment</mat-icon> {{ app.managerComment }}
              </p>
            </div>
          </div>
          <div class="row-right">
            <span class="status-badge" [class]="app.status.toLowerCase()">{{ app.status }}</span>
            <button mat-icon-button color="warn" *ngIf="app.status === 'PENDING'" (click)="cancelLeave(app.id)" title="Cancel leave">
              <mat-icon>cancel</mat-icon>
            </button>
          </div>
        </div>
      </mat-card-content>
    </mat-card>

    <div *ngIf="applications.length === 0" class="empty-state">
      <mat-icon>inbox</mat-icon>
      <p>No leave applications found</p>
      <button mat-stroked-button routerLink="/leave/apply" style="margin-top: 12px;">
        <mat-icon>add</mat-icon> Apply for Leave
      </button>
    </div>
  `,
  styles: [`
    .list-container { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
    .list-container mat-card-content { padding: 0 !important; }

    .leave-row {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 16px; border-bottom: 1px solid var(--border);
      transition: background 0.15s;
    }
    .leave-row:last-child, .leave-row.last { border-bottom: none; }
    .leave-row:hover { background: var(--bg-elevated); }

    .row-left { display: flex; align-items: flex-start; gap: 14px; flex: 1; }
    .leave-icon-wrap {
      width: 38px; height: 38px; border-radius: var(--radius-sm);
      background: var(--bg-elevated); border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .leave-icon-wrap mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--primary); }

    .row-body strong { font-size: 14px; font-weight: 600; color: var(--text-1); display: block; }
    .date-line { font-size: 13px; color: var(--text-3); margin: 4px 0 0; }
    .reason { font-size: 12px; color: var(--text-3); font-style: italic; margin: 4px 0 0; }
    .manager-comment {
      font-size: 12px; color: var(--primary); margin: 5px 0 0;
      display: flex; align-items: center; gap: 4px;
    }
    .inline-icon { font-size: 14px; width: 14px; height: 14px; }

    .row-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; padding-left: 12px; }

    .empty-state {
      text-align: center; color: var(--text-3); padding: 56px 24px;
      background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    }
    .empty-state mat-icon { font-size: 40px; width: 40px; height: 40px; display: block; margin: 0 auto 10px; opacity: 0.35; }
    .empty-state p { margin: 0; font-size: 15px; }
  `]
})
export class LeaveListComponent implements OnInit {
  private leaveService = inject(LeaveService);
  private snackBar = inject(MatSnackBar);
  applications: LeaveApplication[] = [];

  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.leaveService.getMyApplications().subscribe({ next: r => this.applications = r.data || [], error: () => {} });
  }
  cancelLeave(id: number): void {
    this.leaveService.cancelLeave(id).subscribe({
      next: () => { this.snackBar.open('Leave cancelled', 'Close', { duration: 2000 }); this.load(); },
      error: err => this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 3000 })
    });
  }
}
