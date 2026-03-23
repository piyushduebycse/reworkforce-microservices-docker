import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="unauthorized-container">
      <mat-icon>lock</mat-icon>
      <h1>Access Denied</h1>
      <p>You don't have permission to view this page.</p>
      <button mat-raised-button color="primary" (click)="goBack()">Go to Dashboard</button>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100vh; text-align: center;
      mat-icon { font-size: 80px; width: 80px; height: 80px; color: #e53935; }
      h1 { font-size: 36px; margin: 16px 0 8px; }
      p { color: #666; margin-bottom: 24px; }
    }
  `]
})
export class UnauthorizedComponent {
  private authService = inject(AuthService);
  goBack(): void { this.authService.navigateByRole(); }
}
