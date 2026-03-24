import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeManagementService, Announcement } from '../../../core/services/employee-management.service';

@Component({
  selector: 'app-announcement-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data?.id ? 'Edit' : 'New' }} Announcement</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" placeholder="Announcement title">
          <mat-error *ngIf="form.get('title')?.hasError('required')">Required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Content</mat-label>
          <textarea matInput formControlName="content" rows="4" placeholder="Write your announcement..."></textarea>
          <mat-error *ngIf="form.get('content')?.hasError('required')">Required</mat-error>
        </mat-form-field>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Target Audience</mat-label>
            <mat-select formControlName="targetRole">
              <mat-option value="ALL">Everyone</mat-option>
              <mat-option value="EMPLOYEE">Employees</mat-option>
              <mat-option value="MANAGER">Managers</mat-option>
              <mat-option value="ADMIN">Admins</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Expires At (optional)</mat-label>
            <input matInput formControlName="expiresAt" type="datetime-local">
          </mat-form-field>
        </div>
        <div *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid || loading">
        {{ loading ? 'Publishing...' : (data?.id ? 'Update' : 'Publish') }}
      </button>
    </mat-dialog-actions>
    <style>
      .dialog-form { display: flex; flex-direction: column; gap: 4px; min-width: 500px; padding-top: 8px; }
      .form-row { display: flex; gap: 12px; }
      .form-row mat-form-field { flex: 1; }
      .full-width { width: 100%; }
      .error-msg { color: var(--danger); font-size: 13px; background: var(--danger-bg); border-radius: var(--radius-sm); padding: 8px 12px; }
    </style>
  `
})
export class AnnouncementDialogComponent {
  private fb = inject(FormBuilder);
  private service = inject(EmployeeManagementService);
  private dialogRef = inject(MatDialogRef<AnnouncementDialogComponent>);
  data: Announcement = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    title: [this.data?.title || '', Validators.required],
    content: [this.data?.content || '', Validators.required],
    targetRole: [this.data?.targetRole || 'ALL'],
    expiresAt: [this.data?.expiresAt ? this.data.expiresAt.slice(0, 16) : '']
  });

  loading = false;
  errorMsg = '';

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    const v = this.form.value;
    const payload: Announcement = {
      title: v.title!,
      content: v.content!,
      targetRole: v.targetRole || 'ALL',
      expiresAt: v.expiresAt ? new Date(v.expiresAt).toISOString() : undefined
    };
    const call = this.data?.id
      ? this.service.updateAnnouncement(this.data.id!, payload)
      : this.service.createAnnouncement(payload);

    call.subscribe({
      next: () => this.dialogRef.close(true),
      error: err => { this.loading = false; this.errorMsg = err.error?.message || 'Failed to save announcement.'; }
    });
  }
}

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule, MatChipsModule],
  template: `
    <div class="page-wrap">
      <div class="page-header">
        <div>
          <h1>Announcements</h1>
          <p class="sub">Company-wide announcements and notices</p>
        </div>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>campaign</mat-icon> New Announcement
        </button>
      </div>

      <div *ngIf="loading" class="loading-msg">
        <mat-icon>hourglass_empty</mat-icon>
        <span>Loading announcements...</span>
      </div>

      <div *ngIf="!loading && announcements.length === 0" class="empty-state">
        <mat-icon>campaign</mat-icon>
        <p>No announcements yet.</p>
        <button mat-raised-button color="primary" (click)="openDialog()">+ New Announcement</button>
      </div>

      <div class="announcements-grid" *ngIf="!loading && announcements.length > 0">
        <div class="announcement-card" *ngFor="let a of announcements"
          [class.border-all]="a.targetRole === 'ALL'"
          [class.border-employee]="a.targetRole === 'EMPLOYEE'"
          [class.border-manager]="a.targetRole === 'MANAGER'"
          [class.border-admin]="a.targetRole === 'ADMIN'">

          <div class="card-top">
            <div class="card-meta">
              <span class="target-chip" [class]="'role-' + (a.targetRole || 'ALL').toLowerCase()">
                <mat-icon>{{ a.targetRole === 'ALL' ? 'public' : 'group' }}</mat-icon>
                {{ a.targetRole === 'ALL' ? 'Everyone' : a.targetRole }}
              </span>
              <span class="date-label">{{ a.createdAt | date:'dd MMM yyyy, HH:mm' }}</span>
            </div>
            <div class="card-actions">
              <button mat-icon-button (click)="openDialog(a)" title="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteAnnouncement(a)" title="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>

          <h3 class="card-title">{{ a.title }}</h3>
          <p class="card-content">{{ a.content }}</p>

          <div class="card-footer" *ngIf="a.expiresAt">
            <mat-icon>schedule</mat-icon>
            <span>Expires {{ a.expiresAt | date:'dd MMM yyyy' }}</span>
          </div>
        </div>
      </div>
    </div>

    <style>
      :host { display: block; padding: 24px; background: var(--bg-base); min-height: 100%; }

      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
      .page-header h1 { margin: 0; color: var(--text-1); font-size: 22px; font-weight: 700; }
      .sub { color: var(--text-3); font-size: 13px; margin: 4px 0 0; }

      .loading-msg {
        display: flex; align-items: center; justify-content: center;
        gap: 10px; padding: 40px; color: var(--text-3);
      }

      .empty-state { text-align: center; padding: 64px 24px; color: var(--text-3); }
      .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 12px; }
      .empty-state p { margin: 0 0 16px; font-size: 14px; }

      .announcements-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
        gap: 16px;
      }

      .announcement-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-left: 4px solid var(--border);
        border-radius: var(--radius);
        padding: 20px;
        box-shadow: var(--shadow);
        transition: border-color 0.2s, box-shadow 0.2s;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .announcement-card:hover { box-shadow: var(--shadow-lg); }

      .border-all { border-left-color: var(--primary); }
      .border-employee { border-left-color: var(--success); }
      .border-manager { border-left-color: var(--orange); }
      .border-admin { border-left-color: var(--danger); }

      .card-top { display: flex; justify-content: space-between; align-items: flex-start; }
      .card-meta { display: flex; flex-direction: column; gap: 4px; }
      .card-actions { display: flex; gap: 2px; margin: -8px -8px 0 0; }
      .card-actions mat-icon { font-size: 18px; color: var(--text-3); }

      .target-chip {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 3px 10px; border-radius: 12px;
        font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px;
      }
      .target-chip mat-icon { font-size: 13px; width: 13px; height: 13px; }
      .role-all { background: var(--blue-bg); color: var(--blue); }
      .role-employee { background: var(--success-bg); color: var(--success); }
      .role-manager { background: var(--orange-bg); color: var(--orange); }
      .role-admin { background: var(--danger-bg); color: var(--danger); }

      .date-label { font-size: 12px; color: var(--text-3); }

      .card-title { margin: 0; font-size: 15px; font-weight: 700; color: var(--text-1); line-height: 1.4; }
      .card-content { margin: 0; color: var(--text-2); font-size: 14px; line-height: 1.6; white-space: pre-wrap; }

      .card-footer {
        display: flex; align-items: center; gap: 6px;
        font-size: 12px; color: var(--warning);
        padding-top: 10px; border-top: 1px solid var(--border);
        margin-top: auto;
      }
      .card-footer mat-icon { font-size: 14px; width: 14px; height: 14px; }
    </style>
  `
})
export class AnnouncementsComponent implements OnInit {
  private service = inject(EmployeeManagementService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  announcements: Announcement[] = [];
  loading = true;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.service.getAnnouncements().subscribe({
      next: r => { this.announcements = r.data || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openDialog(announcement?: Announcement) {
    const ref = this.dialog.open(AnnouncementDialogComponent, { width: '560px', data: announcement || null });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open(announcement ? 'Announcement updated!' : 'Announcement published!', 'Close', { duration: 3000 });
        this.load();
      }
    });
  }

  deleteAnnouncement(a: Announcement) {
    if (!confirm(`Delete announcement "${a.title}"?`)) return;
    this.service.deleteAnnouncement(a.id!).subscribe({
      next: () => { this.snackBar.open('Announcement deleted.', 'Close', { duration: 3000 }); this.load(); },
      error: () => this.snackBar.open('Failed to delete.', 'Close', { duration: 3000 })
    });
  }
}
