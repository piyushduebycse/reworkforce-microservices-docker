import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-header">
      <h1>HR Dashboard</h1>
      <p>Company-wide HR metrics and management</p>
    </div>

    <div class="card-grid">
      <mat-card class="stat-card" routerLink="/admin/employees" style="cursor:pointer">
        <mat-card-content>
          <mat-icon class="icon">people</mat-icon>
          <div><div class="value">-</div><div class="label">Total Employees</div></div>
        </mat-card-content>
      </mat-card>
      <mat-card class="stat-card">
        <mat-card-content>
          <mat-icon class="icon">event_busy</mat-icon>
          <div><div class="value">-</div><div class="label">On Leave Today</div></div>
        </mat-card-content>
      </mat-card>
      <mat-card class="stat-card">
        <mat-card-content>
          <mat-icon class="icon">pending_actions</mat-icon>
          <div><div class="value">-</div><div class="label">Pending Approvals</div></div>
        </mat-card-content>
      </mat-card>
      <mat-card class="stat-card">
        <mat-card-content>
          <mat-icon class="icon">flag</mat-icon>
          <div><div class="value">-</div><div class="label">Open Goals</div></div>
        </mat-card-content>
      </mat-card>
    </div>

    <h2>Quick Actions</h2>
    <div class="quick-actions">
      <button mat-raised-button color="primary" routerLink="/admin/employees">
        <mat-icon>person_add</mat-icon> Add Employee
      </button>
      <button mat-raised-button color="accent" routerLink="/admin/departments">
        <mat-icon>apartment</mat-icon> Manage Departments
      </button>
      <button mat-raised-button routerLink="/admin/announcements">
        <mat-icon>campaign</mat-icon> Post Announcement
      </button>
    </div>
  `,
  styles: [`
    h2 { margin: 24px 0 16px; }
    .quick-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .quick-actions button { display: flex; gap: 8px; }
  `]
})
export class AdminDashboardComponent {}
