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
    <div class="page-header">
      <h1>Leave Balances</h1>
      <p>Your current leave entitlements</p>
    </div>

    <div class="card-grid">
      <mat-card *ngFor="let b of balances" class="balance-card">
        <mat-card-content>
          <div class="bal-card">
            <div class="bal-top">
              <span class="bal-name">{{ b.leaveTypeName }}</span>
              <span class="bal-days">{{ b.remainingDays }}<small>/{{ b.totalDays }}</small></span>
            </div>
            <mat-progress-bar mode="determinate" [value]="(b.usedDays / b.totalDays) * 100"></mat-progress-bar>
            <span class="bal-used">{{ b.usedDays }} days used</span>
          </div>

          <div class="stats-row">
            <div class="stat-box">
              <div class="stat-num">{{ b.totalDays }}</div>
              <div class="stat-lbl">Total</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-box">
              <div class="stat-num used">{{ b.usedDays }}</div>
              <div class="stat-lbl">Used</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-box">
              <div class="stat-num remaining">{{ b.remainingDays }}</div>
              <div class="stat-lbl">Remaining</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div *ngIf="balances.length === 0" class="empty-state">
      <p>No leave balances found.</p>
    </div>
  `,
  styles: [`
    .balance-card { background: var(--bg-card); border: 1px solid var(--border); }
    .balance-card mat-card-content { padding: 0 !important; }

    .bal-card { padding: 18px 18px 14px; }
    .bal-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .bal-name { font-size: 13px; font-weight: 600; color: var(--text-2); }
    .bal-days { font-size: 22px; font-weight: 800; color: var(--text-1); }
    .bal-days small { font-size: 13px; color: var(--text-3); }
    .bal-used { font-size: 11px; color: var(--text-3); margin-top: 6px; display: block; }

    .stats-row {
      display: flex; align-items: stretch;
      border-top: 1px solid var(--border);
      padding: 14px 18px;
    }
    .stat-box { flex: 1; text-align: center; }
    .stat-num { font-size: 26px; font-weight: 800; color: var(--text-1); line-height: 1; }
    .stat-num.used { color: var(--warning); }
    .stat-num.remaining { color: var(--primary); }
    .stat-lbl { font-size: 11px; color: var(--text-3); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-divider { width: 1px; background: var(--border); margin: 0 4px; }

    .empty-state {
      text-align: center; color: var(--text-3); padding: 48px;
      background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    }
  `]
})
export class LeaveBalanceComponent implements OnInit {
  private leaveService = inject(LeaveService);
  balances: LeaveBalance[] = [];
  ngOnInit(): void { this.leaveService.getMyBalances().subscribe({ next: r => this.balances = r.data || [], error: () => {} }); }
}
