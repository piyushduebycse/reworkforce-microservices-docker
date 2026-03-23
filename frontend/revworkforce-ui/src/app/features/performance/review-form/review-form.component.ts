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
    <div class="page-header"><h1>Submit Performance Review</h1></div>
    <mat-card style="max-width:600px">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Self Rating (1-5)</mat-label>
            <mat-select formControlName="selfRating">
              <mat-option [value]="1">1 - Needs Improvement</mat-option>
              <mat-option [value]="2">2 - Below Expectations</mat-option>
              <mat-option [value]="3">3 - Meets Expectations</mat-option>
              <mat-option [value]="4">4 - Exceeds Expectations</mat-option>
              <mat-option [value]="5">5 - Outstanding</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Self Comments</mat-label>
            <textarea matInput formControlName="selfComments" rows="5" placeholder="Describe your achievements and areas for improvement..."></textarea>
          </mat-form-field>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button mat-button type="button" (click)="router.navigate(['/performance/reviews'])">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Submit Review</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.full-width { width: 100%; margin-bottom: 16px; }`]
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
