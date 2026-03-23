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
      <button mat-raised-button color="primary" routerLink="/leave/apply">+ Apply Leave</button>
    </div>

    <mat-card *ngFor="let app of applications" class="leave-card">
      <mat-card-content>
        <div class="leave-row">
          <div>
            <strong>{{ app.leaveTypeName }}</strong>
            <p>{{ app.startDate | date:'mediumDate' }} – {{ app.endDate | date:'mediumDate' }} ({{ app.numberOfDays }} days)</p>
            <p *ngIf="app.reason" class="reason">{{ app.reason }}</p>
            <p *ngIf="app.managerComment" class="comment">Manager: {{ app.managerComment }}</p>
          </div>
          <div class="right">
            <span class="status-badge" [class]="app.status.toLowerCase()">{{ app.status }}</span>
            <button mat-icon-button color="warn" *ngIf="app.status === 'PENDING'" (click)="cancelLeave(app.id)" title="Cancel">
              <mat-icon>cancel</mat-icon>
            </button>
          </div>
        </div>
      </mat-card-content>
    </mat-card>

    <p *ngIf="applications.length === 0" class="empty-state">No leave applications found</p>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .leave-card { margin-bottom: 12px; }
    .leave-row { display: flex; justify-content: space-between; align-items: flex-start; }
    .right { display: flex; align-items: center; gap: 8px; }
    p { color: #666; font-size: 13px; margin-top: 4px; }
    .reason { font-style: italic; }
    .comment { color: #3f51b5; }
    .empty-state { text-align: center; color: #999; padding: 48px; }
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
