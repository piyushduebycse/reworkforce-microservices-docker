import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LeaveService } from '../../../core/services/leave.service';
import { LeaveBalance } from '../../../core/models/leave.model';

@Component({
  selector: 'app-leave-balance',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule],
  template: `
    <div class="page-header"><h1>Leave Balances</h1><p>Your current leave entitlements</p></div>
    <div class="card-grid">
      <mat-card *ngFor="let b of balances">
        <mat-card-header><mat-card-title>{{ b.leaveTypeName }}</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="stats">
            <div class="stat"><div class="num">{{ b.totalDays }}</div><div class="lbl">Total</div></div>
            <div class="stat"><div class="num">{{ b.usedDays }}</div><div class="lbl">Used</div></div>
            <div class="stat primary"><div class="num">{{ b.remainingDays }}</div><div class="lbl">Remaining</div></div>
          </div>
          <mat-progress-bar mode="determinate" [value]="(b.usedDays / b.totalDays) * 100" style="margin-top:12px"></mat-progress-bar>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .stats { display: flex; justify-content: space-around; margin-top: 8px; }
    .stat { text-align: center; .num { font-size: 28px; font-weight: 700; } .lbl { font-size: 12px; color: #666; } }
    .stat.primary .num { color: #3f51b5; }
  `]
})
export class LeaveBalanceComponent implements OnInit {
  private leaveService = inject(LeaveService);
  balances: LeaveBalance[] = [];
  ngOnInit(): void { this.leaveService.getMyBalances().subscribe({ next: r => this.balances = r.data || [], error: () => {} }); }
}
