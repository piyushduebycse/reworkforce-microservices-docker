export interface User {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  managerId?: number;
  departmentId?: number;
  designationId?: number;
  phoneNumber?: string;
  profilePictureUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
}

export interface LoginRequest {
  email: string;
  password: string;
}
