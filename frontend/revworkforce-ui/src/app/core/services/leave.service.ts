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

  createLeaveType(payload: { name: string; description: string; isPaid: boolean }): Observable<ApiResponse<LeaveType>> {
    return this.http.post<ApiResponse<LeaveType>>(`${this.api}/types`, payload);
  }

  updateLeaveType(id: number, payload: { name: string; description: string; isPaid: boolean }): Observable<ApiResponse<LeaveType>> {
    return this.http.put<ApiResponse<LeaveType>>(`${this.api}/types/${id}`, payload);
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

  initUserBalancesFromQuota(userId: number, role: string, year: number): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.api}/balances/user/${userId}/init?role=${role}&year=${year}`, {});
  }

  getQuotas(year: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.api}/quotas?year=${year}`);
  }

  upsertQuota(quota: { leaveTypeId: number; role: string; totalDays: number; year: number }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.api}/quotas`, quota);
  }

  deleteQuota(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/quotas/${id}`);
  }

  setUserBalance(userId: number, leaveTypeId: number, totalDays: number, year: number): Observable<ApiResponse<LeaveBalance>> {
    return this.http.put<ApiResponse<LeaveBalance>>(`${this.api}/balances/user/${userId}?leaveTypeId=${leaveTypeId}&totalDays=${totalDays}&year=${year}`, {});
  }

  initializeBalances(body: { userIds: number[]; defaults: { leaveTypeId: number; totalDays: number }[]; year: number }): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.api}/balances/admin/initialize`, body);
  }

  getAllUserBalances(userId: number, year: number): Observable<ApiResponse<LeaveBalance[]>> {
    return this.http.get<ApiResponse<LeaveBalance[]>>(`${this.api}/balances/user/${userId}?year=${year}`);
  }
}
