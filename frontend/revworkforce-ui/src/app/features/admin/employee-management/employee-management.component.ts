import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-header"><h1>Employee Management</h1></div>
    <mat-card>
      <table mat-table [dataSource]="employees" class="full-width">
        <ng-container matColumnDef="employeeId">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let e">{{ e.employeeId }}</td>
        </ng-container>
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let e">{{ e.firstName }} {{ e.lastName }}</td>
        </ng-container>
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let e">{{ e.email }}</td>
        </ng-container>
        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef>Role</th>
          <td mat-cell *matCellDef="let e">{{ e.role }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let e">
            <span class="status-badge" [class]="e.isActive ? 'approved' : 'rejected'">{{ e.isActive ? 'Active' : 'Inactive' }}</span>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      </table>
    </mat-card>
  `
})
export class EmployeeManagementComponent implements OnInit {
  private userService = inject(UserService);
  employees: any[] = [];
  columns = ['employeeId', 'name', 'email', 'role', 'status'];
  ngOnInit(): void { this.userService.getAllUsers().subscribe({ next: r => this.employees = r.data?.content || r.data || [], error: () => {} }); }
}
