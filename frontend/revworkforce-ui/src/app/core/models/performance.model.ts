export interface PerformanceReview {
  id: number;
  employeeId: number;
  managerId?: number;
  reviewCycleId?: number;
  selfRating?: number;
  managerRating?: number;
  selfComments?: string;
  managerFeedback?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'CLOSED';
  submittedAt?: string;
  reviewedAt?: string;
}

export interface Goal {
  id: number;
  employeeId: number;
  managerId?: number;
  title: string;
  description?: string;
  targetDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  progress: number;
  reviewCycleId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GoalRequest {
  title: string;
  description?: string;
  targetDate?: string;
  reviewCycleId?: number;
}
