import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LeaveService } from '../../../core/services/leave.service';
import { LeaveType, LeaveBalance } from '../../../core/models/leave.model';

@Component({
  selector: 'app-leave-apply',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <h1>Apply for Leave</h1>
      <p>Submit a new leave request</p>
    </div>

    <div class="apply-layout">
      <!-- Balance Summary Cards -->
      <div class="balance-section">
        <h3>Your Leave Balances</h3>
        <div *ngFor="let b of balances"
             class="balance-card"
             [class.selected]="selectedBalance?.leaveTypeId === b.leaveTypeId"
             (click)="selectBalance(b)">
          <div class="balance-header">
            <span class="balance-name">{{ b.leaveTypeName }}</span>
            <span class="balance-days" [class.low]="b.remainingDays <= 2">
              {{ b.remainingDays }}<small>/{{ b.totalDays }}</small>
            </span>
          </div>
          <mat-progress-bar mode="determinate" [value]="getUsedPercent(b)"
            [color]="b.remainingDays <= 2 ? 'warn' : 'primary'"></mat-progress-bar>
          <span class="balance-used">{{ b.usedDays }} used &bull; {{ b.remainingDays }} remaining</span>
        </div>
        <div *ngIf="balances.length === 0 && !loadingBalances" class="no-balance">
          <mat-icon>info</mat-icon>
          <p>No leave balances found. Contact HR.</p>
        </div>
      </div>

      <!-- Form -->
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="leaveForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Leave Type</mat-label>
              <mat-select formControlName="leaveTypeId" (selectionChange)="onLeaveTypeChange($event.value)">
                <mat-option *ngFor="let type of leaveTypes" [value]="type.id">{{ type.name }}</mat-option>
              </mat-select>
              <mat-error>Required</mat-error>
            </mat-form-field>

            <!-- Selected balance info -->
            <div *ngIf="selectedBalance" class="balance-info-inline">
              <mat-icon [style.color]="selectedBalance.remainingDays > 0 ? 'var(--success)' : 'var(--danger)'">
                {{ selectedBalance.remainingDays > 0 ? 'check_circle' : 'warning' }}
              </mat-icon>
              <span>
                <strong>{{ selectedBalance.remainingDays }} days</strong> available
                ({{ selectedBalance.usedDays }} of {{ selectedBalance.totalDays }} used)
              </span>
            </div>

            <div class="date-row">
              <mat-form-field appearance="outline">
                <mat-label>Start Date</mat-label>
                <input matInput [matDatepicker]="startPicker" formControlName="startDate"
                  [min]="minDate" (dateChange)="calculateDays()">
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
                <mat-error>Required</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>End Date</mat-label>
                <input matInput [matDatepicker]="endPicker" formControlName="endDate"
                  [min]="leaveForm.get('startDate')?.value || minDate" (dateChange)="calculateDays()">
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
                <mat-error>Required</mat-error>
              </mat-form-field>
            </div>

            <!-- Working days summary -->
            <div *ngIf="workingDays > 0" class="days-summary" [class.over-limit]="isOverBalance">
              <mat-icon>{{ isOverBalance ? 'warning' : 'event_note' }}</mat-icon>
              <span>
                <strong>{{ workingDays }} working day{{ workingDays !== 1 ? 's' : '' }}</strong>
                (weekends excluded)
                <span *ngIf="isOverBalance" class="over-warning"> — exceeds your balance!</span>
              </span>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Reason (Optional)</mat-label>
              <textarea matInput formControlName="reason" rows="3" placeholder="Brief description of your leave"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" class="cancel-btn" (click)="router.navigate(['/leave/list'])">Cancel</button>
              <button mat-raised-button class="submit-btn" type="submit"
                [disabled]="leaveForm.invalid || loading || isOverBalance">
                {{ loading ? 'Submitting…' : 'Submit Application' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>

    <style>
      .apply-layout {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 24px;
        align-items: start;
      }
      @media (max-width: 768px) {
        .apply-layout { grid-template-columns: 1fr; }
      }
      h3 {
        margin: 0 0 12px;
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-3);
      }
      .balance-card {
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 14px;
        cursor: pointer;
        transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        background: var(--bg-card);
        margin-bottom: 8px;
      }
      .balance-card:hover {
        border-color: var(--primary);
        background: var(--bg-elevated);
      }
      .balance-card.selected {
        border-color: var(--primary);
        box-shadow: 0 0 0 2px var(--primary-glow);
        background: var(--bg-elevated);
      }
      .balance-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .balance-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-1);
      }
      .balance-days {
        font-size: 18px;
        font-weight: 700;
        color: var(--primary);
      }
      .balance-days.low { color: var(--danger); }
      .balance-days small {
        font-size: 12px;
        color: var(--text-3);
        font-weight: 400;
      }
      .balance-used {
        font-size: 11px;
        color: var(--text-3);
        display: block;
        margin-top: 6px;
      }
      .no-balance {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: var(--text-3);
        padding: 16px;
        text-align: center;
      }
      .no-balance mat-icon {
        color: var(--text-3);
        margin-bottom: 8px;
      }
      .form-card {
        background: var(--bg-card) !important;
        border: 1px solid var(--border) !important;
        border-radius: var(--radius) !important;
        box-shadow: var(--shadow) !important;
      }
      .full-width { width: 100%; }
      .date-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .balance-info-inline {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        margin-bottom: 12px;
        font-size: 13px;
        color: var(--text-2);
      }
      .balance-info-inline mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }
      .days-summary {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: var(--success-bg);
        border: 1px solid var(--success);
        border-radius: var(--radius-sm);
        margin-bottom: 12px;
        font-size: 13px;
        color: var(--text-2);
      }
      .days-summary mat-icon { color: var(--success); }
      .days-summary.over-limit {
        background: var(--warning-bg);
        border-color: var(--warning);
      }
      .days-summary.over-limit mat-icon { color: var(--warning); }
      .over-warning {
        color: var(--warning);
        font-weight: 600;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 8px;
      }
      .cancel-btn {
        color: var(--text-2) !important;
      }
      .submit-btn {
        background: var(--primary) !important;
        color: #fff !important;
      }
    </style>
  `
})
export class LeaveApplyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private leaveService = inject(LeaveService);
  private snackBar = inject(MatSnackBar);
  router = inject(Router);

  leaveTypes: LeaveType[] = [];
  balances: LeaveBalance[] = [];
  selectedBalance: LeaveBalance | null = null;
  loading = false;
  loadingBalances = true;
  workingDays = 0;
  minDate = new Date();

  leaveForm: FormGroup;

  constructor() {
    this.leaveForm = this.fb.group({
      leaveTypeId: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      reason: ['']
    });
  }

  ngOnInit(): void {
    this.leaveService.getLeaveTypes().subscribe({ next: r => this.leaveTypes = r.data || [], error: () => {} });
    this.leaveService.getMyBalances().subscribe({
      next: r => { this.balances = r.data || []; this.loadingBalances = false; },
      error: () => { this.loadingBalances = false; }
    });
  }

  get isOverBalance(): boolean {
    if (!this.selectedBalance || this.workingDays === 0) return false;
    return this.workingDays > this.selectedBalance.remainingDays;
  }

  selectBalance(b: LeaveBalance): void {
    this.selectedBalance = b;
    const type = this.leaveTypes.find(t => t.id === b.leaveTypeId);
    if (type) this.leaveForm.patchValue({ leaveTypeId: type.id });
  }

  onLeaveTypeChange(typeId: number): void {
    this.selectedBalance = this.balances.find(b => b.leaveTypeId === typeId) || null;
  }

  calculateDays(): void {
    const start: Date = this.leaveForm.get('startDate')?.value;
    const end: Date = this.leaveForm.get('endDate')?.value;
    if (!start || !end) { this.workingDays = 0; return; }
    this.workingDays = this.countWorkingDays(start, end);
  }

  countWorkingDays(start: Date, end: Date): number {
    if (end < start) return 0;
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }

  getUsedPercent(b: LeaveBalance): number {
    return b.totalDays > 0 ? (b.usedDays / b.totalDays) * 100 : 0;
  }

  onSubmit(): void {
    if (this.leaveForm.invalid) return;
    this.loading = true;
    const v = this.leaveForm.value;
    const request = {
      leaveTypeId: v.leaveTypeId,
      startDate: this.formatDate(v.startDate),
      endDate: this.formatDate(v.endDate),
      reason: v.reason
    };
    this.leaveService.applyLeave(request).subscribe({
      next: () => {
        this.snackBar.open('Leave application submitted!', 'Close', { duration: 3000 });
        this.router.navigate(['/leave/list']);
      },
      error: err => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Failed to apply leave', 'Close', { duration: 4000 });
      }
    });
  }

  formatDate(date: Date): string {
    return date ? date.toISOString().split('T')[0] : '';
  }
}
