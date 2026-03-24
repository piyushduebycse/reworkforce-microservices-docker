import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatListModule],
  template: `
    <div class="page-header">
      <h1>Notifications</h1>
      <button class="mark-all-btn" (click)="markAllRead()">
        <mat-icon>done_all</mat-icon>
        Mark All Read
      </button>
    </div>

    <div class="notif-list">
      <div *ngFor="let n of notifications"
           class="notif-row"
           [class.unread]="!n.isRead">
        <div class="notif-icon-wrap" [class.unread-icon]="!n.isRead">
          <mat-icon>{{ getIcon(n.type) }}</mat-icon>
        </div>
        <div class="notif-body">
          <div class="notif-title">{{ n.title }}</div>
          <div class="notif-message">{{ n.message }}</div>
          <div class="notif-time">{{ n.createdAt | date:'medium' }}</div>
        </div>
        <button *ngIf="!n.isRead" class="mark-read-btn" (click)="markRead(n.id)" title="Mark as read">
          <mat-icon>done</mat-icon>
        </button>
      </div>

      <div *ngIf="notifications.length === 0" class="empty-state">
        <mat-icon>notifications_none</mat-icon>
        <p>You're all caught up — no notifications.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .mark-all-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-2);
      font-size: 13px;
      font-weight: 500;
      padding: 6px 14px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .mark-all-btn:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
    .mark-all-btn mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .notif-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .notif-row {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 14px 16px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      transition: background 0.15s;
    }
    .notif-row:hover { background: var(--bg-elevated); }
    .notif-row.unread {
      border-left: 3px solid var(--primary);
      background: var(--bg-elevated);
    }
    .notif-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--text-3);
    }
    .notif-icon-wrap.unread-icon {
      background: var(--primary-glow);
      border-color: var(--primary);
      color: var(--primary);
    }
    .notif-icon-wrap mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .notif-body { flex: 1; }
    .notif-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-1);
      margin-bottom: 2px;
    }
    .notif-message {
      font-size: 13px;
      color: var(--text-2);
      margin-bottom: 4px;
    }
    .notif-time {
      font-size: 11px;
      color: var(--text-3);
    }
    .mark-read-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-3);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 50%;
      transition: all 0.15s;
      flex-shrink: 0;
    }
    .mark-read-btn:hover {
      color: var(--success);
      background: var(--success-bg);
    }
    .mark-read-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .empty-state {
      text-align: center;
      padding: 56px 24px;
      color: var(--text-3);
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      display: block;
      margin: 0 auto 12px;
    }
  `]
})
export class NotificationPanelComponent implements OnInit {
  private notifService = inject(NotificationService);
  notifications: Notification[] = [];

  ngOnInit(): void { this.load(); }
  load(): void { this.notifService.getMyNotifications().subscribe({ next: r => this.notifications = r.data?.content || [], error: () => {} }); }
  markRead(id: number): void { this.notifService.markAsRead(id).subscribe({ next: () => this.load(), error: () => {} }); }
  markAllRead(): void { this.notifService.markAllAsRead().subscribe({ next: () => this.load(), error: () => {} }); }
  getIcon(type: string): string {
    const icons: Record<string, string> = {
      LEAVE_APPROVED: 'check_circle', LEAVE_REJECTED: 'cancel', LEAVE_APPLIED: 'event',
      PERFORMANCE_FEEDBACK: 'star', GOAL_UPDATED: 'flag', ANNOUNCEMENT: 'campaign', GENERAL: 'notifications'
    };
    return icons[type] || 'notifications';
  }
}
