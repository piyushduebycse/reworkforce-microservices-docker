import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PerformanceService } from '../../../core/services/performance.service';
import { AuthService } from '../../../core/services/auth.service';
import { Goal } from '../../../core/models/performance.model';

@Component({
  selector: 'app-goal-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatProgressBarModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <div>
        <h1>{{ isManagerOrAdmin ? 'Team Goals' : 'My Goals' }}</h1>
        <p>{{ goals.length }} active goal{{ goals.length !== 1 ? 's' : '' }}</p>
      </div>
      <button mat-raised-button color="primary" (click)="showForm = !showForm">
        <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
        {{ showForm ? 'Cancel' : 'New Goal' }}
      </button>
    </div>

    <!-- Create Goal Form -->
    <mat-card *ngIf="showForm" class="form-card">
      <mat-card-content>
        <h3 style="margin-top:0">Create New Goal</h3>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Goal Title *</mat-label>
          <input matInput [(ngModel)]="newGoal.title" placeholder="e.g. Complete AWS certification">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="newGoal.description" rows="3"
            placeholder="Describe the goal and success criteria..."></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Target Date</mat-label>
          <input matInput type="date" [(ngModel)]="newGoal.targetDate">
        </mat-form-field>
        <div style="display:flex;justify-content:flex-end">
          <button mat-raised-button color="primary" [disabled]="!newGoal.title || saving" (click)="createGoal()">
            <mat-icon>save</mat-icon>
            {{ saving ? 'Saving...' : 'Create Goal' }}
          </button>
        </div>
      </mat-card-content>
    </mat-card>

    <div *ngIf="goals.length === 0 && !showForm" class="empty-state">
      <mat-icon>flag</mat-icon>
      <p>No goals yet. Create your first goal!</p>
      <button mat-raised-button color="primary" (click)="showForm = true">+ New Goal</button>
    </div>

    <mat-card *ngFor="let g of goals" class="goal-card">
      <mat-card-content>
        <div class="goal-header">
          <div class="goal-title-area">
            <strong class="goal-title">{{ g.title }}</strong>
            <span *ngIf="isManagerOrAdmin" class="emp-label">Employee #{{ g.employeeId }}</span>
          </div>
          <span class="status-badge" [ngClass]="g.status?.toLowerCase()">{{ g.status }}</span>
        </div>

        <p class="goal-desc" *ngIf="g.description">{{ g.description }}</p>

        <div class="progress-section">
          <div class="progress-label">
            <span>Progress</span>
            <span class="progress-pct">{{ g.progress }}%</span>
          </div>
          <mat-progress-bar mode="determinate" [value]="g.progress"
            [color]="g.progress === 100 ? 'accent' : 'primary'"></mat-progress-bar>
        </div>

        <div class="goal-footer">
          <span *ngIf="g.targetDate" class="target-date">
            <mat-icon>calendar_today</mat-icon> Target: {{ g.targetDate | date:'dd MMM yyyy' }}
          </span>
          <span *ngIf="g.createdAt" class="created-at">
            Created {{ g.createdAt | date:'dd MMM yyyy' }}
          </span>
        </div>

        <!-- Progress update (own goals only, not completed) -->
        <div *ngIf="!isManagerOrAdmin && g.status !== 'COMPLETED' && g.status !== 'CANCELLED'" class="update-section">
          <div *ngIf="updatingId !== g.id" style="display:flex;justify-content:flex-end">
            <button mat-stroked-button color="primary" (click)="startUpdate(g)">
              <mat-icon>edit</mat-icon> Update Progress
            </button>
          </div>
          <div *ngIf="updatingId === g.id" class="progress-input">
            <label class="input-label">Update progress: {{ progressInput }}%</label>
            <input type="range" min="0" max="100" step="5" [(ngModel)]="progressInput" class="slider">
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px">
              <button mat-stroked-button (click)="updatingId = null">Cancel</button>
              <button mat-raised-button color="primary" [disabled]="saving" (click)="saveProgress(g.id)">
                Save
              </button>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>

    <style>
      .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
      .page-header h1 { margin: 0; }
      .page-header p { color: #666; margin: 4px 0 0; font-size: 14px; }
      .form-card { margin-bottom: 24px; border: 2px solid #3f51b5; }
      .full-width { width: 100%; }
      .empty-state { text-align: center; padding: 64px; color: #999; }
      .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 12px; color: #ccc; }
      .goal-card { margin-bottom: 16px; }
      .goal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
      .goal-title-area { display: flex; flex-direction: column; gap: 2px; }
      .goal-title { font-size: 15px; }
      .emp-label { font-size: 12px; color: #888; }
      .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; white-space: nowrap; }
      .status-badge.pending { background: #f3f4f6; color: #666; }
      .status-badge.in_progress { background: #e3f2fd; color: #1565c0; }
      .status-badge.completed { background: #e8f5e9; color: #2e7d32; }
      .status-badge.cancelled { background: #fce4ec; color: #c62828; }
      .goal-desc { color: #666; font-size: 14px; margin: 4px 0 12px; }
      .progress-section { margin-bottom: 12px; }
      .progress-label { display: flex; justify-content: space-between; font-size: 12px; color: #888; margin-bottom: 4px; }
      .progress-pct { font-weight: 600; color: #3f51b5; }
      .goal-footer { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #999; margin-bottom: 8px; }
      .target-date, .created-at { display: flex; align-items: center; gap: 4px; }
      .target-date mat-icon { font-size: 14px; width: 14px; height: 14px; }
      .update-section { padding-top: 8px; border-top: 1px solid #eee; }
      .progress-input { margin-top: 8px; }
      .input-label { font-size: 13px; color: #555; display: block; margin-bottom: 6px; }
      .slider { width: 100%; accent-color: #3f51b5; }
    </style>
  `
})
export class GoalListComponent implements OnInit {
  private svc = inject(PerformanceService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  goals: Goal[] = [];
  showForm = false;
  saving = false;
  updatingId: number | null = null;
  progressInput = 0;

  newGoal = { title: '', description: '', targetDate: '' };

  get isManagerOrAdmin(): boolean {
    const role = this.authService.getCurrentUserRole();
    return role === 'MANAGER' || role === 'ADMIN';
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const call = this.isManagerOrAdmin ? this.svc.getTeamGoals() : this.svc.getMyGoals();
    call.subscribe({ next: r => this.goals = r.data || [], error: () => {} });
  }

  createGoal(): void {
    if (!this.newGoal.title) return;
    this.saving = true;
    this.svc.createGoal({
      title: this.newGoal.title,
      description: this.newGoal.description,
      targetDate: this.newGoal.targetDate || undefined
    }).subscribe({
      next: () => {
        this.snackBar.open('Goal created!', 'Close', { duration: 3000 });
        this.saving = false;
        this.showForm = false;
        this.newGoal = { title: '', description: '', targetDate: '' };
        this.load();
      },
      error: err => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Failed to create goal', 'Close', { duration: 3000 });
      }
    });
  }

  startUpdate(goal: Goal): void {
    this.updatingId = goal.id;
    this.progressInput = goal.progress;
  }

  saveProgress(id: number): void {
    this.saving = true;
    this.svc.updateGoalProgress(id, this.progressInput).subscribe({
      next: () => {
        this.snackBar.open('Progress updated!', 'Close', { duration: 3000 });
        this.saving = false;
        this.updatingId = null;
        this.load();
      },
      error: err => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Failed to update progress', 'Close', { duration: 3000 });
      }
    });
  }
}
