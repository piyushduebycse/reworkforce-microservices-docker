import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

interface ApiResponse<T> { success: boolean; message: string; data: T; statusCode: number; }

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = `${environment.apiGatewayUrl}/api`;
  private http = inject(HttpClient);

  getDirectory(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.api}/users/directory`);
  }

  searchUsers(query: string): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.api}/users/search?q=${query}`);
  }

  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.api}/users/${id}`);
  }

  getAllUsers(page = 0, size = 20): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.api}/users?page=${page}&size=${size}`);
  }

  updateUser(id: number, data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.api}/users/${id}`, data);
  }

  deactivateUser(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/users/${id}`);
  }
}
