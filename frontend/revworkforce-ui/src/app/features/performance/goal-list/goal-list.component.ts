import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { PerformanceService } from '../../../core/services/performance.service';
import { Goal } from '../../../core/models/performance.model';

@Component({
  selector: 'app-goal-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatButtonModule],
  template: `
    <div class="page-header"><h1>My Goals</h1></div>
    <mat-card *ngFor="let g of goals" style="margin-bottom:12px">
      <mat-card-content>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>{{ g.title }}</strong>
          <span class="status-badge" [class]="g.status.toLowerCase()">{{ g.status }}</span>
        </div>
        <p style="color:#666;margin:8px 0">{{ g.description }}</p>
        <mat-progress-bar mode="determinate" [value]="g.progress"></mat-progress-bar>
        <small style="color:#666">{{ g.progress }}% complete</small>
        <p *ngIf="g.targetDate" style="color:#999;font-size:12px">Target: {{ g.targetDate | date }}</p>
      </mat-card-content>
    </mat-card>
    <p *ngIf="goals.length === 0" style="text-align:center;color:#999;padding:48px">No goals set yet</p>
  `
})
export class GoalListComponent implements OnInit {
  private svc = inject(PerformanceService);
  goals: Goal[] = [];
  ngOnInit(): void { this.svc.getMyGoals().subscribe({ next: r => this.goals = r.data || [], error: () => {} }); }
}
