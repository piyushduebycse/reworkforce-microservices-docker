import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-department-management',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `<div class="page-header"><h1>Department Management</h1></div><mat-card><mat-card-content><p>Department management interface coming soon.</p></mat-card-content></mat-card>`
})
export class DepartmentManagementComponent {}
