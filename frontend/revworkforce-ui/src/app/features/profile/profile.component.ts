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
      <mat-card class="profile-card">
        <mat-card-content>
          <div class="avatar-section">
            <div class="avatar">{{ initials }}</div>
            <div class="profile-meta">
              <h2>{{ profile?.firstName }} {{ profile?.lastName }}</h2>
              <span class="role-badge role-{{ profile?.role?.toLowerCase() }}">{{ profile?.role }}</span>
              <p class="emp-id">{{ profile?.employeeId }}</p>
              <p class="email">{{ profile?.email }}</p>
            </div>
          </div>

          <mat-divider class="divider"></mat-divider>

          <div class="info-grid">
            <div class="info-item">
              <mat-icon>phone</mat-icon>
              <div>
                <span class="info-label">Phone</span>
                <span class="info-value">{{ profile?.phoneNumber || 'Not set' }}</span>
              </div>
            </div>
            <div class="info-item">
              <mat-icon>calendar_today</mat-icon>
              <div>
                <span class="info-label">Joined</span>
                <span class="info-value">{{ profile?.createdAt | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Edit Form -->
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>Edit Profile</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="save()" class="edit-form">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName">
                <mat-error *ngIf="form.get('firstName')?.hasError('required')">Required</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName">
                <mat-error *ngIf="form.get('lastName')?.hasError('required')">Required</mat-error>
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phoneNumber" placeholder="+91 9000000000">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email (read-only)</mat-label>
              <input matInput [value]="profile?.email || ''" readonly>
            </mat-form-field>
            <div *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</div>
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving">
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>

    <style>
      .page-header { margin-bottom: 24px; }
      .page-header h1 { margin: 0; }
      .page-header p { color: #666; margin: 4px 0 0; }
      .profile-layout { display: grid; grid-template-columns: 340px 1fr; gap: 24px; }
      @media (max-width: 768px) { .profile-layout { grid-template-columns: 1fr; } }
      .avatar-section { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 16px; }
      .avatar { width: 72px; height: 72px; border-radius: 50%; background: #3f51b5; color: white;
        display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 600; flex-shrink: 0; }
      .profile-meta h2 { margin: 0 0 6px; }
      .emp-id { font-family: monospace; color: #666; font-size: 13px; margin: 4px 0; }
      .email { color: #555; font-size: 14px; margin: 2px 0; }
      .role-badge { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-block; }
      .role-employee { background: #e8f5e9; color: #2e7d32; }
      .role-manager { background: #fff3e0; color: #e65100; }
      .role-admin { background: #fce4ec; color: #c62828; }
      .divider { margin: 16px 0; }
      .info-grid { display: flex; flex-direction: column; gap: 12px; }
      .info-item { display: flex; gap: 12px; align-items: flex-start; }
      .info-item mat-icon { color: #3f51b5; margin-top: 2px; }
      .info-label { display: block; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
      .info-value { display: block; font-size: 14px; color: #333; }
      .edit-form { display: flex; flex-direction: column; gap: 4px; }
      .form-row { display: flex; gap: 12px; }
      .form-row mat-form-field { flex: 1; }
      .full-width { width: 100%; }
      .form-actions { display: flex; justify-content: flex-end; margin-top: 8px; }
      .error-msg { color: #f44336; font-size: 13px; padding: 4px 0; }
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
