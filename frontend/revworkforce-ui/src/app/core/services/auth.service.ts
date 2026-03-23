import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, User } from '../models/user.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'revworkforce_token';
  private readonly USER_KEY = 'revworkforce_user';
  private readonly apiUrl = environment.apiGatewayUrl;
  private http = inject(HttpClient);
  private router = inject(Router);

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/api/auth/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem(this.TOKEN_KEY, response.data.accessToken);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.data));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): AuthResponse | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  getCurrentUserRole(): string {
    return this.getCurrentUser()?.role ?? '';
  }

  navigateByRole(): void {
    const role = this.getCurrentUserRole();
    switch (role) {
      case 'ADMIN': this.router.navigate(['/admin/dashboard']); break;
      case 'MANAGER': this.router.navigate(['/manager/dashboard']); break;
      default: this.router.navigate(['/employee/dashboard']); break;
    }
  }
}
