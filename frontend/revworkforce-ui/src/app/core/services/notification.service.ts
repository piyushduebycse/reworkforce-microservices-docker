import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification, PageResponse } from '../models/notification.model';

interface ApiResponse<T> { success: boolean; message: string; data: T; statusCode: number; }

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = `${environment.apiGatewayUrl}/api/notifications`;
  private http = inject(HttpClient);

  getMyNotifications(page = 0, size = 20): Observable<ApiResponse<PageResponse<Notification>>> {
    return this.http.get<ApiResponse<PageResponse<Notification>>>(`${this.api}/me?page=${page}&size=${size}`);
  }

  getUnreadCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.api}/me/unread`);
  }

  markAsRead(id: number): Observable<ApiResponse<Notification>> {
    return this.http.put<ApiResponse<Notification>>(`${this.api}/${id}/read`, {});
  }

  markAllAsRead(): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.api}/read-all`, {});
  }

  deleteNotification(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`);
  }
}
