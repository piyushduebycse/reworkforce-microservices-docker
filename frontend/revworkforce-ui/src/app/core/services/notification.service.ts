import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification, PageResponse } from '../models/notification.model';

interface ApiResponse<T> { success: boolean; message: string; data: T; statusCode: number; }

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = `${environment.apiGatewayUrl}/api/notifications`;
  private http = inject(HttpClient);

  // Shared signal — layout badge and panel both read this
  unreadCount = signal(0);

  getMyNotifications(page = 0, size = 20): Observable<ApiResponse<PageResponse<Notification>>> {
    return this.http.get<ApiResponse<PageResponse<Notification>>>(`${this.api}/me?page=${page}&size=${size}`);
  }

  getUnreadCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.api}/me/unread`).pipe(
      tap(r => this.unreadCount.set(r.data || 0))
    );
  }

  markAsRead(id: number): Observable<ApiResponse<Notification>> {
    return this.http.put<ApiResponse<Notification>>(`${this.api}/${id}/read`, {}).pipe(
      tap(() => this.unreadCount.update(n => Math.max(0, n - 1)))
    );
  }

  markAllAsRead(): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.api}/read-all`, {}).pipe(
      tap(() => this.unreadCount.set(0))
    );
  }

  deleteNotification(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`);
  }
}
