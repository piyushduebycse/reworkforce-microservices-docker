import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="logo">
            <mat-icon>business</mat-icon>
            <h1>RevWorkforce</h1>
          </div>
          <p>HR Management Platform</p>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Enter your email">
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Invalid email format</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" placeholder="Enter your password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
            </mat-form-field>

            <div *ngIf="error" class="error-message">
              <mat-icon>error</mat-icon>
              {{ error }}
            </div>

            <button mat-raised-button color="primary" type="submit" class="full-width login-btn" [disabled]="loading || loginForm.invalid">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Sign In</span>
            </button>
          </form>

          <div class="demo-accounts">
            <p><strong>Demo Accounts:</strong></p>
            <p>Admin: admin&#64;revworkforce.com / Admin&#64;123</p>
            <p>Manager: manager1&#64;revworkforce.com / Manager&#64;123</p>
            <p>Employee: employee1&#64;revworkforce.com / Employee&#64;123</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #3f51b5 0%, #7c4dff 100%);
    }
    .login-card {
      width: 420px;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }
    mat-card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 24px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      mat-icon { font-size: 36px; width: 36px; height: 36px; color: #3f51b5; }
      h1 { font-size: 28px; font-weight: 700; color: #333; margin: 0; }
    }
    mat-card-header p { color: #666; margin-top: 4px; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .login-btn { height: 48px; font-size: 16px; margin-top: 8px; }
    .error-message {
      display: flex; align-items: center; gap: 8px;
      color: #c62828; background: #ffebee;
      padding: 12px; border-radius: 8px; margin-bottom: 16px;
    }
    .demo-accounts {
      margin-top: 24px; padding: 16px; background: #f5f5f5;
      border-radius: 8px; font-size: 13px;
      p { margin: 4px 0; color: #555; }
      p strong { color: #333; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  loading = false;
  error = '';
  hidePassword = true;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    if (this.authService.isLoggedIn()) {
      this.authService.navigateByRole();
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.authService.navigateByRole();
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Invalid email or password. Please try again.';
      }
    });
  }
}
