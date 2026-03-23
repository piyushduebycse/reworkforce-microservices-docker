import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../core/services/user.service';
import { EmployeeManagementService } from '../../../core/services/employee-management.service';
import { LeaveService } from '../../../core/services/leave.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-add-employee-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Add New Team Member</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName">
            <mat-error *ngIf="form.get('firstName')?.hasError('required')">Required</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName">
            <mat-error *ngIf="form.get('lastName')?.hasError('required')">Required</mat-error>
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email">
          <mat-error *ngIf="form.get('email')?.hasError('required')">Required</mat-error>
          <mat-error *ngIf="form.get('email')?.hasError('email')">Invalid email</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Password</mat-label>
          <input matInput formControlName="password" type="password">
          <mat-error *ngIf="form.get('password')?.hasError('minlength')">Min 6 characters</mat-error>
        </mat-form-field>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role" (selectionChange)="onRoleChange($event.value)">
              <mat-option value="EMPLOYEE">Employee</mat-option>
              <mat-option value="MANAGER">Manager</mat-option>
              <mat-option value="ADMIN">Admin</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phoneNumber" placeholder="+91 9000000000">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width" *ngIf="showReportingTo">
          <mat-label>{{ form.get('role')?.value === 'MANAGER' ? 'Reports to Admin' : 'Reports to Manager' }}</mat-label>
          <mat-select formControlName="managerId">
            <mat-option *ngFor="let u of reportingOptions" [value]="u.id">
              {{ u.firstName }} {{ u.lastName }} ({{ u.employeeId }})
            </mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('managerId')?.hasError('required')">Required</mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Department</mat-label>
            <mat-select formControlName="departmentId" (selectionChange)="onDeptChange($event.value)">
              <mat-option *ngFor="let d of departments" [value]="d.id">{{ d.name }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Designation</mat-label>
            <mat-select formControlName="designationId" [disabled]="!form.get('departmentId')?.value">
              <mat-option *ngFor="let d of designations" [value]="d.id">{{ d.name }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid || loading">
        {{ loading ? 'Adding...' : 'Add Member' }}
      </button>
    </mat-dialog-actions>
    <style>
      .dialog-form { display: flex; flex-direction: column; gap: 4px; min-width: 500px; padding-top: 8px; }
      .form-row { display: flex; gap: 12px; }
      .form-row mat-form-field { flex: 1; }
      .full-width { width: 100%; }
      .error-msg { color: #f44336; font-size: 13px; padding: 4px 0; }
    </style>
  `
})
export class AddEmployeeDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private empMgmtService = inject(EmployeeManagementService);
  private leaveService = inject(LeaveService);
  private dialogRef = inject(MatDialogRef<AddEmployeeDialogComponent>);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['EMPLOYEE', Validators.required],
    phoneNumber: [''],
    managerId: [null as number | null],
    departmentId: [null as number | null],
    designationId: [null as number | null]
  });

  loading = false;
  errorMsg = '';
  showReportingTo = true;
  reportingOptions: User[] = [];
  departments: any[] = [];
  designations: any[] = [];

  ngOnInit() {
    this.loadManagers();
    this.empMgmtService.getDepartments().subscribe({ next: r => this.departments = r.data || [] });
    this.form.get('managerId')?.setValidators(Validators.required);
    this.form.get('managerId')?.updateValueAndValidity();
  }

  onRoleChange(role: string) {
    if (role === 'ADMIN') {
      this.showReportingTo = false;
      this.form.get('managerId')?.clearValidators();
    } else if (role === 'MANAGER') {
      this.showReportingTo = true;
      this.form.get('managerId')?.setValidators(Validators.required);
      this.loadAdmins();
    } else {
      this.showReportingTo = true;
      this.form.get('managerId')?.setValidators(Validators.required);
      this.loadManagers();
    }
    this.form.get('managerId')?.setValue(null);
    this.form.get('managerId')?.updateValueAndValidity();
  }

  onDeptChange(deptId: number) {
    this.designations = [];
    this.form.get('designationId')?.setValue(null);
    this.empMgmtService.getDesignations(deptId).subscribe({ next: r => this.designations = r.data || [] });
  }

  loadManagers() {
    this.userService.getUsersByRole('MANAGER').subscribe({ next: r => this.reportingOptions = r.data || [] });
  }

  loadAdmins() {
    this.userService.getUsersByRole('ADMIN').subscribe({ next: r => this.reportingOptions = r.data || [] });
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMsg = '';
    const val = this.form.value;
    const payload: any = {
      firstName: val.firstName, lastName: val.lastName, email: val.email,
      password: val.password, role: val.role, phoneNumber: val.phoneNumber || null,
      managerId: val.managerId || null, departmentId: val.departmentId || null,
      designationId: val.designationId || null
    };
    this.http.post<any>(`${environment.apiGatewayUrl}/api/auth/register`, payload).subscribe({
      next: (res) => {
        // Auto-assign leave balances from quota for the new user's role
        const newUserId = res?.data?.userId;
        const role = val.role || 'EMPLOYEE';
        const year = new Date().getFullYear();
        if (newUserId) {
          this.leaveService.initUserBalancesFromQuota(newUserId, role, year)
            .subscribe({ error: () => {} }); // silently proceed even if quota init fails
        }
        this.dialogRef.close(true);
      },
      error: err => { this.loading = false; this.errorMsg = err.error?.message || 'Failed to add member.'; }
    });
  }
}

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatChipsModule, MatTooltipModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Employee Management</h1>
        <p class="subtitle">{{ employees.length }} total members</p>
      </div>
      <button mat-raised-button color="primary" (click)="openAddDialog()">
        <mat-icon>person_add</mat-icon> Add Member
      </button>
    </div>

    <mat-card>
      <mat-card-content>
        <div *ngIf="loading" class="loading-msg">Loading employees...</div>
        <table mat-table [dataSource]="employees" class="full-width" *ngIf="!loading">
          <ng-container matColumnDef="employeeId">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let e">
              <span class="emp-id" [class]="'id-' + e.role?.toLowerCase()">{{ e.employeeId }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let e"><strong>{{ e.firstName }} {{ e.lastName }}</strong></td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let e">{{ e.email }}</td>
          </ng-container>
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let e">
              <span class="role-badge" [class]="'role-' + e.role?.toLowerCase()">{{ e.role }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="manager">
            <th mat-header-cell *matHeaderCellDef>Reports To</th>
            <td mat-cell *matCellDef="let e">{{ getManagerName(e.managerId) || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let e">
              <span class="status-badge" [class]="(e.isActive || e.active) ? 'approved' : 'rejected'">
                {{ (e.isActive || e.active) ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let e">
              <button mat-icon-button color="warn" *ngIf="e.isActive || e.active" (click)="deactivate(e)" matTooltip="Deactivate">
                <mat-icon>person_off</mat-icon>
              </button>
              <button mat-icon-button color="primary" *ngIf="!(e.isActive || e.active)" (click)="activate(e)" matTooltip="Reactivate">
                <mat-icon>person</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <div *ngIf="!loading && employees.length === 0" class="empty-msg">No employees found.</div>
      </mat-card-content>
    </mat-card>

    <style>
      .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
      .subtitle { color:#666; font-size:13px; margin:0; }
      .full-width { width:100%; }
      .loading-msg, .empty-msg { padding:24px; text-align:center; color:#666; }
      .emp-id { font-family:monospace; font-size:12px; padding:2px 6px; border-radius:4px; }
      .id-employee { background:#e3f2fd; color:#1565c0; }
      .id-manager { background:#fff3e0; color:#e65100; }
      .id-admin { background:#fce4ec; color:#c62828; }
      .role-badge { padding:3px 10px; border-radius:12px; font-size:11px; font-weight:600; }
      .role-employee { background:#e8f5e9; color:#2e7d32; }
      .role-manager { background:#fff3e0; color:#e65100; }
      .role-admin { background:#fce4ec; color:#c62828; }
    </style>
  `
})
export class EmployeeManagementComponent implements OnInit {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  employees: any[] = [];
  allUsers: any[] = [];
  columns = ['employeeId', 'name', 'email', 'role', 'manager', 'status', 'actions'];
  loading = true;

  ngOnInit() { this.loadEmployees(); }

  loadEmployees() {
    this.loading = true;
    this.userService.getAllUsers(0, 100).subscribe({
      next: r => {
        this.employees = r.data?.content || r.data || [];
        this.allUsers = [...this.employees];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getManagerName(managerId: number): string {
    if (!managerId) return '';
    const mgr = this.allUsers.find(u => u.id === managerId);
    return mgr ? `${mgr.firstName} ${mgr.lastName}` : '';
  }

  openAddDialog() {
    const ref = this.dialog.open(AddEmployeeDialogComponent, { width: '560px', disableClose: true });
    ref.afterClosed().subscribe(result => {
      if (result) { this.snackBar.open('Member added successfully!', 'Close', { duration: 3000 }); this.loadEmployees(); }
    });
  }

  deactivate(emp: any) {
    if (!confirm(`Deactivate ${emp.firstName} ${emp.lastName}?`)) return;
    this.userService.deactivateUser(emp.id).subscribe({
      next: () => { this.snackBar.open('Member deactivated.', 'Close', { duration: 3000 }); this.loadEmployees(); },
      error: () => this.snackBar.open('Failed to deactivate.', 'Close', { duration: 3000 })
    });
  }

  activate(emp: any) {
    this.userService.activateUser(emp.id).subscribe({
      next: () => { this.snackBar.open('Member reactivated.', 'Close', { duration: 3000 }); this.loadEmployees(); },
      error: () => this.snackBar.open('Failed to activate.', 'Close', { duration: 3000 })
    });
  }
}
