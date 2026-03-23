import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LeaveService } from '../../../core/services/leave.service';
import { UserService } from '../../../core/services/user.service';
import { LeaveBalance, LeaveType } from '../../../core/models/leave.model';
import { User } from '../../../core/models/user.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-leave-balance-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTableModule, MatTabsModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatCheckboxModule],
  template: `
    <div class="page-header">
      <h1>Leave Configuration</h1>
      <p>Manage leave types, default quotas, and employee balances</p>
    </div>

    <mat-tab-group>

      <!-- ═══ TAB 1: Leave Types & Quotas ═══ -->
      <mat-tab label="Leave Types & Quotas">
        <div class="tab-content">

          <!-- Leave Types -->
          <mat-card class="section-card">
            <mat-card-content>
              <div class="section-header">
                <h3>Leave Types</h3>
                <button mat-raised-button color="primary" (click)="showTypeForm = !showTypeForm">
                  <mat-icon>{{ showTypeForm ? 'close' : 'add' }}</mat-icon>
                  {{ showTypeForm ? 'Cancel' : 'Add Type' }}
                </button>
              </div>

              <!-- Add Type Form -->
              <div *ngIf="showTypeForm" class="inline-form">
                <mat-form-field appearance="outline">
                  <mat-label>Type Name *</mat-label>
                  <input matInput [(ngModel)]="newType.name" placeholder="e.g. Paternity Leave">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Description</mat-label>
                  <input matInput [(ngModel)]="newType.description" placeholder="Brief description">
                </mat-form-field>
                <mat-checkbox [(ngModel)]="newType.isPaid" color="primary">Paid Leave</mat-checkbox>
                <button mat-raised-button color="primary" [disabled]="!newType.name || savingType"
                  (click)="saveLeaveType()">
                  {{ savingType ? 'Saving...' : 'Add Leave Type' }}
                </button>
              </div>

              <table mat-table [dataSource]="leaveTypes" class="full-width">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let t">
                    <ng-container *ngIf="editTypeId !== t.id">
                      <strong>{{ t.name }}</strong>
                      <span class="paid-chip" *ngIf="t.isPaid || t.paid">Paid</span>
                    </ng-container>
                    <input *ngIf="editTypeId === t.id" [(ngModel)]="editTypeName" class="edit-input">
                  </td>
                </ng-container>
                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let t">
                    <ng-container *ngIf="editTypeId !== t.id">{{ t.description || '—' }}</ng-container>
                    <input *ngIf="editTypeId === t.id" [(ngModel)]="editTypeDesc" class="edit-input">
                  </td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let t">
                    <ng-container *ngIf="editTypeId !== t.id">
                      <button mat-icon-button color="primary" (click)="startEditType(t)" title="Edit">
                        <mat-icon>edit</mat-icon>
                      </button>
                    </ng-container>
                    <ng-container *ngIf="editTypeId === t.id">
                      <button mat-icon-button color="primary" (click)="saveEditType(t)" title="Save">
                        <mat-icon>check</mat-icon>
                      </button>
                      <button mat-icon-button (click)="editTypeId = null" title="Cancel">
                        <mat-icon>close</mat-icon>
                      </button>
                    </ng-container>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['name','description','actions']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['name','description','actions'];"></tr>
              </table>
            </mat-card-content>
          </mat-card>

          <!-- Default Quotas -->
          <mat-card class="section-card">
            <mat-card-content>
              <div class="section-header">
                <h3>Default Quotas — {{ currentYear }}</h3>
                <p class="hint">Set how many days each role gets per leave type. Applied automatically when adding new employees.</p>
              </div>
              <div class="quota-note">
                <mat-icon>info</mat-icon>
                After saving quotas, use <strong>"Apply to All"</strong> in the Balances tab to assign them to existing employees.
              </div>

              <table mat-table [dataSource]="quotaRows" class="full-width quota-table">
                <ng-container matColumnDef="leaveType">
                  <th mat-header-cell *matHeaderCellDef>Leave Type</th>
                  <td mat-cell *matCellDef="let row"><strong>{{ row.leaveTypeName }}</strong></td>
                </ng-container>
                <ng-container *ngFor="let role of roles" [matColumnDef]="role">
                  <th mat-header-cell *matHeaderCellDef>
                    <span class="role-head" [ngClass]="'role-' + role.toLowerCase()">{{ role }}</span>
                  </th>
                  <td mat-cell *matCellDef="let row">
                    <div class="quota-input-cell">
                      <input type="number" min="0" max="365"
                        [(ngModel)]="row.days[role]"
                        class="quota-input"
                        (change)="saveQuota(row, role)">
                      <span class="days-unit">days</span>
                    </div>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="quotaColumns"></tr>
                <tr mat-row *matRowDef="let r; columns: quotaColumns;"></tr>
              </table>

              <div *ngIf="quotaRows.length === 0" class="empty-msg">
                Add leave types above to set quotas.
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-tab>

      <!-- ═══ TAB 2: Employee Balances ═══ -->
      <mat-tab label="Employee Balances">
        <div class="tab-content">
          <mat-card class="section-card">
            <mat-card-content>
              <div class="section-header">
                <h3>Employee Balances — {{ currentYear }}</h3>
                <div class="header-actions">
                  <button mat-stroked-button color="primary" [disabled]="initializing" (click)="applyQuotaToAll()">
                    <mat-icon>people</mat-icon>
                    {{ initializing ? 'Applying...' : 'Apply Quota to All' }}
                  </button>
                  <span class="hint-small">Assigns missing balances from quota defaults</span>
                </div>
              </div>

              <div *ngIf="loadingBalances" class="loading-center">
                <mat-spinner diameter="40"></mat-spinner>
              </div>

              <div *ngIf="!loadingBalances" class="table-scroll">
                <table mat-table [dataSource]="employees" class="full-width">
                  <ng-container matColumnDef="employee">
                    <th mat-header-cell *matHeaderCellDef>Employee</th>
                    <td mat-cell *matCellDef="let emp">
                      <div class="emp-cell">
                        <div class="emp-avatar">{{ emp.firstName[0] }}{{ emp.lastName[0] }}</div>
                        <div>
                          <div class="emp-name">{{ emp.firstName }} {{ emp.lastName }}</div>
                          <div class="emp-meta">{{ emp.employeeId }} · <span [ngClass]="'role-' + emp.role.toLowerCase()">{{ emp.role }}</span></div>
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container *ngFor="let t of leaveTypes" [matColumnDef]="'type_' + t.id">
                    <th mat-header-cell *matHeaderCellDef>{{ t.name }}</th>
                    <td mat-cell *matCellDef="let emp">
                      <ng-container *ngIf="getBalance(emp.id, t.id) as bal">
                        <div class="bal-cell" *ngIf="editKey !== (emp.id + '_' + t.id)">
                          <span class="bal-total">{{ bal.totalDays }}</span>
                          <span class="bal-used">/{{ bal.usedDays }}u</span>
                          <button mat-icon-button class="mini-btn" (click)="startBalEdit(emp.id, t.id, bal.totalDays)">
                            <mat-icon>edit</mat-icon>
                          </button>
                        </div>
                        <div class="bal-edit" *ngIf="editKey === (emp.id + '_' + t.id)">
                          <input type="number" [(ngModel)]="editVal" min="0" class="bal-input"
                            (keyup.enter)="saveBal(emp.id, t.id)" (keyup.escape)="editKey = null">
                          <button mat-icon-button color="primary" (click)="saveBal(emp.id, t.id)"><mat-icon>check</mat-icon></button>
                          <button mat-icon-button (click)="editKey = null"><mat-icon>close</mat-icon></button>
                        </div>
                      </ng-container>
                      <ng-container *ngIf="!getBalance(emp.id, t.id)">
                        <span class="no-bal">—</span>
                        <button mat-icon-button class="mini-btn" title="Set" (click)="startBalEdit(emp.id, t.id, 0)">
                          <mat-icon>add</mat-icon>
                        </button>
                      </ng-container>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="balColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: balColumns;"></tr>
                </table>
                <p *ngIf="employees.length === 0" class="empty-msg">No employees found.</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-tab>

    </mat-tab-group>

    <style>
      .page-header { margin-bottom: 24px; }
      .page-header h1 { margin: 0; }
      .page-header p { color: #666; margin: 4px 0 0; }
      .tab-content { padding: 20px 0; display: flex; flex-direction: column; gap: 20px; }
      .section-card { }
      .section-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
      .section-header h3 { margin: 0; }
      .section-header p { color: #666; font-size: 13px; margin: 4px 0 0; }
      .header-actions { display: flex; align-items: center; gap: 12px; }
      .hint-small { font-size: 12px; color: #888; }
      .hint { color: #666; font-size: 13px; }
      .quota-note { display: flex; align-items: center; gap: 8px; background: #e3f2fd; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; color: #1565c0; }
      .quota-note mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
      .inline-form { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; padding: 16px; background: #f5f5f5; border-radius: 8px; margin-bottom: 16px; }
      .inline-form mat-form-field { flex: 1; min-width: 180px; }
      .full-width { width: 100%; }
      .table-scroll { overflow-x: auto; }
      .edit-input { border: 1px solid #3f51b5; border-radius: 4px; padding: 4px 8px; font-size: 13px; width: 130px; }
      .paid-chip { margin-left: 6px; background: #e8f5e9; color: #2e7d32; font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 8px; }
      /* Quota table */
      .quota-table .role-head { font-size: 11px; font-weight: 700; text-transform: uppercase; }
      .quota-input-cell { display: flex; align-items: center; gap: 4px; }
      .quota-input { width: 65px; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; text-align: center; }
      .quota-input:focus { outline: none; border-color: #3f51b5; }
      .days-unit { font-size: 11px; color: #888; }
      /* Role styles */
      .role-admin, .role-ADMIN { color: #f44336; font-weight: 600; }
      .role-manager, .role-MANAGER { color: #ff9800; font-weight: 600; }
      .role-employee, .role-EMPLOYEE { color: #4caf50; font-weight: 600; }
      /* Balance table */
      .emp-cell { display: flex; align-items: center; gap: 10px; padding: 6px 0; }
      .emp-avatar { width: 32px; height: 32px; border-radius: 50%; background: #3f51b5; color: white;
        display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; flex-shrink: 0; }
      .emp-name { font-size: 13px; font-weight: 600; }
      .emp-meta { font-size: 11px; color: #888; }
      .bal-cell { display: flex; align-items: center; }
      .bal-total { font-weight: 700; color: #3f51b5; font-size: 14px; }
      .bal-used { font-size: 11px; color: #888; margin-left: 2px; }
      .bal-edit { display: flex; align-items: center; }
      .bal-input { width: 50px; padding: 4px 6px; border: 1px solid #3f51b5; border-radius: 4px; font-size: 12px; }
      .mini-btn { width: 24px; height: 24px; line-height: 24px; opacity: 0.4; }
      .mini-btn:hover { opacity: 1; }
      .mini-btn mat-icon { font-size: 15px; width: 15px; height: 15px; }
      .no-bal { color: #ccc; font-size: 13px; }
      .loading-center { display: flex; justify-content: center; padding: 40px; }
      .empty-msg { text-align: center; color: #999; padding: 24px; }
    </style>
  `
})
export class LeaveBalanceAdminComponent implements OnInit {
  private leaveService = inject(LeaveService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  leaveTypes: LeaveType[] = [];
  employees: User[] = [];
  allBalances: Map<string, LeaveBalance> = new Map();
  quotaRows: { leaveTypeId: number; leaveTypeName: number; days: Record<string, number>; quotaIds: Record<string, number> }[] = [];

  roles = ['EMPLOYEE', 'MANAGER', 'ADMIN'];
  quotaColumns: string[] = [];
  balColumns: string[] = [];
  currentYear = new Date().getFullYear();

  // Leave type form
  showTypeForm = false;
  newType = { name: '', description: '', isPaid: true };
  savingType = false;
  editTypeId: number | null = null;
  editTypeName = '';
  editTypeDesc = '';

  // Balance editing
  editKey: string | null = null;
  editVal = 0;
  loadingBalances = true;
  initializing = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    forkJoin({
      types: this.leaveService.getLeaveTypes(),
      users: this.userService.getAllUsers(),
      quotas: this.leaveService.getQuotas(this.currentYear)
    }).subscribe({
      next: ({ types, users, quotas }) => {
        this.leaveTypes = types.data || [];
        const allUsers = users.data?.content || users.data || [];
        this.employees = allUsers.filter((u: User) => (u.isActive || u.active) && u.role !== 'ADMIN');
        this.balColumns = ['employee', ...this.leaveTypes.map(t => 'type_' + t.id)];
        this.quotaColumns = ['leaveType', ...this.roles];
        this.buildQuotaRows(quotas.data || []);
        this.loadBalances();
      },
      error: () => { this.loadingBalances = false; }
    });
  }

