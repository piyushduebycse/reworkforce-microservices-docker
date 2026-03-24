import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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

/* ─── Add Employee Dialog (unchanged logic) ─────────── */
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
      <button mat-stroked-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid || loading">
        {{ loading ? 'Adding...' : 'Add Member' }}
      </button>
    </mat-dialog-actions>
    <style>
      .dialog-form { display: flex; flex-direction: column; gap: 4px; min-width: 500px; padding-top: 8px; }
      .form-row { display: flex; gap: 12px; }
      .form-row mat-form-field { flex: 1; }
      .full-width { width: 100%; }
      .error-msg { color: var(--danger); font-size: 13px; background: var(--danger-bg); border-radius: var(--radius-sm); padding: 8px 12px; }
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
        const newUserId = res?.data?.userId;
        const role = val.role || 'EMPLOYEE';
        const year = new Date().getFullYear();
        if (newUserId) {
          this.leaveService.initUserBalancesFromQuota(newUserId, role, year)
            .subscribe({ error: () => {} });
        }
        this.dialogRef.close(true);
      },
      error: err => { this.loading = false; this.errorMsg = err.error?.message || 'Failed to add member.'; }
    });
  }
}

/* ─── Employee Management Page ───────────────────────── */
@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatTableModule, MatButtonModule,
    MatIconModule, MatDialogModule, MatSnackBarModule, MatChipsModule, MatTooltipModule,
    MatSelectModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="page-wrap">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Employee Management</h1>
          <p class="sub">{{ filtered.length }} of {{ allEmployees.length }} members</p>
        </div>
        <button mat-raised-button color="primary" (click)="openAddDialog()">
          <mat-icon>person_add</mat-icon> Add Member
        </button>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <!-- Search -->
        <div class="search-wrap">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            class="search-input"
            [(ngModel)]="searchQuery"
            (ngModelChange)="applyFilters()"
            placeholder="Search name, email, or ID…">
          <button *ngIf="searchQuery" class="clear-btn" (click)="searchQuery=''; applyFilters()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Role filter -->
        <div class="filter-chips">
          <button class="chip" [class.active]="roleFilter===''" (click)="roleFilter=''; applyFilters()">All Roles</button>
          <button class="chip employee" [class.active]="roleFilter==='EMPLOYEE'" (click)="roleFilter='EMPLOYEE'; applyFilters()">Employee</button>
          <button class="chip manager"  [class.active]="roleFilter==='MANAGER'"  (click)="roleFilter='MANAGER';  applyFilters()">Manager</button>
          <button class="chip admin"    [class.active]="roleFilter==='ADMIN'"    (click)="roleFilter='ADMIN';    applyFilters()">Admin</button>
        </div>

        <!-- Department filter -->
        <div class="select-wrap">
          <mat-icon class="select-icon">corporate_fare</mat-icon>
          <select class="dark-select" [(ngModel)]="deptFilter" (ngModelChange)="applyFilters()">
            <option value="">All Departments</option>
            <option *ngFor="let d of departments" [value]="d.id">{{ d.name }}</option>
          </select>
          <mat-icon class="select-caret">expand_more</mat-icon>
        </div>

        <!-- Status filter -->
        <div class="select-wrap">
          <mat-icon class="select-icon">toggle_on</mat-icon>
          <select class="dark-select" [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <mat-icon class="select-caret">expand_more</mat-icon>
        </div>

        <!-- Reset -->
        <button *ngIf="hasFilters()" class="reset-btn" (click)="resetFilters()">
          <mat-icon>filter_alt_off</mat-icon> Reset
        </button>
      </div>

      <!-- Table -->
      <div class="table-card">
        <div *ngIf="loading" class="loading-msg">
          <mat-icon>hourglass_empty</mat-icon>
          <span>Loading employees…</span>
        </div>

        <div class="table-wrap" *ngIf="!loading && filtered.length > 0">
          <table mat-table [dataSource]="filtered" class="dark-table">

            <!-- ID -->
            <ng-container matColumnDef="employeeId">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let e">
                <span class="emp-id" [class]="'id-' + e.role?.toLowerCase()">{{ e.employeeId }}</span>
              </td>
            </ng-container>

            <!-- Name -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let e">
                <div class="name-cell">
                  <div class="avatar" [class]="'av-' + e.role?.toLowerCase()">
                    {{ (e.firstName||'?')[0] }}{{ (e.lastName||'?')[0] }}
                  </div>
                  <div>
                    <div class="emp-name">{{ e.firstName }} {{ e.lastName }}</div>
                    <div class="emp-email">{{ e.email }}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Role -->
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let e">
                <span class="role-badge" [class]="'role-' + e.role?.toLowerCase()">{{ e.role }}</span>
              </td>
            </ng-container>

            <!-- Department -->
            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef>Department</th>
              <td mat-cell *matCellDef="let e">
                <div *ngIf="getDeptName(e.departmentId) as dName; else noDept" class="dept-cell">
                  <mat-icon>corporate_fare</mat-icon>
                  <span>{{ dName }}</span>
                </div>
                <ng-template #noDept><span class="empty-val">—</span></ng-template>
              </td>
            </ng-container>

            <!-- Designation -->
            <ng-container matColumnDef="designation">
              <th mat-header-cell *matHeaderCellDef>Designation</th>
              <td mat-cell *matCellDef="let e">
                <span *ngIf="getDesigName(e.designationId) as dName" class="desig-tag">{{ dName }}</span>
                <span *ngIf="!getDesigName(e.designationId)" class="empty-val">—</span>
              </td>
            </ng-container>

            <!-- Reports To -->
            <ng-container matColumnDef="manager">
              <th mat-header-cell *matHeaderCellDef>Reports To</th>
              <td mat-cell *matCellDef="let e">
                <div *ngIf="getManagerName(e.managerId) as mName; else noMgr" class="reports-cell">
                  <div class="mgr-dot"></div>
                  <span>{{ mName }}</span>
                </div>
                <ng-template #noMgr><span class="empty-val">—</span></ng-template>
              </td>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let e">
                <span class="status-dot-wrap" [class.is-active]="e.isActive || e.active">
                  <span class="status-dot"></span>
                  {{ (e.isActive || e.active) ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </ng-container>

            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let e">
                <button class="action-icon-btn warn" *ngIf="e.isActive || e.active"
                  (click)="deactivate(e)" matTooltip="Deactivate">
                  <mat-icon>person_off</mat-icon>
                </button>
                <button class="action-icon-btn success" *ngIf="!(e.isActive || e.active)"
                  (click)="activate(e)" matTooltip="Reactivate">
                  <mat-icon>person</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;" class="table-row"></tr>
          </table>
        </div>

        <!-- Empty after filter -->
        <div *ngIf="!loading && filtered.length === 0 && allEmployees.length > 0" class="empty-msg">
          <mat-icon>search_off</mat-icon>
          <p>No employees match your filters.</p>
          <button class="reset-btn" (click)="resetFilters()">Clear filters</button>
        </div>

        <!-- Empty initially -->
        <div *ngIf="!loading && allEmployees.length === 0" class="empty-msg">
          <mat-icon>people_outline</mat-icon>
          <p>No employees found.</p>
        </div>
      </div>
    </div>

    <style>
      :host { display: block; }

      .page-header {
        display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      }
      .page-header h1 { margin: 0; color: var(--text-1); font-size: 22px; font-weight: 700; }
      .sub { color: var(--text-3); font-size: 13px; margin: 4px 0 0; }

      /* ── Filter bar ── */
      .filter-bar {
        display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        margin-bottom: 16px; padding: 14px 16px;
        background: var(--bg-card); border: 1px solid var(--border);
        border-radius: var(--radius);
      }

      .search-wrap {
        display: flex; align-items: center; gap: 8px;
        background: var(--bg-surface); border: 1px solid var(--border);
        border-radius: var(--radius-sm); padding: 0 12px; height: 38px;
        min-width: 240px; transition: border-color 0.15s;
        flex: 1;
      }
      .search-wrap:focus-within { border-color: var(--primary); }
      .search-icon { font-size: 17px; color: var(--text-3); flex-shrink: 0; }
      .search-input {
        flex: 1; background: transparent; border: none; outline: none;
        color: var(--text-1); font-size: 13px; font-family: 'Inter', sans-serif;
      }
      .search-input::placeholder { color: var(--text-3); }
      .clear-btn {
        background: none; border: none; cursor: pointer; padding: 0;
        display: flex; align-items: center; color: var(--text-3);
      }
      .clear-btn mat-icon { font-size: 16px; }

      /* Role chips */
      .filter-chips { display: flex; gap: 6px; flex-shrink: 0; }
      .chip {
        padding: 5px 13px; border-radius: 20px; font-size: 12px; font-weight: 600;
        border: 1px solid var(--border); background: transparent; cursor: pointer;
        color: var(--text-2); transition: all 0.15s; white-space: nowrap;
      }
      .chip:hover { border-color: var(--primary); color: var(--primary); }
      .chip.active { background: var(--primary-glow); border-color: var(--primary); color: var(--primary); }
      .chip.employee.active { background: var(--success-bg); border-color: var(--success); color: var(--success); }
      .chip.manager.active  { background: var(--orange-bg);  border-color: var(--orange);  color: var(--orange); }
      .chip.admin.active    { background: var(--danger-bg);  border-color: var(--danger);  color: var(--danger); }

      /* Selects */
      .select-wrap {
        display: flex; align-items: center; gap: 6px;
        background: var(--bg-surface); border: 1px solid var(--border);
        border-radius: var(--radius-sm); padding: 0 10px; height: 38px;
        position: relative; transition: border-color 0.15s; flex-shrink: 0;
      }
      .select-wrap:focus-within { border-color: var(--primary); }
      .select-icon { font-size: 16px; color: var(--text-3); flex-shrink: 0; }
      .dark-select {
        background: transparent; border: none; outline: none;
        color: var(--text-1); font-size: 13px; font-family: 'Inter', sans-serif;
        cursor: pointer; appearance: none; padding-right: 20px; min-width: 140px;
      }
      .dark-select option { background: var(--bg-elevated); color: var(--text-1); }
      .select-caret { font-size: 16px; color: var(--text-3); pointer-events: none; margin-left: -18px; }

      .reset-btn {
        display: flex; align-items: center; gap: 5px; padding: 6px 12px;
        border-radius: var(--radius-sm); border: 1px solid var(--border);
        background: transparent; cursor: pointer; color: var(--text-2);
        font-size: 12px; font-weight: 600; transition: all 0.15s; flex-shrink: 0;
      }
      .reset-btn:hover { border-color: var(--danger); color: var(--danger); }
      .reset-btn mat-icon { font-size: 15px; }

      /* ── Table ── */
      .table-card {
        background: var(--bg-card); border: 1px solid var(--border);
        border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow);
      }
      .loading-msg {
        display: flex; align-items: center; justify-content: center;
        gap: 10px; padding: 40px; color: var(--text-3);
      }
      .table-wrap { overflow-x: auto; }
      .dark-table { width: 100%; background: transparent; }

      .dark-table ::ng-deep .mat-mdc-header-row {
        background: var(--bg-surface); border-bottom: 1px solid var(--border);
      }
      .dark-table ::ng-deep .mat-mdc-header-cell {
        color: var(--text-3); font-size: 11px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.6px; border-bottom: none;
        padding: 0 12px;
      }
      .dark-table ::ng-deep .mat-mdc-row {
        background: transparent; border-bottom: 1px solid var(--border); transition: background 0.15s;
      }
      .dark-table ::ng-deep .mat-mdc-row:hover { background: var(--bg-surface); }
      .dark-table ::ng-deep .mat-mdc-row:last-child { border-bottom: none; }
      .dark-table ::ng-deep .mat-mdc-cell { color: var(--text-2); border-bottom: none; font-size: 13px; padding: 10px 12px; }

      /* Name cell */
      .name-cell { display: flex; align-items: center; gap: 10px; }
      .avatar {
        width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 700; color: #fff;
      }
      .av-employee { background: linear-gradient(135deg, var(--primary), var(--primary-h)); }
      .av-manager  { background: linear-gradient(135deg, var(--orange), #d97706); }
      .av-admin    { background: linear-gradient(135deg, var(--danger), #dc2626); }
      .emp-name  { color: var(--text-1); font-weight: 600; font-size: 13px; line-height: 1.3; }
      .emp-email { color: var(--text-3); font-size: 11px; }

      /* Role badge */
      .role-badge { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
      .role-employee { background: var(--success-bg); color: var(--success); }
      .role-manager  { background: var(--orange-bg);  color: var(--orange); }
      .role-admin    { background: var(--danger-bg);  color: var(--danger); }

      /* ID chip */
      .emp-id { font-family: monospace; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
      .id-employee { background: var(--blue-bg);   color: var(--blue); }
      .id-manager  { background: var(--orange-bg); color: var(--orange); }
      .id-admin    { background: var(--danger-bg); color: var(--danger); }

      /* Department cell */
      .dept-cell {
        display: flex; align-items: center; gap: 5px;
        color: var(--blue); font-size: 12px;
      }
      .dept-cell mat-icon { font-size: 14px; width: 14px; height: 14px; }

      /* Designation tag */
      .desig-tag {
        display: inline-block; padding: 2px 9px; border-radius: 20px; font-size: 11px;
        background: var(--purple-bg); color: var(--purple); font-weight: 500;
      }

      /* Reports To */
      .reports-cell { display: flex; align-items: center; gap: 7px; color: var(--text-2); font-size: 13px; }
      .mgr-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }

      /* Status */
      .status-dot-wrap {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 12px; font-weight: 600; color: var(--text-3);
      }
      .status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--text-3); }
      .status-dot-wrap.is-active { color: var(--success); }
      .status-dot-wrap.is-active .status-dot { background: var(--success); box-shadow: 0 0 6px var(--success); }

      /* Action buttons */
      .action-icon-btn {
        width: 30px; height: 30px; border-radius: 7px; border: 1px solid var(--border);
        background: transparent; cursor: pointer; display: inline-flex;
        align-items: center; justify-content: center; transition: all 0.15s;
      }
      .action-icon-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
      .action-icon-btn.warn { color: var(--danger); }
      .action-icon-btn.warn:hover { background: var(--danger-bg); border-color: var(--danger); }
      .action-icon-btn.success { color: var(--success); }
      .action-icon-btn.success:hover { background: var(--success-bg); border-color: var(--success); }

      /* Empty val */
      .empty-val { color: var(--text-3); font-size: 13px; }

      /* Empty state */
      .empty-msg { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 52px; color: var(--text-3); text-align: center; }
      .empty-msg mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.4; }
      .empty-msg p { margin: 0; font-size: 14px; }
    </style>
  `
})
export class EmployeeManagementComponent implements OnInit {
  private userService = inject(UserService);
  private empMgmtService = inject(EmployeeManagementService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  allEmployees: any[] = [];
  filtered: any[]    = [];
  departments: any[] = [];
  allDesignations: any[] = [];

  private deptMap  = new Map<number, string>();
  private desigMap = new Map<number, string>();
  private userMap  = new Map<number, string>();

  searchQuery  = '';
  roleFilter   = '';
  deptFilter: any = '';
  statusFilter = '';

  columns = ['employeeId', 'name', 'role', 'department', 'designation', 'manager', 'status', 'actions'];
  loading = true;

  ngOnInit() {
    this.loadReferenceData();
    this.loadEmployees();
  }

  loadReferenceData() {
    this.empMgmtService.getDepartments().subscribe({
      next: r => {
        this.departments = (r.data || []).filter((d: any) => d.isActive !== false && d.active !== false);
        this.departments.forEach((d: any) => this.deptMap.set(d.id, d.name));
      }
    });
    this.empMgmtService.getDesignations().subscribe({
      next: r => {
        this.allDesignations = r.data || [];
        this.allDesignations.forEach((d: any) => this.desigMap.set(d.id, d.name));
      }
    });
  }

  loadEmployees() {
    this.loading = true;
    this.userService.getAllUsers(0, 200).subscribe({
      next: r => {
        this.allEmployees = r.data?.content || r.data || [];
        this.allEmployees.forEach((u: any) => this.userMap.set(u.id, `${u.firstName} ${u.lastName}`));
        this.applyFilters();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilters() {
    let result = [...this.allEmployees];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(e =>
        e.firstName?.toLowerCase().includes(q) ||
        e.lastName?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.employeeId?.toLowerCase().includes(q)
      );
    }

    if (this.roleFilter)   result = result.filter(e => e.role === this.roleFilter);
    if (this.deptFilter)   result = result.filter(e => e.departmentId == this.deptFilter);
    if (this.statusFilter === 'active')   result = result.filter(e =>  (e.isActive || e.active));
    if (this.statusFilter === 'inactive') result = result.filter(e => !(e.isActive || e.active));

    this.filtered = result;
  }

  hasFilters(): boolean {
    return !!(this.searchQuery || this.roleFilter || this.deptFilter || this.statusFilter);
  }

  resetFilters() {
    this.searchQuery = '';
    this.roleFilter  = '';
    this.deptFilter  = '';
    this.statusFilter = '';
    this.applyFilters();
  }

  getDeptName(id: number): string  { return id ? (this.deptMap.get(id)  || '') : ''; }
  getDesigName(id: number): string { return id ? (this.desigMap.get(id) || '') : ''; }
  getManagerName(id: number): string { return id ? (this.userMap.get(id) || `#${id}`) : ''; }

  openAddDialog() {
    const ref = this.dialog.open(AddEmployeeDialogComponent, { width: '560px', disableClose: true });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Member added successfully!', 'Close', { duration: 3000 });
        this.loadReferenceData();
        this.loadEmployees();
      }
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
