import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PerformanceService } from '../../../core/services/performance.service';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="page-wrap">
      <div class="page-header">
        <h1>Submit Performance Review</h1>
        <p class="sub">Share your self-assessment for this review cycle</p>
      </div>

      <div class="form-card">
        <div class="form-card-header">
          <div class="form-card-icon">
            <span class="material-icons">rate_review</span>
          </div>
          <div>
            <div class="form-card-title">Self Assessment</div>
            <div class="form-card-desc">Rate your performance and describe your achievements</div>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="review-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Self Rating (1–5)</mat-label>
            <mat-select formControlName="selfRating">
              <mat-option [value]="1">1 — Needs Improvement</mat-option>
              <mat-option [value]="2">2 — Below Expectations</mat-option>
              <mat-option [value]="3">3 — Meets Expectations</mat-option>
              <mat-option [value]="4">4 — Exceeds Expectations</mat-option>
              <mat-option [value]="5">5 — Outstanding</mat-option>
            </mat-select>
            <mat-error>Rating is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Self Comments</mat-label>
            <textarea matInput formControlName="selfComments" rows="6"
              placeholder="Describe your achievements, contributions, and areas for improvement this cycle..."></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="router.navigate(['/performance/reviews'])">
              Cancel
            </button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; padding: 24px; background: var(--bg-base); min-height: 100%; }

    .page-header { margin-bottom: 28px; }
    .page-header h1 { margin: 0; color: var(--text-1); font-size: 22px; font-weight: 700; }
    .sub { color: var(--text-3); margin: 6px 0 0; font-size: 14px; }

    .form-card {
      max-width: 640px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 28px;
      box-shadow: var(--shadow);
    }

    .form-card-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }

    .form-card-icon {
      width: 44px; height: 44px;
      background: var(--primary-glow);
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .form-card-icon .material-icons { color: var(--primary); font-size: 22px; }

    .form-card-title { font-size: 15px; font-weight: 600; color: var(--text-1); }
    .form-card-desc { font-size: 13px; color: var(--text-3); margin-top: 2px; }

    .review-form { display: flex; flex-direction: column; gap: 4px; }

    .full-width { width: 100%; margin-bottom: 8px; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 8px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
  `]
})
export class ReviewFormComponent {
  private fb = inject(FormBuilder);
  private svc = inject(PerformanceService);
  private snack = inject(MatSnackBar);
  router = inject(Router);

  form = this.fb.group({ selfRating: [null, [Validators.required, Validators.min(1), Validators.max(5)]], selfComments: [''] });

  submit(): void {
    this.svc.createReview(this.form.value as any).subscribe({
      next: () => { this.snack.open('Review submitted!', 'Close', { duration: 2000 }); this.router.navigate(['/performance/reviews']); },
      error: err => this.snack.open(err.error?.message || 'Failed', 'Close', { duration: 3000 })
    });
  }
}
