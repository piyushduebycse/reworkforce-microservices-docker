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
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search by name, email, or ID</mat-label>
        <input matInput [(ngModel)]="searchQuery" (ngModelChange)="filterEmployees()" placeholder="Type to search...">
        <mat-icon matPrefix>search</mat-icon>
        <button *ngIf="searchQuery" mat-icon-button matSuffix (click)="searchQuery=''; filterEmployees()">
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>

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

    <div *ngIf="!loading" class="employee-grid">
      <mat-card *ngFor="let emp of filtered" class="emp-card" [class.inactive]="!(emp.isActive || emp.active)">
        <mat-card-content>
          <div class="card-top">
            <div class="avatar" [class]="'avatar-' + emp.role?.toLowerCase()">
              {{ getInitials(emp) }}
            </div>
            <div class="emp-info">
              <strong>{{ emp.firstName }} {{ emp.lastName }}</strong>
              <span class="emp-id">{{ emp.employeeId }}</span>
              <span class="role-badge role-{{ emp.role?.toLowerCase() }}">{{ emp.role }}</span>
            </div>
            <span *ngIf="!(emp.isActive || emp.active)" class="inactive-badge">Inactive</span>
          </div>
          <div class="contact-info">
            <div class="contact-item">
              <mat-icon>email</mat-icon>
              <span>{{ emp.email }}</span>
            </div>
            <div class="contact-item" *ngIf="emp.phoneNumber">
              <mat-icon>phone</mat-icon>
              <span>{{ emp.phoneNumber }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div *ngIf="!loading && filtered.length === 0" class="empty-state">
      <mat-icon>people_outline</mat-icon>
      <p>No employees found matching your search.</p>
    </div>

    <style>
      .page-header { margin-bottom: 24px; }
      .page-header h1 { margin: 0; }
      .page-header p { color: #666; margin: 4px 0 0; }
      .search-bar { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; }
      .search-field { flex: 1; min-width: 280px; }
      .role-filters { display: flex; gap: 8px; align-items: center; padding-top: 8px; flex-wrap: wrap; }
      .filter-chip { padding: 6px 14px; border-radius: 16px; font-size: 13px; font-weight: 500;
        cursor: pointer; border: 1px solid #ddd; background: #f5f5f5; transition: all 0.2s; }
      .filter-chip:hover { background: #e0e0e0; }
      .filter-chip.active { background: #3f51b5; color: white; border-color: #3f51b5; }
      .filter-chip.employee.active { background: #2e7d32; border-color: #2e7d32; }
      .filter-chip.manager.active { background: #e65100; border-color: #e65100; }
      .filter-chip.admin.active { background: #c62828; border-color: #c62828; }
      .loading-state { display: flex; justify-content: center; padding: 48px; }
      .employee-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
      .emp-card { transition: box-shadow 0.2s; }
      .emp-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
      .emp-card.inactive { opacity: 0.6; }
      .card-top { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; position: relative; }
      .avatar { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center;
        justify-content: center; font-size: 18px; font-weight: 600; color: white; flex-shrink: 0; }
      .avatar-employee { background: #3f51b5; }
      .avatar-manager { background: #e65100; }
      .avatar-admin { background: #c62828; }
      .emp-info { flex: 1; display: flex; flex-direction: column; gap: 3px; }
      .emp-info strong { font-size: 15px; color: #222; }
      .emp-id { font-family: monospace; font-size: 11px; color: #888; }
      .role-badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; display: inline-block; width: fit-content; }
      .role-employee { background: #e8f5e9; color: #2e7d32; }
      .role-manager { background: #fff3e0; color: #e65100; }
      .role-admin { background: #fce4ec; color: #c62828; }
      .inactive-badge { position: absolute; top: 0; right: 0; background: #f44336; color: white;
        font-size: 10px; padding: 2px 6px; border-radius: 4px; }
      .contact-info { display: flex; flex-direction: column; gap: 6px; border-top: 1px solid #f0f0f0; padding-top: 10px; }
      .contact-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #555; }
      .contact-item mat-icon { font-size: 16px; width: 16px; height: 16px; color: #888; }
      .empty-state { text-align: center; padding: 48px; color: #999; }
      .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 12px; }
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
