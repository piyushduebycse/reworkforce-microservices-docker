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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeManagementService, Department } from '../../../core/services/employee-management.service';

@Component({
  selector: 'app-department-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data?.id ? 'Edit' : 'Add' }} Department</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Department Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Engineering">
          <mat-error *ngIf="form.get('name')?.hasError('required')">Required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Brief description..."></textarea>
        </mat-form-field>
        <div *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid || loading">
        {{ loading ? 'Saving...' : (data?.id ? 'Update' : 'Add Department') }}
      </button>
    </mat-dialog-actions>
    <style>
      .dialog-form { display: flex; flex-direction: column; gap: 4px; min-width: 420px; padding-top: 8px; }
      .full-width { width: 100%; }
      .error-msg { color: var(--danger); font-size: 13px; background: var(--danger-bg); border-radius: var(--radius-sm); padding: 8px 12px; }
    </style>
  `
})
export class DepartmentDialogComponent {
  private fb = inject(FormBuilder);
  private service = inject(EmployeeManagementService);
  private dialogRef = inject(MatDialogRef<DepartmentDialogComponent>);
  data: Department = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    name: [this.data?.name || '', Validators.required],
    description: [this.data?.description || '']
  });

  loading = false;
  errorMsg = '';

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    const payload: Department = { name: this.form.value.name!, description: this.form.value.description || '' };
    const call = this.data?.id
      ? this.service.updateDepartment(this.data.id, payload)
      : this.service.createDepartment(payload);

    call.subscribe({
      next: () => this.dialogRef.close(true),
      error: err => { this.loading = false; this.errorMsg = err.error?.message || 'Failed to save department.'; }
    });
  }
}

@Component({
  selector: 'app-department-management',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule],
  template: `
    <div class="page-wrap">
      <div class="page-header">
        <div>
          <h1>Department Management</h1>
          <p class="sub">{{ departments.length }} department{{ departments.length !== 1 ? 's' : '' }}</p>
        </div>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Add Department
        </button>
      </div>

      <div class="table-card">
        <div *ngIf="loading" class="loading-msg">
          <mat-icon>hourglass_empty</mat-icon>
          <span>Loading departments...</span>
        </div>

        <div class="table-wrap" *ngIf="!loading && departments.length > 0">
          <table mat-table [dataSource]="departments" class="dark-table">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>#</th>
              <td mat-cell *matCellDef="let d">
                <span class="id-chip">{{ d.id }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Department Name</th>
              <td mat-cell *matCellDef="let d">
                <div class="dept-name-cell">
                  <div class="dept-icon">
                    <mat-icon>business</mat-icon>
                  </div>
                  <strong>{{ d.name }}</strong>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let d">
                <span class="desc-text">{{ d.description || '—' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let d">
                <span class="status-badge" [class]="(d.isActive || d.active) ? 'approved' : 'rejected'">
                  {{ (d.isActive || d.active) ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let d">
                <button mat-icon-button color="primary" (click)="openDialog(d)" title="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" *ngIf="d.isActive || d.active" (click)="deactivateDept(d)" title="Deactivate">
                  <mat-icon>toggle_on</mat-icon>
                </button>
                <button mat-icon-button color="primary" *ngIf="!(d.isActive || d.active)" (click)="activateDept(d)" title="Activate">
                  <mat-icon>toggle_off</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
        </div>

        <div *ngIf="!loading && departments.length === 0" class="empty-msg">
          <mat-icon>business</mat-icon>
          <p>No departments yet. Click "Add Department" to create one.</p>
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

      .id-chip { font-family: monospace; font-size: 12px; color: var(--text-3); background: var(--bg-elevated); padding: 2px 8px; border-radius: 4px; }

      .dept-name-cell { display: flex; align-items: center; gap: 10px; }
      .dept-icon {
        width: 32px; height: 32px; border-radius: var(--radius-sm);
        background: var(--blue-bg); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .dept-icon mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--blue); }
      .dept-name-cell strong { color: var(--text-1); }

      .desc-text { color: var(--text-3); font-size: 13px; }

      .status-badge { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
      .status-badge.approved { background: var(--success-bg); color: var(--success); }
      .status-badge.rejected { background: var(--danger-bg); color: var(--danger); }

      .empty-msg { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: var(--text-3); }
      .empty-msg mat-icon { font-size: 40px; width: 40px; height: 40px; }
      .empty-msg p { margin: 0; font-size: 14px; }
    </style>
  `
})
export class DepartmentManagementComponent implements OnInit {
  private service = inject(EmployeeManagementService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  departments: Department[] = [];
  columns = ['id', 'name', 'description', 'status', 'actions'];
  loading = true;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.service.getDepartments().subscribe({
      next: r => { this.departments = r.data || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openDialog(dept?: Department) {
    const ref = this.dialog.open(DepartmentDialogComponent, { width: '460px', data: dept || null });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open(dept ? 'Department updated!' : 'Department added!', 'Close', { duration: 3000 });
        this.load();
      }
    });
  }

  deactivateDept(dept: Department) {
    if (!confirm(`Deactivate department "${dept.name}"?`)) return;
    this.service.deactivateDepartment(dept.id!).subscribe({
      next: () => { this.snackBar.open('Department deactivated.', 'Close', { duration: 3000 }); this.load(); },
      error: () => this.snackBar.open('Failed to deactivate.', 'Close', { duration: 3000 })
    });
  }

  activateDept(dept: Department) {
    this.service.activateDepartment(dept.id!).subscribe({
      next: () => { this.snackBar.open('Department activated.', 'Close', { duration: 3000 }); this.load(); },
      error: () => this.snackBar.open('Failed to activate.', 'Close', { duration: 3000 })
    });
  }
}
