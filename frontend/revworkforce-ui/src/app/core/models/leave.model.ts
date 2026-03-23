export interface LeaveType {
  id: number;
  name: string;
  description: string;
  isPaid: boolean;
  isActive: boolean;
}

export interface LeaveBalance {
  id: number;
  userId: number;
  leaveTypeId: number;
  leaveTypeName: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

export interface LeaveApplication {
  id: number;
  userId: number;
  employeeName?: string;
  managerId?: number;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  managerComment?: string;
  appliedAt: string;
  reviewedAt?: string;
}

export interface LeaveApplicationRequest {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason?: string;
}
