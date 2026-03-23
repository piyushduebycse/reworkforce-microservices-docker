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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LeaveService } from '../../../core/services/leave.service';
import { LeaveType } from '../../../core/models/leave.model';

@Component({
  selector: 'app-leave-apply',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <h1>Apply for Leave</h1>
      <p>Submit a new leave request</p>
    </div>

    <mat-card style="max-width: 600px;">
      <mat-card-content>
        <form [formGroup]="leaveForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Leave Type</mat-label>
            <mat-select formControlName="leaveTypeId">
              <mat-option *ngFor="let type of leaveTypes" [value]="type.id">{{ type.name }}</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="date-row">
            <mat-form-field appearance="outline">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" formControlName="endDate">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Reason (Optional)</mat-label>
            <textarea matInput formControlName="reason" rows="3"></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-button type="button" (click)="router.navigate(['/leave/list'])">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="leaveForm.invalid || loading">
              {{ loading ? 'Submitting...' : 'Submit Application' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .date-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  `]
})
export class LeaveApplyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private leaveService = inject(LeaveService);
  private snackBar = inject(MatSnackBar);
  router = inject(Router);

  leaveTypes: LeaveType[] = [];
  loading = false;
  leaveForm: FormGroup;
  minDate = new Date();

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
        this.snackBar.open(err.error?.message || 'Failed to apply leave', 'Close', { duration: 3000 });
      }
    });
  }

  formatDate(date: Date): string {
    return date ? date.toISOString().split('T')[0] : '';
  }
}
