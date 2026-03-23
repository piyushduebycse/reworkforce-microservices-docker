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
      <button mat-button (click)="markAllRead()">Mark All Read</button>
    </div>
    <mat-card>
      <mat-list>
        <mat-list-item *ngFor="let n of notifications" [class.unread]="!n.isRead">
          <mat-icon matListItemIcon [color]="!n.isRead ? 'primary' : ''">
            {{ getIcon(n.type) }}
          </mat-icon>
          <div matListItemTitle>{{ n.title }}</div>
          <div matListItemLine>{{ n.message }}</div>
          <div matListItemLine class="time">{{ n.createdAt | date:'medium' }}</div>
          <button mat-icon-button *ngIf="!n.isRead" (click)="markRead(n.id)">
            <mat-icon>done</mat-icon>
          </button>
        </mat-list-item>
      </mat-list>
      <p *ngIf="notifications.length === 0" class="empty-state">No notifications</p>
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .unread { background: #e8eaf6; }
    .time { color: #999; font-size: 11px !important; }
    .empty-state { text-align: center; color: #999; padding: 48px; }
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
