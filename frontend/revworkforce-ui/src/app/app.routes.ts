import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/auth/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'employee/dashboard',
        loadComponent: () => import('./features/employee-dashboard/employee-dashboard.component').then(m => m.EmployeeDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['EMPLOYEE', 'MANAGER', 'ADMIN'] }
      },
      {
        path: 'manager/dashboard',
        loadComponent: () => import('./features/manager-dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['MANAGER', 'ADMIN'] }
      },
      {
        path: 'admin/dashboard',
        loadComponent: () => import('./features/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'leave/apply',
        loadComponent: () => import('./features/leave/leave-apply/leave-apply.component').then(m => m.LeaveApplyComponent),
        canActivate: [authGuard]
      },
      {
        path: 'leave/list',
        loadComponent: () => import('./features/leave/leave-list/leave-list.component').then(m => m.LeaveListComponent),
        canActivate: [authGuard]
      },
      {
        path: 'leave/balance',
        loadComponent: () => import('./features/leave/leave-balance/leave-balance.component').then(m => m.LeaveBalanceComponent),
        canActivate: [authGuard]
      },
      {
        path: 'leave/approvals',
        loadComponent: () => import('./features/leave/leave-approval/leave-approval.component').then(m => m.LeaveApprovalComponent),
        canActivate: [roleGuard],
        data: { roles: ['MANAGER', 'ADMIN'] }
      },
      {
        path: 'performance/reviews',
        loadComponent: () => import('./features/performance/review-list/review-list.component').then(m => m.ReviewListComponent),
        canActivate: [authGuard]
      },
      {
        path: 'performance/review/new',
        loadComponent: () => import('./features/performance/review-form/review-form.component').then(m => m.ReviewFormComponent),
        canActivate: [authGuard]
      },
      {
        path: 'performance/goals',
        loadComponent: () => import('./features/performance/goal-list/goal-list.component').then(m => m.GoalListComponent),
        canActivate: [authGuard]
      },
      {
        path: 'admin/employees',
        loadComponent: () => import('./features/admin/employee-management/employee-management.component').then(m => m.EmployeeManagementComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/departments',
        loadComponent: () => import('./features/admin/department-management/department-management.component').then(m => m.DepartmentManagementComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/announcements',
        loadComponent: () => import('./features/admin/announcements/announcements.component').then(m => m.AnnouncementsComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/leave-balances',
        loadComponent: () => import('./features/admin/leave-balance-admin/leave-balance-admin.component').then(m => m.LeaveBalanceAdminComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/holidays',
        loadComponent: () => import('./features/admin/holiday-management/holiday-management.component').then(m => m.HolidayManagementComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
      },
      {
        path: 'directory',
        loadComponent: () => import('./features/directory/directory.component').then(m => m.DirectoryComponent),
        canActivate: [authGuard]
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notification-panel/notification-panel.component').then(m => m.NotificationPanelComponent),
        canActivate: [authGuard]
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
