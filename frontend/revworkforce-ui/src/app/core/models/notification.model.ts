export interface Notification {
  id: number;
  recipientUserId: number;
  title: string;
  message: string;
  type: 'LEAVE_APPROVED' | 'LEAVE_REJECTED' | 'LEAVE_APPLIED' | 'PERFORMANCE_FEEDBACK' | 'GOAL_UPDATED' | 'ANNOUNCEMENT' | 'LOW_LEAVE_BALANCE' | 'GENERAL';
  referenceId?: number;
  referenceType?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
