import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatButtonModule, MatChipsModule, MatProgressSpinnerModule],
  template: `
    <div class="page-header">
      <h1>Employee Directory</h1>
      <p>{{ filtered.length }} of {{ employees.length }} employees</p>
    </div>

    <div class="search-bar">
      <div class="search-input-wrap">
        <mat-icon class="search-icon">search</mat-icon>
        <input class="search-input" [(ngModel)]="searchQuery" (ngModelChange)="filterEmployees()"
          placeholder="Search by name, email, or ID…">
        <button *ngIf="searchQuery" class="clear-btn" (click)="searchQuery=''; filterEmployees()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="role-filters">
        <span class="filter-chip" [class.active]="roleFilter === ''" (click)="setRole('')">All</span>
        <span class="filter-chip employee" [class.active]="roleFilter === 'EMPLOYEE'" (click)="setRole('EMPLOYEE')">Employees</span>
        <span class="filter-chip manager" [class.active]="roleFilter === 'MANAGER'" (click)="setRole('MANAGER')">Managers</span>
        <span class="filter-chip admin" [class.active]="roleFilter === 'ADMIN'" (click)="setRole('ADMIN')">Admins</span>
      </div>
    </div>

    <div *ngIf="loading" class="loading-state">
      <mat-spinner diameter="40"></mat-spinner>
    </div>

    <div *ngIf="!loading" class="employee-grid card-grid">
      <mat-card *ngFor="let emp of filtered" class="emp-card" [class.inactive]="!(emp.isActive || emp.active)">
        <mat-card-content>
          <div class="emp-avatar" [class]="'av-' + (emp.role || '').toLowerCase()">{{ getInitials(emp) }}</div>
          <div class="emp-name">{{ emp.firstName }} {{ emp.lastName }}</div>
          <div class="emp-role-badge role-{{ (emp.role||'').toLowerCase() }}">{{ emp.role }}</div>
          <div class="emp-email">
            <mat-icon>email</mat-icon>
            <span>{{ emp.email }}</span>
          </div>
          <div class="emp-id">{{ emp.employeeId }}</div>
          <div class="emp-phone" *ngIf="emp.phoneNumber">
            <mat-icon>phone</mat-icon>
            <span>{{ emp.phoneNumber }}</span>
          </div>
          <span *ngIf="!(emp.isActive || emp.active)" class="inactive-badge">Inactive</span>
        </mat-card-content>
      </mat-card>
    </div>

    <div *ngIf="!loading && filtered.length === 0" class="empty-state">
      <mat-icon>people_outline</mat-icon>
      <p>No employees found matching your search.</p>
    </div>

    <style>
      .search-bar {
        display: flex;
        gap: 16px;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
      }
      .search-input-wrap {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 260px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 0 12px;
        gap: 8px;
        transition: border-color 0.15s;
      }
      .search-input-wrap:focus-within {
        border-color: var(--primary);
        box-shadow: 0 0 0 2px var(--primary-glow);
      }
      .search-icon {
        color: var(--text-3);
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
      .search-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text-1);
        font-size: 14px;
        padding: 10px 0;
      }
      .search-input::placeholder { color: var(--text-3); }
      .clear-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-3);
        display: flex;
        align-items: center;
        padding: 0;
        transition: color 0.15s;
      }
      .clear-btn:hover { color: var(--text-1); }
      .role-filters {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }
      .filter-chip {
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid var(--border);
        background: var(--bg-surface);
        color: var(--text-2);
        transition: all 0.15s;
        user-select: none;
      }
      .filter-chip:hover {
        background: var(--bg-elevated);
        color: var(--text-1);
      }
      .filter-chip.active {
        background: var(--primary-glow);
        border-color: var(--primary);
        color: var(--primary);
      }
      .filter-chip.employee.active {
        background: var(--success-bg);
        border-color: var(--success);
        color: var(--success);
      }
      .filter-chip.manager.active {
        background: var(--warning-bg);
        border-color: var(--warning);
        color: var(--warning);
      }
      .filter-chip.admin.active {
        background: var(--danger-bg);
        border-color: var(--danger);
        color: var(--danger);
      }
      .loading-state {
        display: flex;
        justify-content: center;
        padding: 48px;
      }
      .employee-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 16px;
      }
      .emp-card {
        background: var(--bg-card) !important;
        border: 1px solid var(--border) !important;
        border-radius: var(--radius) !important;
        box-shadow: var(--shadow) !important;
        transition: box-shadow 0.2s, transform 0.2s;
        position: relative;
        overflow: visible;
      }
      .emp-card:hover {
        box-shadow: var(--shadow-lg) !important;
        transform: translateY(-2px);
      }
      .emp-card.inactive { opacity: 0.5; }
      .emp-card mat-card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 20px 16px 16px !important;
        gap: 6px;
      }
      .emp-avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 700;
        color: #fff;
        margin-bottom: 4px;
        flex-shrink: 0;
      }
      .av-employee { background: linear-gradient(135deg, var(--primary), #6366f1); }
      .av-manager  { background: linear-gradient(135deg, var(--warning), var(--orange)); }
      .av-admin    { background: linear-gradient(135deg, var(--danger), #f43f5e); }
      .emp-name {
        font-size: 15px;
        font-weight: 600;
        color: var(--text-1);
      }
      .emp-role-badge {
        padding: 2px 10px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.4px;
        text-transform: uppercase;
      }
      .role-employee { background: var(--success-bg); color: var(--success); }
      .role-manager  { background: var(--warning-bg); color: var(--warning); }
      .role-admin    { background: var(--danger-bg);  color: var(--danger); }
      .emp-email, .emp-phone {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        color: var(--text-3);
        max-width: 100%;
      }
      .emp-email mat-icon, .emp-phone mat-icon {
        font-size: 13px;
        width: 13px;
        height: 13px;
        flex-shrink: 0;
      }
      .emp-email span, .emp-phone span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .emp-id {
        font-family: monospace;
        font-size: 11px;
        color: var(--text-3);
      }
      .inactive-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background: var(--danger);
        color: #fff;
        font-size: 9px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
        letter-spacing: 0.3px;
      }
      .empty-state {
        text-align: center;
        padding: 48px;
        color: var(--text-3);
      }
      .empty-state mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        display: block;
        margin: 0 auto 12px;
      }
    </style>
  `
})
export class DirectoryComponent implements OnInit {
  private userService = inject(UserService);

  employees: User[] = [];
  filtered: User[] = [];
  searchQuery = '';
  roleFilter = '';
  loading = true;

  ngOnInit(): void {
    this.userService.getDirectory().subscribe({
      next: r => {
        this.employees = r.data || [];
        this.filtered = [...this.employees];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getInitials(emp: User): string {
    return `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();
  }

  setRole(role: string): void {
    this.roleFilter = role;
    this.filterEmployees();
  }

  filterEmployees(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filtered = this.employees.filter(emp => {
      const matchesSearch = !q ||
        emp.firstName?.toLowerCase().includes(q) ||
        emp.lastName?.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q) ||
        emp.employeeId?.toLowerCase().includes(q);
      const matchesRole = !this.roleFilter || emp.role === this.roleFilter;
      return matchesSearch && matchesRole;
    });
  }
}
