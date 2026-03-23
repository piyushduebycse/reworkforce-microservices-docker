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
        <mat-checkbox formControlName="isRecurring">Recurring (repeats every year)</mat-checkbox>
        <div *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid || loading">
        {{ loading ? 'Saving...' : (data?.id ? 'Update' : 'Add Holiday') }}
      </button>
    </mat-dialog-actions>
    <style>
      .dialog-form { display:flex; flex-direction:column; gap:8px; min-width:460px; padding-top:8px; }
      .form-row { display:flex; gap:12px; }
      .form-row mat-form-field { flex:1; }
      .full-width { width:100%; }
      .error-msg { color:#f44336; font-size:13px; }
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
    <div class="page-header">
      <div>
        <h1>Holiday Management</h1>
        <p class="subtitle">{{ holidays.length }} holidays configured</p>
      </div>
      <button mat-raised-button color="primary" (click)="openDialog()">
        <mat-icon>add</mat-icon> Add Holiday
      </button>
    </div>

    <mat-card>
      <mat-card-content>
        <div *ngIf="loading" class="loading-msg">Loading holidays...</div>
        <table mat-table [dataSource]="holidays" class="full-width" *ngIf="!loading">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let h">
              <strong>{{ h.date | date:'dd MMM yyyy' }}</strong>
              <span class="day-label">{{ h.date | date:'EEEE' }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Holiday</th>
            <td mat-cell *matCellDef="let h">{{ h.name }}</td>
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
            <td mat-cell *matCellDef="let h">{{ h.description || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="recurring">
            <th mat-header-cell *matHeaderCellDef>Recurring</th>
            <td mat-cell *matCellDef="let h">
              <mat-icon [style.color]="h.isRecurring ? '#4caf50' : '#ccc'" style="font-size:18px;vertical-align:middle">
                {{ h.isRecurring ? 'autorenew' : 'remove' }}
              </mat-icon>
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
          <tr mat-row *matRowDef="let row; columns: columns;" [class.past-holiday]="isPast(row.date)"></tr>
        </table>
        <div *ngIf="!loading && holidays.length === 0" class="empty-msg">
          No holidays configured. Click "Add Holiday" to add one.
        </div>
      </mat-card-content>
    </mat-card>

    <style>
      .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
      .subtitle { color:#666; font-size:13px; margin:0; }
      .full-width { width:100%; }
      .loading-msg, .empty-msg { padding:24px; text-align:center; color:#666; }
      .day-label { display:block; font-size:11px; color:#888; }
      .type-badge { padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600; text-transform:uppercase; }
      .type-national { background:#e3f2fd; color:#1565c0; }
      .type-regional { background:#e8f5e9; color:#2e7d32; }
      .type-optional { background:#fff9c4; color:#f57f17; }
      .type-company { background:#f3e5f5; color:#6a1b9a; }
      .past-holiday td { opacity: 0.5; }
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
