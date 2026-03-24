import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatChipsModule, MatDividerModule],
  template: `
    <div class="page-header">
      <h1>My Profile</h1>
      <p>Manage your personal information</p>
    </div>

    <div class="profile-layout">
      <!-- Profile Card -->
      <div class="profile-card dark-card">
        <!-- Avatar + identity -->
        <div class="avatar-section">
          <div class="avatar av-{{ profile?.role?.toLowerCase() }}">{{ initials }}</div>
          <div class="profile-meta">
            <h2>{{ profile?.firstName }} {{ profile?.lastName }}</h2>
            <span class="role-badge role-{{ profile?.role?.toLowerCase() }}">{{ profile?.role }}</span>
            <p class="emp-id">{{ profile?.employeeId }}</p>
            <p class="email">{{ profile?.email }}</p>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Info items -->
        <div class="info-grid">
          <div class="info-item">
            <mat-icon class="info-icon">phone</mat-icon>
            <div>
              <span class="info-label">Phone</span>
              <span class="info-value">{{ profile?.phoneNumber || 'Not set' }}</span>
            </div>
          </div>
          <div class="info-item">
            <mat-icon class="info-icon">calendar_today</mat-icon>
            <div>
              <span class="info-label">Joined</span>
              <span class="info-value">{{ profile?.createdAt | date:'mediumDate' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div class="form-card dark-card">
        <div class="form-card-header">
          <mat-icon class="form-header-icon">edit</mat-icon>
          <h3>Edit Profile</h3>
        </div>
        <div class="divider"></div>
        <form [formGroup]="form" (ngSubmit)="save()" class="edit-form">
          <div class="form-row">
            <mat-form-field appearance="outline" class="dark-field">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName">
              <mat-error *ngIf="form.get('firstName')?.hasError('required')">Required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="dark-field">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName">
              <mat-error *ngIf="form.get('lastName')?.hasError('required')">Required</mat-error>
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full-width dark-field">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phoneNumber" placeholder="+91 9000000000">
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width dark-field">
            <mat-label>Email (read-only)</mat-label>
            <input matInput [value]="profile?.email || ''" readonly>
          </mat-form-field>
          <div *ngIf="errorMsg" class="error-msg">
            <mat-icon>error_outline</mat-icon>
            {{ errorMsg }}
          </div>
          <div class="form-actions">
            <button mat-raised-button class="save-btn" type="submit" [disabled]="form.invalid || saving">
              <mat-icon>{{ saving ? 'hourglass_empty' : 'save' }}</mat-icon>
              {{ saving ? 'Saving…' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <style>
      .profile-layout {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 24px;
        align-items: start;
      }
      @media (max-width: 768px) {
        .profile-layout { grid-template-columns: 1fr; }
      }
      .dark-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 24px;
        box-shadow: var(--shadow);
      }
      .avatar-section {
        display: flex;
        gap: 18px;
        align-items: flex-start;
        margin-bottom: 20px;
      }
      .avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        font-weight: 700;
        color: #fff;
        flex-shrink: 0;
      }
      .av-employee { background: linear-gradient(135deg, var(--primary), #6366f1); }
      .av-manager  { background: linear-gradient(135deg, var(--warning), var(--orange)); }
      .av-admin    { background: linear-gradient(135deg, var(--danger), #f43f5e); }
      .profile-meta h2 {
        margin: 0 0 6px;
        font-size: 18px;
        font-weight: 700;
        color: var(--text-1);
      }
      .role-badge {
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        display: inline-block;
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }
      .role-employee { background: var(--success-bg); color: var(--success); }
      .role-manager  { background: var(--warning-bg); color: var(--warning); }
      .role-admin    { background: var(--danger-bg);  color: var(--danger); }
      .emp-id {
        font-family: monospace;
        color: var(--text-3);
        font-size: 12px;
        margin: 6px 0 2px;
      }
      .email {
        color: var(--text-2);
        font-size: 13px;
        margin: 0;
      }
      .divider {
        height: 1px;
        background: var(--border);
        margin: 16px 0;
      }
      .info-grid {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .info-item {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }
      .info-icon {
        color: var(--primary);
        margin-top: 2px;
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
      .info-label {
        display: block;
        font-size: 10px;
        color: var(--text-3);
        text-transform: uppercase;
        letter-spacing: 0.6px;
        margin-bottom: 2px;
      }
      .info-value {
        display: block;
        font-size: 14px;
        color: var(--text-1);
      }
      .form-card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 4px;
      }
      .form-header-icon {
        color: var(--primary);
      }
      .form-card-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-1);
      }
      .edit-form {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .form-row {
        display: flex;
        gap: 12px;
      }
      .form-row mat-form-field { flex: 1; }
      .full-width { width: 100%; }
      .error-msg {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--danger);
        font-size: 13px;
        padding: 8px 12px;
        background: var(--danger-bg);
        border-radius: var(--radius-sm);
      }
      .error-msg mat-icon { font-size: 16px; width: 16px; height: 16px; }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 12px;
      }
      .save-btn {
        background: var(--primary) !important;
        color: #fff !important;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .save-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    </style>
  `
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  profile: any = null;
  saving = false;
  errorMsg = '';

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: ['']
  });

  get initials(): string {
    if (!this.profile) return '?';
    return `${this.profile.firstName?.[0] || ''}${this.profile.lastName?.[0] || ''}`.toUpperCase();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.userService.getMyProfile().subscribe({
      next: r => {
        this.profile = r.data;
        this.form.patchValue({
          firstName: r.data.firstName,
          lastName: r.data.lastName,
          phoneNumber: (r.data as any).phoneNumber || ''
        });
      },
      error: () => {
        const current = this.authService.getCurrentUser();
        if (current) {
          this.profile = current;
          this.form.patchValue({ firstName: current.firstName, lastName: current.lastName });
        }
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMsg = '';
    this.userService.updateMyProfile(this.form.value as any).subscribe({
      next: r => {
        this.saving = false;
        this.profile = r.data;
        this.snackBar.open('Profile updated!', 'Close', { duration: 3000 });
      },
      error: err => {
        this.saving = false;
        this.errorMsg = err.error?.message || 'Failed to update profile.';
      }
    });
  }
}
