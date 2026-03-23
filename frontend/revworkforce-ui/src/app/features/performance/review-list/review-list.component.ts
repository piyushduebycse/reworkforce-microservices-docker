import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { PerformanceService } from '../../../core/services/performance.service';
import { PerformanceReview } from '../../../core/models/performance.model';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  template: `
    <div class="page-header">
      <h1>Performance Reviews</h1>
      <button mat-raised-button color="primary" routerLink="/performance/review/new">+ New Review</button>
    </div>
    <mat-card *ngFor="let r of reviews" style="margin-bottom:12px">
      <mat-card-content>
        <strong>Status: {{ r.status }}</strong>
        <p *ngIf="r.selfRating">Self Rating: {{ r.selfRating }}/5</p>
        <p *ngIf="r.managerRating">Manager Rating: {{ r.managerRating }}/5</p>
        <p *ngIf="r.selfComments">{{ r.selfComments }}</p>
        <small>{{ r.submittedAt | date }}</small>
      </mat-card-content>
    </mat-card>
    <p *ngIf="reviews.length === 0" style="text-align:center;color:#999;padding:48px">No performance reviews yet</p>
  `
})
export class ReviewListComponent implements OnInit {
  private svc = inject(PerformanceService);
  reviews: PerformanceReview[] = [];
  ngOnInit(): void { this.svc.getMyReviews().subscribe({ next: r => this.reviews = r.data || [], error: () => {} }); }
}
