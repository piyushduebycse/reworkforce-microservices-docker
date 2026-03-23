import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeaveApplication, LeaveApplicationRequest, LeaveBalance, LeaveType } from '../models/leave.model';

interface ApiResponse<T> { success: boolean; message: string; data: T; statusCode: number; }

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private api = `${environment.apiGatewayUrl}/api/leaves`;
  private http = inject(HttpClient);

  getLeaveTypes(): Observable<ApiResponse<LeaveType[]>> {
    return this.http.get<ApiResponse<LeaveType[]>>(`${this.api}/types`);
  }

  getMyBalances(): Observable<ApiResponse<LeaveBalance[]>> {
    return this.http.get<ApiResponse<LeaveBalance[]>>(`${this.api}/balances/me`);
  }

  applyLeave(request: LeaveApplicationRequest): Observable<ApiResponse<LeaveApplication>> {
    return this.http.post<ApiResponse<LeaveApplication>>(`${this.api}/applications`, request);
  }

  getMyApplications(): Observable<ApiResponse<LeaveApplication[]>> {
    return this.http.get<ApiResponse<LeaveApplication[]>>(`${this.api}/applications/me`);
  }

  getPendingApprovals(): Observable<ApiResponse<LeaveApplication[]>> {
    return this.http.get<ApiResponse<LeaveApplication[]>>(`${this.api}/applications/pending`);
  }

  getTeamApplications(): Observable<ApiResponse<LeaveApplication[]>> {
    return this.http.get<ApiResponse<LeaveApplication[]>>(`${this.api}/applications/team`);
  }

  approveLeave(id: number, comment?: string): Observable<ApiResponse<LeaveApplication>> {
    return this.http.put<ApiResponse<LeaveApplication>>(`${this.api}/applications/${id}/approve`, { comment });
  }

  rejectLeave(id: number, comment?: string): Observable<ApiResponse<LeaveApplication>> {
    return this.http.put<ApiResponse<LeaveApplication>>(`${this.api}/applications/${id}/reject`, { comment });
  }

  cancelLeave(id: number): Observable<ApiResponse<LeaveApplication>> {
    return this.http.put<ApiResponse<LeaveApplication>>(`${this.api}/applications/${id}/cancel`, {});
  }
}
