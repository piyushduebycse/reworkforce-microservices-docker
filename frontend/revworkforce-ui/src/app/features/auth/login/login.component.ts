import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="login-page">
      <!-- Left: Branding panel -->
      <div class="login-left">
        <div class="left-content">
          <div class="left-logo">
            <mat-icon>hub</mat-icon>
          </div>
          <h1 class="left-title">RevWorkforce</h1>
          <p class="left-subtitle">Modern HR management for modern teams</p>
          <div class="left-features">
            <div class="feature-item" *ngFor="let f of features">
              <div class="feature-dot"></div>
              <span>{{ f }}</span>
            </div>
          </div>
        </div>
        <div class="left-glow"></div>
      </div>

      <!-- Right: Login form -->
      <div class="login-right">
        <div class="login-box">
          <div class="login-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <div class="field-group">
              <label class="field-label">Email address</label>
              <div class="input-wrap" [class.input-error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                <mat-icon class="input-icon">alternate_email</mat-icon>
                <input formControlName="email" type="email" placeholder="you@revworkforce.com" class="login-input">
              </div>
              <span class="field-error" *ngIf="loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched">Email is required</span>
              <span class="field-error" *ngIf="loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched">Enter a valid email</span>
            </div>

            <div class="field-group">
              <label class="field-label">Password</label>
              <div class="input-wrap" [class.input-error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                <mat-icon class="input-icon">lock_outline</mat-icon>
                <input formControlName="password" [type]="showPass ? 'text' : 'password'" placeholder="Enter your password" class="login-input">
                <button type="button" class="pass-toggle" (click)="showPass = !showPass">
                  <mat-icon>{{ showPass ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              <span class="field-error" *ngIf="loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched">Password is required</span>
            </div>

            <div class="login-error" *ngIf="error">
              <mat-icon>error_outline</mat-icon>
              <span>{{ error }}</span>
            </div>

            <button type="submit" class="login-btn" [disabled]="loading || loginForm.invalid">
              <mat-spinner *ngIf="loading" diameter="18" style="margin-right:8px"></mat-spinner>
              <span>{{ loading ? 'Signing in...' : 'Sign in' }}</span>
              <mat-icon *ngIf="!loading" style="font-size:18px;margin-left:4px">arrow_forward</mat-icon>
            </button>
          </form>

          <div class="demo-panel">
            <div class="demo-title">
              <div class="demo-line"></div>
              <span>Demo accounts</span>
              <div class="demo-line"></div>
            </div>
            <div class="demo-accounts">
              <div class="demo-account" *ngFor="let d of demoAccounts" (click)="fillDemo(d)">
                <div class="demo-role-badge" [class]="'dr-' + d.role.toLowerCase()">{{ d.role }}</div>
                <div class="demo-creds">
                  <span class="demo-email">{{ d.email }}</span>
                  <span class="demo-pass">{{ d.pass }}</span>
                </div>
                <mat-icon class="demo-fill-icon">content_paste</mat-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh; display: flex;
      background: var(--bg-base); font-family: 'Inter', sans-serif;
    }
    /* Left panel */
    .login-left {
      flex: 1; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0d1433 0%, #0a0f20 50%, #12072a 100%);
      position: relative; overflow: hidden; min-height: 100vh;
      padding: 40px;
    }
    .left-glow {
      position: absolute; width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%);
      top: 50%; left: 50%; transform: translate(-50%, -50%);
      pointer-events: none;
    }
    .left-content { position: relative; z-index: 1; max-width: 400px; }
    .left-logo {
      width: 64px; height: 64px; border-radius: 18px;
      background: linear-gradient(135deg, var(--primary), var(--primary-h));
      display: flex; align-items: center; justify-content: center; margin-bottom: 28px;
      box-shadow: 0 8px 32px var(--primary-glow);
    }
    .left-logo mat-icon { font-size: 34px; color: #fff; }
    .left-title { font-size: 36px; font-weight: 800; color: #fff; margin-bottom: 12px; letter-spacing: -0.5px; }
    .left-subtitle { font-size: 16px; color: rgba(255,255,255,0.5); margin-bottom: 40px; line-height: 1.6; }
    .left-features { display: flex; flex-direction: column; gap: 14px; }
    .feature-item { display: flex; align-items: center; gap: 12px; color: rgba(255,255,255,0.7); font-size: 14px; }
    .feature-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--primary); flex-shrink: 0; box-shadow: 0 0 8px var(--primary); }

    /* Right panel */
    .login-right {
      width: 480px; display: flex; align-items: center; justify-content: center;
      padding: 40px 32px; background: var(--bg-base);
    }
    .login-box { width: 100%; max-width: 400px; }
    .login-header { margin-bottom: 32px; }
    .login-header h2 { font-size: 26px; font-weight: 700; color: var(--text-1); margin-bottom: 6px; }
    .login-header p { color: var(--text-3); font-size: 14px; }

    /* Form */
    .login-form { display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px; }
    .field-group { display: flex; flex-direction: column; gap: 7px; }
    .field-label { font-size: 13px; font-weight: 600; color: var(--text-2); }
    .input-wrap {
      display: flex; align-items: center; gap: 10px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-sm); padding: 0 14px; height: 46px;
      transition: border-color 0.15s;
    }
    .input-wrap:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
    .input-wrap.input-error { border-color: var(--danger); }
    .input-icon { font-size: 18px; color: var(--text-3); flex-shrink: 0; }
    .login-input {
      flex: 1; background: transparent; border: none; outline: none;
      color: var(--text-1); font-size: 14px; font-family: 'Inter', sans-serif;
    }
    .login-input::placeholder { color: var(--text-3); }
    .pass-toggle {
      background: transparent; border: none; cursor: pointer;
      color: var(--text-3); display: flex; align-items: center; padding: 0;
      transition: color 0.15s;
    }
    .pass-toggle:hover { color: var(--text-1); }
    .field-error { font-size: 12px; color: var(--danger); }

    /* Error box */
    .login-error {
      display: flex; align-items: center; gap: 8px;
      background: var(--danger-bg); border: 1px solid rgba(248,113,113,0.2);
      border-radius: var(--radius-sm); padding: 10px 14px;
      color: var(--danger); font-size: 13px;
    }
    .login-error mat-icon { font-size: 18px; flex-shrink: 0; }

    /* Submit button */
    .login-btn {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      height: 48px; border: none; border-radius: var(--radius-sm); cursor: pointer;
      background: linear-gradient(135deg, var(--primary), var(--primary-h));
      color: #fff; font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif;
      transition: opacity 0.15s, transform 0.15s;
      box-shadow: 0 4px 20px var(--primary-glow);
    }
    .login-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
    .login-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

    /* Demo panel */
    .demo-title {
      display: flex; align-items: center; gap: 12px; margin-bottom: 14px;
      color: var(--text-3); font-size: 12px;
    }
    .demo-line { flex: 1; height: 1px; background: var(--border); }
    .demo-accounts { display: flex; flex-direction: column; gap: 6px; }
    .demo-account {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: var(--radius-sm);
      background: var(--bg-card); border: 1px solid var(--border);
      cursor: pointer; transition: border-color 0.15s;
    }
    .demo-account:hover { border-color: var(--border-a); }
    .demo-role-badge {
      font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 20px;
      text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0;
    }
    .dr-admin    { background: var(--danger-bg);  color: var(--danger); }
    .dr-manager  { background: var(--warning-bg); color: var(--warning); }
    .dr-employee { background: var(--success-bg); color: var(--success); }
    .demo-creds { flex: 1; }
    .demo-email { display: block; font-size: 12px; color: var(--text-2); }
    .demo-pass  { display: block; font-size: 11px; color: var(--text-3); }
    .demo-fill-icon { font-size: 16px; color: var(--text-3); }

    @media (max-width: 900px) {
      .login-left { display: none; }
      .login-right { width: 100%; padding: 32px 20px; }
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
  showPass = false;

  features = [
    'Leave management & approvals',
    'Performance reviews & goals',
    'Employee directory & profiles',
    'HR analytics dashboard',
    'In-app notifications'
  ];

  demoAccounts = [
    { role: 'ADMIN',    email: 'admin@revworkforce.com',     pass: 'Admin@123' },
    { role: 'MANAGER',  email: 'manager1@revworkforce.com',  pass: 'Manager@123' },
    { role: 'EMPLOYEE', email: 'employee1@revworkforce.com', pass: 'Employee@123' },
  ];

  constructor() {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    if (this.authService.isLoggedIn()) this.authService.navigateByRole();
  }

  fillDemo(d: { email: string; pass: string }): void {
    this.loginForm.patchValue({ email: d.email, password: d.pass });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    this.authService.login(this.loginForm.value).subscribe({
      next: (r) => { this.loading = false; if (r.success) this.authService.navigateByRole(); },
      error: (err) => { this.loading = false; this.error = err.error?.message || 'Invalid credentials. Please try again.'; }
    });
  }
}
