import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Goal, GoalRequest, PerformanceReview } from '../models/performance.model';

interface ApiResponse<T> { success: boolean; message: string; data: T; statusCode: number; }

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private api = `${environment.apiGatewayUrl}/api/performance`;
  private http = inject(HttpClient);

  getMyReviews(): Observable<ApiResponse<PerformanceReview[]>> {
    return this.http.get<ApiResponse<PerformanceReview[]>>(`${this.api}/reviews/me`);
  }

  createReview(review: { selfRating: number; selfComments: string; reviewCycleId?: number }): Observable<ApiResponse<PerformanceReview>> {
    return this.http.post<ApiResponse<PerformanceReview>>(`${this.api}/reviews`, review);
  }

  submitReview(id: number): Observable<ApiResponse<PerformanceReview>> {
    return this.http.put<ApiResponse<PerformanceReview>>(`${this.api}/reviews/${id}/submit`, {});
  }

  provideFeedback(id: number, feedback: { managerRating: number; managerFeedback: string }): Observable<ApiResponse<PerformanceReview>> {
    return this.http.put<ApiResponse<PerformanceReview>>(`${this.api}/reviews/${id}/provide-feedback`, feedback);
  }

  getTeamReviews(): Observable<ApiResponse<PerformanceReview[]>> {
    return this.http.get<ApiResponse<PerformanceReview[]>>(`${this.api}/reviews/team`);
  }

  getMyGoals(): Observable<ApiResponse<Goal[]>> {
    return this.http.get<ApiResponse<Goal[]>>(`${this.api}/goals/me`);
  }

  createGoal(request: GoalRequest): Observable<ApiResponse<Goal>> {
    return this.http.post<ApiResponse<Goal>>(`${this.api}/goals`, request);
  }

  updateGoalProgress(id: number, progress: number): Observable<ApiResponse<Goal>> {
    return this.http.put<ApiResponse<Goal>>(`${this.api}/goals/${id}/progress`, { progress });
  }

  getTeamGoals(): Observable<ApiResponse<Goal[]>> {
    return this.http.get<ApiResponse<Goal[]>>(`${this.api}/goals/team`);
  }
}
