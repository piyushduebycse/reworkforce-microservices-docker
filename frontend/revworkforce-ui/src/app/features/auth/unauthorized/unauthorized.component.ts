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
      <div class="lock-circle">
        <mat-icon>lock</mat-icon>
      </div>
      <h1>Access Denied</h1>
      <p class="subtitle">You don't have permission to view this page.</p>
      <p class="hint">If you believe this is an error, please contact your administrator.</p>
      <button class="go-back-btn" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        Go to Dashboard
      </button>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 24px;
      background: var(--bg-base);
    }
    .lock-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: var(--danger-bg);
      border: 2px solid var(--danger);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 28px;
    }
    .lock-circle mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--danger);
    }
    h1 {
      font-size: 36px;
      font-weight: 800;
      color: var(--text-1);
      margin: 0 0 12px;
    }
    .subtitle {
      font-size: 16px;
      color: var(--text-2);
      margin: 0 0 8px;
    }
    .hint {
      font-size: 13px;
      color: var(--text-3);
      margin: 0 0 32px;
    }
    .go-back-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s, box-shadow 0.15s;
    }
    .go-back-btn:hover {
      opacity: 0.88;
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
    .go-back-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class UnauthorizedComponent {
  private authService = inject(AuthService);
  goBack(): void { this.authService.navigateByRole(); }
}
