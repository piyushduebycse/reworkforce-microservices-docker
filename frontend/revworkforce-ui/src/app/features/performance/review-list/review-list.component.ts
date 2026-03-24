import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PerformanceService } from '../../../core/services/performance.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { PerformanceReview } from '../../../core/models/performance.model';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatTabsModule, MatSnackBarModule],
  template: `
    <!-- EMPLOYEE: My reviews only -->
    <ng-container *ngIf="!isManagerOrAdmin">
      <div class="page-header">
        <div>
          <h1>My Performance Reviews</h1>
          <p class="sub">{{ myReviews.length }} review(s)</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/performance/review/new">
          <mat-icon>add</mat-icon> New Self Review
        </button>
      </div>
      <ng-container *ngTemplateOutlet="myReviewsSection; context:{reviews: myReviews}"></ng-container>
      <div *ngIf="myReviews.length === 0" class="empty-state">
        <mat-icon>rate_review</mat-icon>
        <p>No reviews yet.</p>
        <button mat-raised-button color="primary" routerLink="/performance/review/new">+ New Self Review</button>
      </div>
    </ng-container>

    <!-- MANAGER: Tabs for My Reviews + Team Reviews -->
    <ng-container *ngIf="isManager">
      <div class="page-header">
        <div><h1>Performance Reviews</h1></div>
        <button mat-raised-button color="primary" routerLink="/performance/review/new">
          <mat-icon>add</mat-icon> Write Self Review
        </button>
      </div>
      <mat-tab-group class="dark-tabs">
        <mat-tab label="My Reviews ({{ myReviews.length }})">
          <div class="tab-content">
            <ng-container *ngTemplateOutlet="myReviewsSection; context:{reviews: myReviews}"></ng-container>
            <div *ngIf="myReviews.length === 0" class="empty-state">
              <mat-icon>rate_review</mat-icon>
              <p>You haven't submitted a self review yet.</p>
              <button mat-raised-button color="primary" routerLink="/performance/review/new">+ Write Self Review</button>
            </div>
          </div>
        </mat-tab>
        <mat-tab label="Team Reviews ({{ pendingTeamReviews.length }} pending)">
          <div class="tab-content">
            <div *ngIf="teamReviews.length === 0" class="empty-state">
              <mat-icon>group</mat-icon>
              <p>No team reviews submitted yet.</p>
            </div>
            <ng-container *ngTemplateOutlet="teamReviewCards; context:{reviews: teamReviews}"></ng-container>
          </div>
        </mat-tab>
      </mat-tab-group>
    </ng-container>

    <!-- ADMIN: Team Reviews only, no self review -->
    <ng-container *ngIf="isAdmin">
      <div class="page-header">
        <div>
          <h1>Team Performance Reviews</h1>
          <p class="sub">{{ teamReviews.length }} total &middot; {{ pendingTeamReviews.length }} pending feedback</p>
        </div>
      </div>
      <div *ngIf="teamReviews.length === 0" class="empty-state">
        <mat-icon>group</mat-icon>
        <p>No team reviews submitted yet.</p>
      </div>
      <ng-container *ngTemplateOutlet="teamReviewCards; context:{reviews: teamReviews}"></ng-container>
    </ng-container>

    <!-- Reusable: My reviews section -->
    <ng-template #myReviewsSection let-reviews="reviews">
      <div class="review-card" *ngFor="let r of reviews">
        <div class="review-header">
          <div>
            <strong class="cycle-label">{{ getReviewPeriod(r) }}</strong>
            <div class="meta">Submitted {{ r.submittedAt | date:'dd MMM yyyy' }}</div>
          </div>
          <span class="status-badge" [ngClass]="(r.status || '').toLowerCase()">{{ r.status }}</span>
        </div>
        <div class="self-section">
          <div class="section-label">Your Self Assessment</div>
          <div class="stars">
            <mat-icon *ngFor="let s of stars" [class.star-filled]="s <= (r.selfRating || 0)">star</mat-icon>
            <span class="rating-num">{{ r.selfRating || '—' }}/5</span>
          </div>
          <p class="comments-text" *ngIf="r.selfComments">{{ r.selfComments }}</p>
        </div>
        <div *ngIf="r.status === 'REVIEWED'" class="manager-section">
          <div class="section-label">Manager Feedback</div>
          <div class="stars">
            <mat-icon *ngFor="let s of stars" [class.star-filled]="s <= (r.managerRating || 0)">star</mat-icon>
            <span class="rating-num">{{ r.managerRating }}/5</span>
          </div>
          <p class="comments-text">{{ r.managerFeedback }}</p>
        </div>
        <div *ngIf="r.status === 'SUBMITTED'" class="pending-feedback">
          <mat-icon>hourglass_empty</mat-icon>
          <span>Awaiting manager feedback</span>
        </div>
      </div>
    </ng-template>

    <!-- Reusable: Team review cards -->
    <ng-template #teamReviewCards let-reviews="reviews">
      <div class="review-card" *ngFor="let r of reviews">
        <div class="review-header">
          <div class="emp-info">
            <div class="emp-avatar">{{ getInitials(r.employeeId) }}</div>
            <div>
              <strong>{{ getEmployeeName(r.employeeId) }}</strong>
              <div class="meta">Submitted {{ r.submittedAt | date:'dd MMM yyyy' }}</div>
            </div>
          </div>
          <span class="status-badge" [ngClass]="(r.status || '').toLowerCase()">{{ r.status }}</span>
        </div>
        <div class="self-section">
          <div class="section-label">Self Assessment</div>
          <div class="stars">
            <mat-icon *ngFor="let s of stars" [class.star-filled]="s <= (r.selfRating || 0)">star</mat-icon>
            <span class="rating-num">{{ r.selfRating || '—' }}/5</span>
          </div>
          <p class="comments-text" *ngIf="r.selfComments">{{ r.selfComments }}</p>
        </div>
        <!-- Already reviewed -->
        <div *ngIf="r.status === 'REVIEWED'" class="manager-section">
          <div class="section-label">{{ isAdmin ? 'Manager Feedback' : 'Your Feedback (submitted)' }}</div>
          <div class="stars">
            <mat-icon *ngFor="let s of stars" [class.star-filled]="s <= (r.managerRating || 0)">star</mat-icon>
            <span class="rating-num">{{ r.managerRating }}/5</span>
          </div>
          <p class="comments-text">{{ r.managerFeedback }}</p>
        </div>
        <!-- Feedback form for SUBMITTED -->
        <div *ngIf="r.status === 'SUBMITTED'" class="feedback-form">
          <div class="section-label">{{ isAdmin ? 'Provide Feedback (as Admin)' : 'Provide Your Feedback' }}</div>
          <div class="star-input">
            <mat-icon *ngFor="let s of stars"
              [class.star-filled]="s <= (feedbackData[r.id]?.rating || 0)"
              (click)="setRating(r.id, s)">star</mat-icon>
            <span class="rating-num">{{ feedbackData[r.id]?.rating || 0 }}/5</span>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Feedback Comments</mat-label>
            <textarea matInput [(ngModel)]="feedbackData[r.id].comment" rows="3"
              placeholder="Provide constructive feedback..."></textarea>
          </mat-form-field>
          <div style="display:flex;justify-content:flex-end">
            <button mat-raised-button color="primary"
              [disabled]="!feedbackData[r.id]?.rating || processingId === r.id"
              (click)="submitFeedback(r.id)">
              <mat-icon>send</mat-icon>
              {{ processingId === r.id ? 'Submitting...' : 'Submit Feedback' }}
            </button>
          </div>
        </div>
      </div>
    </ng-template>

    <style>
      :host { display: block; padding: 24px; background: var(--bg-base); min-height: 100%; }

      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
      .page-header h1 { margin: 0; color: var(--text-1); font-size: 22px; font-weight: 700; }
      .sub { color: var(--text-3); margin: 4px 0 0; font-size: 13px; }

      .empty-state { text-align: center; padding: 56px 24px; color: var(--text-3); }
      .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 12px; color: var(--text-3); }
      .empty-state p { margin: 0 0 16px; font-size: 14px; }

      .dark-tabs ::ng-deep .mat-mdc-tab-header { background: var(--bg-surface); border-bottom: 1px solid var(--border); border-radius: var(--radius) var(--radius) 0 0; }
      .dark-tabs ::ng-deep .mat-mdc-tab { color: var(--text-2); }
      .dark-tabs ::ng-deep .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label { color: var(--primary); }
      .dark-tabs ::ng-deep .mdc-tab-indicator__content--underline { border-color: var(--primary); }

      .tab-content { padding-top: 20px; }

      .review-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: var(--shadow);
      }

      .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .cycle-label { font-size: 15px; color: var(--text-1); font-weight: 600; }
      .emp-info { display: flex; align-items: center; gap: 12px; }
      .emp-avatar {
        width: 40px; height: 40px; border-radius: 50%;
        background: var(--primary); color: #fff;
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 13px; flex-shrink: 0;
      }
      .emp-info strong { color: var(--text-1); font-size: 14px; }
      .meta { font-size: 12px; color: var(--text-3); margin-top: 2px; }

      .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
      .status-badge.submitted { background: var(--warning-bg); color: var(--warning); }
      .status-badge.reviewed { background: var(--success-bg); color: var(--success); }
      .status-badge.draft { background: var(--bg-elevated); color: var(--text-3); }

      .section-label { font-size: 11px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; }

      .self-section {
        padding: 14px;
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        margin-bottom: 12px;
      }
      .manager-section {
        padding: 14px;
        background: var(--success-bg);
        border: 1px solid var(--success);
        border-radius: var(--radius-sm);
        margin-bottom: 12px;
      }
      .manager-section .section-label { color: var(--success); }

      .feedback-form { padding-top: 14px; border-top: 1px solid var(--border); margin-top: 4px; }

      .stars { display: flex; align-items: center; gap: 2px; margin-bottom: 8px; }
      .stars mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--text-3); }
      .stars .star-filled { color: var(--warning); }

      .star-input { display: flex; align-items: center; gap: 2px; margin-bottom: 12px; }
      .star-input mat-icon { font-size: 24px; width: 24px; height: 24px; color: var(--text-3); cursor: pointer; transition: color 0.15s, transform 0.1s; }
      .star-input mat-icon:hover { color: var(--warning); transform: scale(1.15); }
      .star-input .star-filled { color: var(--warning); }

      .rating-num { font-size: 13px; color: var(--text-2); margin-left: 6px; }
      .comments-text { margin: 4px 0 0; font-size: 14px; color: var(--text-2); line-height: 1.6; }

      .full-width { width: 100%; }

      .pending-feedback {
        display: flex; align-items: center; gap: 8px;
        color: var(--text-3); font-size: 13px;
        padding-top: 12px; border-top: 1px solid var(--border);
      }
      .pending-feedback mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--warning); }
    </style>
  `
})
export class ReviewListComponent implements OnInit {
  private svc = inject(PerformanceService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  myReviews: PerformanceReview[] = [];
  teamReviews: PerformanceReview[] = [];
  feedbackData: Record<number, { rating: number; comment: string }> = {};
  processingId: number | null = null;
  stars = [1, 2, 3, 4, 5];
  private userMap = new Map<number, { firstName: string; lastName: string }>();

  get isManagerOrAdmin(): boolean {
    const role = this.authService.getCurrentUserRole();
    return role === 'MANAGER' || role === 'ADMIN';
  }

  get isManager(): boolean {
    return this.authService.getCurrentUserRole() === 'MANAGER';
  }

  get isAdmin(): boolean {
    return this.authService.getCurrentUserRole() === 'ADMIN';
  }

  get pendingTeamReviews(): PerformanceReview[] {
    return this.teamReviews.filter(r => r.status === 'SUBMITTED');
  }

  ngOnInit(): void {
    if (!this.isAdmin) this.loadMyReviews();
    if (this.isManagerOrAdmin) {
      this.loadTeamReviews();
      this.userService.getDirectory().subscribe({
        next: r => (r.data || []).forEach((u: any) => this.userMap.set(u.id, u)),
        error: () => {}
      });
    }
  }

  loadMyReviews(): void {
    this.svc.getMyReviews().subscribe({ next: r => this.myReviews = r.data || [], error: () => {} });
  }

  loadTeamReviews(): void {
    this.svc.getTeamReviews().subscribe({
      next: r => {
        this.teamReviews = r.data || [];
        this.teamReviews.forEach(rev => {
          if (!this.feedbackData[rev.id]) this.feedbackData[rev.id] = { rating: 0, comment: '' };
        });
      },
      error: () => {}
    });
  }

  getReviewPeriod(r: PerformanceReview): string {
    const date = r.submittedAt ? new Date(r.submittedAt) : new Date();
    const q = Math.ceil((date.getMonth() + 1) / 3);
    return `Q${q} ${date.getFullYear()} Performance Review`;
  }

  getEmployeeName(id: number): string {
    const u = this.userMap.get(id);
    return u ? `${u.firstName} ${u.lastName}` : `Team Member`;
  }

  getInitials(id: number): string {
    const u = this.userMap.get(id);
    return u ? `${u.firstName[0]}${u.lastName[0]}`.toUpperCase() : '?';
  }

  setRating(reviewId: number, rating: number): void {
    if (!this.feedbackData[reviewId]) this.feedbackData[reviewId] = { rating: 0, comment: '' };
    this.feedbackData[reviewId].rating = rating;
  }

  submitFeedback(reviewId: number): void {
    const data = this.feedbackData[reviewId];
    if (!data?.rating) return;
    this.processingId = reviewId;
    this.svc.provideFeedback(reviewId, { managerRating: data.rating, managerFeedback: data.comment }).subscribe({
      next: () => {
        this.snackBar.open('Feedback submitted!', 'Close', { duration: 3000 });
        this.processingId = null;
        this.loadTeamReviews();
      },
      error: err => {
        this.processingId = null;
        this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 3000 });
      }
    });
  }
}