  buildQuotaRows(quotas: any[]): void {
    this.quotaRows = this.leaveTypes.map(t => {
      const row: any = { leaveTypeId: t.id, leaveTypeName: t.name, days: {}, quotaIds: {} };
      this.roles.forEach(role => {
        const q = quotas.find((x: any) => x.leaveTypeId === t.id && x.role === role);
        row.days[role] = q ? q.totalDays : 0;
        if (q?.id) row.quotaIds[role] = q.id;
      });
      return row;
    });
  }

  loadBalances(): void {
    this.loadingBalances = true;
    this.allBalances.clear();
    if (this.employees.length === 0) { this.loadingBalances = false; return; }
    const requests = this.employees.map(emp => this.leaveService.getAllUserBalances(emp.id, this.currentYear));
    forkJoin(requests).subscribe({
      next: (results) => {
        results.forEach((r, i) => {
          const emp = this.employees[i];
          (r.data || []).forEach((b: LeaveBalance) => {
            this.allBalances.set(`${emp.id}_${b.leaveTypeId}`, b);
          });
        });
        this.loadingBalances = false;
      },
      error: () => { this.loadingBalances = false; }
    });
  }

  getBalance(userId: number, leaveTypeId: number): LeaveBalance | undefined {
    return this.allBalances.get(`${userId}_${leaveTypeId}`);
  }

