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
        <div><h1>My Performance Reviews</h1><p>{{ myReviews.length }} review(s)</p></div>
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
      <mat-tab-group>
        <mat-tab label="My Reviews ({{ myReviews.length }})">
          <div style="padding-top:16px">
            <ng-container *ngTemplateOutlet="myReviewsSection; context:{reviews: myReviews}"></ng-container>
            <div *ngIf="myReviews.length === 0" class="empty-state">
              <mat-icon>rate_review</mat-icon>
              <p>You haven't submitted a self review yet.</p>
              <button mat-raised-button color="primary" routerLink="/performance/review/new">+ Write Self Review</button>
            </div>
          </div>
        </mat-tab>
        <mat-tab label="Team Reviews ({{ pendingTeamReviews.length }} pending)">
          <div style="padding-top:16px">
            <div *ngIf="teamReviews.length === 0" class="empty-state">
              <mat-icon>group</mat-icon>
              <p>No team reviews submitted yet.</p>
            </div>
            <mat-card *ngFor="let r of teamReviews" class="review-card">
              <mat-card-content>
                <div class="review-header">
                  <div class="emp-info">
                    <div class="emp-avatar">{{ r.employeeId }}</div>
                    <div>
                      <strong>Employee #{{ r.employeeId }}</strong>
                      <div class="meta">Submitted {{ r.submittedAt | date:'dd MMM yyyy' }}</div>
                    </div>
                  </div>
                  <span class="status-badge" [ngClass]="(r.status || '').toLowerCase()">{{ r.status }}</span>
                </div>
                <div class="self-section">
                  <div class="section-label">Self Assessment</div>
                  <div class="rating-display">
                    <mat-icon *ngFor="let s of stars" [class.star-filled]="s <= (r.selfRating || 0)">star</mat-icon>
                    <span class="rating-num">{{ r.selfRating || '—' }}/5</span>
                  </div>
                  <p class="comments-text" *ngIf="r.selfComments">{{ r.selfComments }}</p>
                </div>
                <!-- Already reviewed -->
                <div *ngIf="r.status === 'REVIEWED'" class="manager-section">
                  <div class="section-label">Your Feedback (submitted)</div>
                  <div class="rating-display">
                    <mat-icon *ngFor="let s of stars" [class.star-filled]="s <= (r.managerRating || 0)">star</mat-icon>
                    <span class="rating-num">{{ r.managerRating }}/5</span>
                  </div>
                  <p class="comments-text">{{ r.managerFeedback }}</p>
                </div>
                <!-- Feedback form for SUBMITTED -->
                <div *ngIf="r.status === 'SUBMITTED'" class="feedback-form">
                  <div class="section-label">Provide Your Feedback</div>
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
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </ng-container>

    <!-- ADMIN: Team Reviews only, no self review -->
    <ng-container *ngIf="isAdmin">
      <div class="page-header">
        <div><h1>Team Performance Reviews</h1><p>{{ teamReviews.length }} total · {{ pendingTeamReviews.length }} pending feedback</p></div>
      </div>
      <div *ngIf="teamReviews.length === 0" class="empty-state">
        <mat-icon>group</mat-icon>
        <p>No team reviews submitted yet.</p>
      </div>
      <mat-card *ngFor="let r of teamReviews" class="review-card">
        <mat-card-content>
          <div class="review-header">
            <div class="emp-info">
              <div class="emp-avatar">{{ r.employeeId }}</div>
              <div>
                <strong>Employee #{{ r.employeeId }}</strong>
                <div class="meta">Submitted {{ r.submittedAt | date:'dd MMM yyyy' }}</div>
              </div>
            </div>
            <span class="status-badge" [ngClass]="(r.status || '').toLowerCase()">{{ r.status }}</span>
          </div>
          <div class="self-section">
            <div class="section-label">Self Assessment</div>
            <div class="rating-display">
              <mat-icon *ngFor="let s of stars" [class.star-filled]="s <= (r.selfRating || 0)">star</mat-icon>
              <span class="rating-num">{{ r.selfRating || '—' }}/5</span>
            </div>
            <p class="comments-text" *ngIf="r.selfComments">{{ r.selfComments }}</p>
          </div>
          <div *ngIf="r.status === 'REVIEWED'" class="manager-section">
            <div class="section-label">Manager Feedback</div>
            <div class="rating-display">
              <mat-icon *ngFor="let s of stars" [class.star-filled]="s <= (r.managerRating || 0)">star</mat-icon>
              <span class="rating-num">{{ r.managerRating }}/5</span>
            </div>
            <p class="comments-text">{{ r.managerFeedback }}</p>
          </div>
          <div *ngIf="r.status === 'SUBMITTED'" class="feedback-form">
            <div class="section-label">Provide Feedback (as Admin)</div>
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
        </mat-card-content>
      </mat-card>
    </ng-container>

    <!-- Reusable: My reviews section -->
    <ng-template #myReviewsSection let-reviews="reviews">
      <mat-card *ngFor="let r of reviews" class="review-card">
        <mat-card-content>
          <div class="review-header">
            <div>
              <strong>Cycle: {{ r.reviewCycleId || 'General' }}</strong>
              <div class="meta">Submitted {{ r.submittedAt | date:'dd MMM yyyy' }}</div>
            </div>
            <span class="status-badge" [ngClass]="(r.status || '').toLowerCase()">{{ r.status }}</span>
          </div>
          <div class="self-section">
            <div class="section-label">Your Self Assessment</div>
            <div class="rating-display">
              <mat-icon *ngFor="let s of stars" [class.star-filled]="s <= (r.selfRating || 0)">star</mat-icon>
              <span class="rating-num">{{ r.selfRating || '—' }}/5</span>
            </div>
            <p class="comments-text" *ngIf="r.selfComments">{{ r.selfComments }}</p>
          </div>
          <div *ngIf="r.status === 'REVIEWED'" class="manager-section">
            <div class="section-label">Manager Feedback</div>
            <div class="rating-display">
              <mat-icon *ngFor="let s of stars" [class.star-filled]="s <= (r.managerRating || 0)">star</mat-icon>
              <span class="rating-num">{{ r.managerRating }}/5</span>
            </div>
            <p class="comments-text">{{ r.managerFeedback }}</p>
          </div>
          <div *ngIf="r.status === 'SUBMITTED'" class="pending-feedback">
            <mat-icon>hourglass_empty</mat-icon>
            <span>Awaiting manager feedback</span>
          </div>
        </mat-card-content>
      </mat-card>
    </ng-template>

    <style>
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
      .page-header h1 { margin: 0; }
      .page-header p { color: #666; margin: 4px 0 0; font-size: 14px; }
      .empty-state { text-align: center; padding: 48px; color: #999; }
      .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 12px; color: #ccc; }
      .review-card { margin-bottom: 16px; }
      .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .emp-info { display: flex; align-items: center; gap: 12px; }
      .emp-avatar { width: 40px; height: 40px; border-radius: 50%; background: #3f51b5; color: white;
        display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0; }
      .meta { font-size: 12px; color: #888; margin-top: 2px; }
      .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
      .status-badge.submitted { background: #fff3e0; color: #e65100; }
      .status-badge.reviewed { background: #e8f5e9; color: #2e7d32; }
      .status-badge.draft { background: #f3f4f6; color: #666; }
      .section-label { font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
      .self-section { padding: 12px; background: #f5f5f5; border-radius: 8px; margin-bottom: 12px; }
      .manager-section { padding: 12px; background: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 8px; margin-bottom: 12px; }
      .feedback-form { padding-top: 12px; border-top: 1px solid #eee; }
      .rating-display, .star-input { display: flex; align-items: center; gap: 2px; margin-bottom: 8px; }
      .star-input mat-icon { cursor: pointer; }
      mat-icon.star-filled { color: #ff9800; }
      .rating-num { font-size: 13px; color: #666; margin-left: 4px; }
      .comments-text { margin: 4px 0 0; font-size: 14px; color: #444; }
      .full-width { width: 100%; }
      .pending-feedback { display: flex; align-items: center; gap: 8px; color: #999; font-size: 13px; padding-top: 12px; border-top: 1px solid #eee; }
    </style>
  `
})
export class ReviewListComponent implements OnInit {
  private svc = inject(PerformanceService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  myReviews: PerformanceReview[] = [];
  teamReviews: PerformanceReview[] = [];
  feedbackData: Record<number, { rating: number; comment: string }> = {};
  processingId: number | null = null;
  stars = [1, 2, 3, 4, 5];

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
    if (this.isManagerOrAdmin) this.loadTeamReviews();
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
