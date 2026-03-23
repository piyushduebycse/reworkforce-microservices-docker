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
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Content</mat-label>
          <textarea matInput formControlName="content" rows="4" placeholder="Write your announcement..."></textarea>
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
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid || loading">
        {{ loading ? 'Publishing...' : (data?.id ? 'Update' : 'Publish') }}
      </button>
    </mat-dialog-actions>
    <style>
      .dialog-form { display: flex; flex-direction: column; gap: 4px; min-width: 500px; padding-top: 8px; }
      .form-row { display: flex; gap: 12px; }
      .form-row mat-form-field { flex: 1; }
      .full-width { width: 100%; }
      .error-msg { color: #f44336; font-size: 13px; }
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
    <div class="page-header">
      <h1>Announcements</h1>
      <button mat-raised-button color="primary" (click)="openDialog()">
        <mat-icon>campaign</mat-icon> New Announcement
      </button>
    </div>

    <div *ngIf="loading" class="loading-msg">Loading announcements...</div>

    <div *ngIf="!loading && announcements.length === 0" class="empty-card">
      <mat-card>
        <mat-card-content class="empty-msg">
          No announcements yet. Click "New Announcement" to create one.
        </mat-card-content>
      </mat-card>
    </div>

    <div class="announcements-grid" *ngIf="!loading && announcements.length > 0">
      <mat-card *ngFor="let a of announcements" class="announcement-card">
        <mat-card-header>
          <mat-card-title>{{ a.title }}</mat-card-title>
          <mat-card-subtitle>
            <span class="target-chip" [class]="'role-' + (a.targetRole || 'ALL').toLowerCase()">
              {{ a.targetRole === 'ALL' ? 'Everyone' : a.targetRole }}
            </span>
            <span class="date-label">{{ a.createdAt | date:'dd MMM yyyy, HH:mm' }}</span>
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p class="announcement-content">{{ a.content }}</p>
          <p class="expires-label" *ngIf="a.expiresAt">
            Expires: {{ a.expiresAt | date:'dd MMM yyyy' }}
          </p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-icon-button color="primary" (click)="openDialog(a)" title="Edit">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button color="warn" (click)="deleteAnnouncement(a)" title="Delete">
            <mat-icon>delete</mat-icon>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>

    <style>
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .loading-msg, .empty-msg { padding: 24px; text-align: center; color: #666; }
      .announcements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
      .announcement-card { border-left: 4px solid #1976d2; }
      .announcement-content { color: #444; line-height: 1.6; white-space: pre-wrap; }
      .expires-label { font-size: 12px; color: #e65100; margin-top: 8px; }
      .date-label { font-size: 12px; color: #888; margin-left: 8px; }
      .target-chip { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
      .role-all { background: #e3f2fd; color: #1565c0; }
      .role-employee { background: #e8f5e9; color: #2e7d32; }
      .role-manager { background: #fff3e0; color: #e65100; }
      .role-admin { background: #fce4ec; color: #c62828; }
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
