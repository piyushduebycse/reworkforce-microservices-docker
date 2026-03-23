import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> { success: boolean; message: string; data: T; statusCode: number; }

export interface Holiday {
  id?: number;
  name: string;
  date: string;
  description?: string;
  holidayType?: string;
  isRecurring?: boolean;
}

export interface Department {
  id?: number;
  name: string;
  description?: string;
  headEmployeeId?: number;
  isActive?: boolean;
  active?: boolean;
}

export interface Announcement {
  id?: number;
  title: string;
  content: string;
  targetRole?: string;
  isActive?: boolean;
  active?: boolean;
  createdAt?: string;
  expiresAt?: string;
}

@Injectable({ providedIn: 'root' })
export class EmployeeManagementService {
  private api = `${environment.apiGatewayUrl}/api`;
  private http = inject(HttpClient);

  // Departments
  getDepartments(): Observable<ApiResponse<Department[]>> {
    return this.http.get<ApiResponse<Department[]>>(`${this.api}/departments`);
  }
  createDepartment(dept: Department): Observable<ApiResponse<Department>> {
    return this.http.post<ApiResponse<Department>>(`${this.api}/departments`, dept);
  }
  updateDepartment(id: number, dept: Department): Observable<ApiResponse<Department>> {
    return this.http.put<ApiResponse<Department>>(`${this.api}/departments/${id}`, dept);
  }
  deleteDepartment(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/departments/${id}`);
  }
  deactivateDepartment(id: number): Observable<ApiResponse<Department>> {
    return this.http.put<ApiResponse<Department>>(`${this.api}/departments/${id}/deactivate`, {});
  }
  activateDepartment(id: number): Observable<ApiResponse<Department>> {
    return this.http.put<ApiResponse<Department>>(`${this.api}/departments/${id}/activate`, {});
  }

  // Holidays
  getHolidays(): Observable<ApiResponse<Holiday[]>> {
    return this.http.get<ApiResponse<Holiday[]>>(`${environment.apiGatewayUrl}/api/leaves/holidays`);
  }
  getUpcomingHolidays(): Observable<ApiResponse<Holiday[]>> {
    return this.http.get<ApiResponse<Holiday[]>>(`${environment.apiGatewayUrl}/api/leaves/holidays/upcoming`);
  }
  createHoliday(h: Holiday): Observable<ApiResponse<Holiday>> {
    return this.http.post<ApiResponse<Holiday>>(`${environment.apiGatewayUrl}/api/leaves/holidays`, h);
  }
  updateHoliday(id: number, h: Holiday): Observable<ApiResponse<Holiday>> {
    return this.http.put<ApiResponse<Holiday>>(`${environment.apiGatewayUrl}/api/leaves/holidays/${id}`, h);
  }
  deleteHoliday(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiGatewayUrl}/api/leaves/holidays/${id}`);
  }

  // Designations
  getDesignations(departmentId?: number): Observable<ApiResponse<any[]>> {
    const url = departmentId
      ? `${this.api}/designations?departmentId=${departmentId}`
      : `${this.api}/designations`;
    return this.http.get<ApiResponse<any[]>>(url);
  }

  // Announcements
  getAnnouncements(): Observable<ApiResponse<Announcement[]>> {
    return this.http.get<ApiResponse<Announcement[]>>(`${this.api}/announcements`);
  }
  createAnnouncement(a: Announcement): Observable<ApiResponse<Announcement>> {
    return this.http.post<ApiResponse<Announcement>>(`${this.api}/announcements`, a);
  }
  updateAnnouncement(id: number, a: Announcement): Observable<ApiResponse<Announcement>> {
    return this.http.put<ApiResponse<Announcement>>(`${this.api}/announcements/${id}`, a);
  }
  deleteAnnouncement(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/announcements/${id}`);
  }
}