  // ── Leave Types ──
  saveLeaveType(): void {
    if (!this.newType.name) return;
    this.savingType = true;
    this.leaveService.createLeaveType({ name: this.newType.name, description: this.newType.description, isPaid: this.newType.isPaid })
    .subscribe({
      next: () => {
        this.snackBar.open('Leave type added!', 'Close', { duration: 3000 });
        this.savingType = false;
        this.showTypeForm = false;
        this.newType = { name: '', description: '', isPaid: true };
        this.load();
      },
      error: (err: any) => {
        this.savingType = false;
        this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 3000 });
      }
    });
  }

  startEditType(t: LeaveType): void {
    this.editTypeId = t.id;
    this.editTypeName = t.name;
    this.editTypeDesc = t.description || '';
  }

  saveEditType(t: LeaveType): void {
    this.leaveService.updateLeaveType(t.id, { name: this.editTypeName, description: this.editTypeDesc, isPaid: t.isPaid ?? t.paid ?? true })
    .subscribe({
      next: () => {
        this.snackBar.open('Leave type updated!', 'Close', { duration: 2000 });
        this.editTypeId = null;
        this.load();
      },
      error: (err: any) => this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 3000 })
    });
  }

  // ── Quotas ──
  saveQuota(row: any, role: string): void {
    const days = Number(row.days[role]);
    if (isNaN(days) || days < 0) return;
    this.leaveService.upsertQuota({
      leaveTypeId: row.leaveTypeId, role, totalDays: days, year: this.currentYear
    }).subscribe({
      next: (r) => {
        if (r.data?.id) row.quotaIds[role] = r.data.id;
        this.snackBar.open(`Quota saved: ${row.leaveTypeName} → ${role}: ${days} days`, 'Close', { duration: 2000 });
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Failed to save quota', 'Close', { duration: 3000 })
    });
  }

  // ── Balances ──
  applyQuotaToAll(): void {
    this.initializing = true;
    const year = this.currentYear;
    // Call initUserBalancesFromQuota per employee (role-aware — quotas differ by role)
    const requests = this.employees.map(emp =>
      this.leaveService.initUserBalancesFromQuota(emp.id, emp.role!, year)
    );
    if (requests.length === 0) {
      this.initializing = false;
      this.snackBar.open('No employees to update.', 'Close', { duration: 2000 });
      return;
    }
    forkJoin(requests).subscribe({
      next: (results) => {
        const total = results.reduce((sum, r) => sum + (r.data || 0), 0);
        this.snackBar.open(`Applied quotas — ${total} new balance(s) created`, 'Close', { duration: 4000 });
        this.initializing = false;
        this.loadBalances();
      },
      error: (err) => {
        this.initializing = false;
        this.snackBar.open(err.error?.message || 'Failed to apply quotas', 'Close', { duration: 3000 });
      }
    });
  }

  startBalEdit(userId: number, leaveTypeId: number, current: number): void {
    this.editKey = `${userId}_${leaveTypeId}`;
    this.editVal = current;
  }

  saveBal(userId: number, leaveTypeId: number): void {
    this.leaveService.setUserBalance(userId, leaveTypeId, this.editVal, this.currentYear).subscribe({
      next: () => {
        this.snackBar.open('Balance updated!', 'Close', { duration: 2000 });
        this.editKey = null;
        this.loadBalances();
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 3000 })
    });
  }
}
