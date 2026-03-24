import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { EmployeeManagementService, Holiday } from '../../../core/services/employee-management.service';

@Component({
  selector: 'app-holiday-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatCheckboxModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data?.id ? 'Edit' : 'Add' }} Holiday</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Holiday Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Diwali">
          <mat-error *ngIf="form.get('name')?.hasError('required')">Required</mat-error>
        </mat-form-field>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input matInput formControlName="date" type="date">
            <mat-error *ngIf="form.get('date')?.hasError('required')">Required</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select formControlName="holidayType">
              <mat-option value="NATIONAL">National</mat-option>
              <mat-option value="REGIONAL">Regional</mat-option>
              <mat-option value="OPTIONAL">Optional</mat-option>
              <mat-option value="COMPANY">Company</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>
        <mat-checkbox formControlName="isRecurring" class="recurring-check">
          Recurring (repeats every year)
        </mat-checkbox>
        <div *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid || loading">
        {{ loading ? 'Saving...' : (data?.id ? 'Update' : 'Add Holiday') }}
      </button>
    </mat-dialog-actions>
    <style>
      .dialog-form { display: flex; flex-direction: column; gap: 8px; min-width: 460px; padding-top: 8px; }
      .form-row { display: flex; gap: 12px; }
      .form-row mat-form-field { flex: 1; }
      .full-width { width: 100%; }
      .recurring-check { color: var(--text-2); }
      .error-msg { color: var(--danger); font-size: 13px; background: var(--danger-bg); border-radius: var(--radius-sm); padding: 8px 12px; }
    </style>
  `
})
export class HolidayDialogComponent {
  private fb = inject(FormBuilder);
  private service = inject(EmployeeManagementService);
  private dialogRef = inject(MatDialogRef<HolidayDialogComponent>);
  data: Holiday = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    name: [this.data?.name || '', Validators.required],
    date: [this.data?.date || '', Validators.required],
    holidayType: [this.data?.holidayType || 'NATIONAL'],
    description: [this.data?.description || ''],
    isRecurring: [this.data?.isRecurring || false]
  });

  loading = false;
  errorMsg = '';

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const payload: Holiday = {
      name: this.form.value.name!,
      date: this.form.value.date!,
      holidayType: this.form.value.holidayType!,
      description: this.form.value.description || '',
      isRecurring: this.form.value.isRecurring || false
    };
    const call = this.data?.id
      ? this.service.updateHoliday(this.data.id, payload)
      : this.service.createHoliday(payload);
    call.subscribe({
      next: () => this.dialogRef.close(true),
      error: err => { this.loading = false; this.errorMsg = err.error?.message || 'Failed to save.'; }
    });
  }
}

@Component({
  selector: 'app-holiday-management',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatChipsModule],
  template: `
    <div class="page-wrap">
      <div class="page-header">
        <div>
          <h1>Holiday Management</h1>
          <p class="sub">{{ holidays.length }} holiday{{ holidays.length !== 1 ? 's' : '' }} configured</p>
        </div>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Add Holiday
        </button>
      </div>

      <div class="table-card">
        <div *ngIf="loading" class="loading-msg">
          <mat-icon>hourglass_empty</mat-icon>
          <span>Loading holidays...</span>
        </div>

        <div class="table-wrap" *ngIf="!loading && holidays.length > 0">
          <table mat-table [dataSource]="holidays" class="dark-table">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let h" [class.past-cell]="isPast(h.date)">
                <strong class="date-main">{{ h.date | date:'dd MMM yyyy' }}</strong>
                <span class="day-label">{{ h.date | date:'EEEE' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Holiday</th>
              <td mat-cell *matCellDef="let h" [class.past-cell]="isPast(h.date)">
                <span class="holiday-name">{{ h.name }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let h">
                <span class="type-badge type-{{ h.holidayType?.toLowerCase() }}">
                  {{ h.holidayType || 'COMPANY' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let h">
                <span class="desc-text">{{ h.description || '—' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="recurring">
              <th mat-header-cell *matHeaderCellDef>Recurring</th>
              <td mat-cell *matCellDef="let h">
                <span class="recurring-chip" [class.is-recurring]="h.isRecurring">
                  <mat-icon>{{ h.isRecurring ? 'autorenew' : 'remove' }}</mat-icon>
                  {{ h.isRecurring ? 'Yes' : 'No' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let h">
                <button mat-icon-button color="primary" (click)="openDialog(h)" title="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteHoliday(h)" title="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;" [class.past-row]="isPast(row.date)"></tr>
          </table>
        </div>

        <div *ngIf="!loading && holidays.length === 0" class="empty-msg">
          <mat-icon>event_busy</mat-icon>
          <p>No holidays configured. Click "Add Holiday" to add one.</p>
        </div>
      </div>
    </div>

    <style>
      :host { display: block; padding: 24px; background: var(--bg-base); min-height: 100%; }

      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
      .page-header h1 { margin: 0; color: var(--text-1); font-size: 22px; font-weight: 700; }
      .sub { color: var(--text-3); font-size: 13px; margin: 4px 0 0; }

      .table-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        overflow: hidden;
        box-shadow: var(--shadow);
      }

      .loading-msg {
        display: flex; align-items: center; justify-content: center;
        gap: 10px; padding: 40px; color: var(--text-3);
      }

      .table-wrap { overflow-x: auto; }

      .dark-table { width: 100%; background: transparent; }
      .dark-table ::ng-deep .mat-mdc-header-row {
        background: var(--bg-surface);
        border-bottom: 1px solid var(--border);
      }
      .dark-table ::ng-deep .mat-mdc-header-cell {
        color: var(--text-3); font-size: 11px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.6px; border-bottom: none;
      }
      .dark-table ::ng-deep .mat-mdc-row {
        background: transparent; border-bottom: 1px solid var(--border); transition: background 0.15s;
      }
      .dark-table ::ng-deep .mat-mdc-row:hover { background: var(--bg-surface); }
      .dark-table ::ng-deep .mat-mdc-row:last-child { border-bottom: none; }
      .dark-table ::ng-deep .mat-mdc-cell { color: var(--text-2); border-bottom: none; font-size: 13px; }
      .dark-table ::ng-deep .past-row { opacity: 0.45; }

      .date-main { display: block; color: var(--text-1); font-size: 13px; font-weight: 600; }
      .day-label { display: block; font-size: 11px; color: var(--text-3); }
      .holiday-name { color: var(--text-1); font-size: 14px; }
      .desc-text { color: var(--text-3); font-size: 13px; }

      .type-badge { padding: 3px 9px; border-radius: 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
      .type-national { background: var(--blue-bg); color: var(--blue); }
      .type-regional { background: var(--success-bg); color: var(--success); }
      .type-optional { background: var(--warning-bg); color: var(--warning); }
      .type-company { background: var(--purple-bg); color: var(--purple); }

      .recurring-chip {
        display: inline-flex; align-items: center; gap: 4px;
        font-size: 12px; color: var(--text-3);
      }
      .recurring-chip mat-icon { font-size: 15px; width: 15px; height: 15px; }
      .recurring-chip.is-recurring { color: var(--success); }

      .empty-msg { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: var(--text-3); }
      .empty-msg mat-icon { font-size: 40px; width: 40px; height: 40px; }
      .empty-msg p { margin: 0; font-size: 14px; }
    </style>
  `
})
export class HolidayManagementComponent implements OnInit {
  private service = inject(EmployeeManagementService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  holidays: Holiday[] = [];
  columns = ['date', 'name', 'type', 'description', 'recurring', 'actions'];
  loading = true;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.service.getHolidays().subscribe({
      next: r => { this.holidays = r.data || []; this.loading = false; },
      error: () => this.loading = false
    });
  }

  isPast(date: string): boolean {
    return new Date(date) < new Date();
  }

  openDialog(holiday?: Holiday) {
    const ref = this.dialog.open(HolidayDialogComponent, { width: '500px', data: holiday || null });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open(holiday ? 'Holiday updated!' : 'Holiday added!', 'Close', { duration: 3000 });
        this.load();
      }
    });
  }

  deleteHoliday(h: Holiday) {
    if (!confirm(`Delete holiday "${h.name}"?`)) return;
    this.service.deleteHoliday(h.id!).subscribe({
      next: () => { this.snackBar.open('Holiday deleted.', 'Close', { duration: 3000 }); this.load(); },
      error: () => this.snackBar.open('Failed to delete.', 'Close', { duration: 3000 })
    });
  }
}
