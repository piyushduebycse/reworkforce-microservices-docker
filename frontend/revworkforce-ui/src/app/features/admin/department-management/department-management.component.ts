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
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Brief description..."></textarea>
        </mat-form-field>
        <div *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid || loading">
        {{ loading ? 'Saving...' : (data?.id ? 'Update' : 'Add Department') }}
      </button>
    </mat-dialog-actions>
    <style>
      .dialog-form { display: flex; flex-direction: column; gap: 4px; min-width: 420px; padding-top: 8px; }
      .full-width { width: 100%; }
      .error-msg { color: #f44336; font-size: 13px; }
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
    <div class="page-header">
      <h1>Department Management</h1>
      <button mat-raised-button color="primary" (click)="openDialog()">
        <mat-icon>add</mat-icon> Add Department
      </button>
    </div>
    <mat-card>
      <mat-card-content>
        <div *ngIf="loading" class="loading-msg">Loading departments...</div>
        <table mat-table [dataSource]="departments" class="full-width" *ngIf="!loading">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>#</th>
            <td mat-cell *matCellDef="let d">{{ d.id }}</td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Department Name</th>
            <td mat-cell *matCellDef="let d"><strong>{{ d.name }}</strong></td>
          </ng-container>
          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let d">{{ d.description || '—' }}</td>
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
        <div *ngIf="!loading && departments.length === 0" class="empty-msg">
          No departments yet. Click "Add Department" to create one.
        </div>
      </mat-card-content>
    </mat-card>
    <style>
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .full-width { width: 100%; }
      .loading-msg, .empty-msg { padding: 24px; text-align: center; color: #666; }
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
