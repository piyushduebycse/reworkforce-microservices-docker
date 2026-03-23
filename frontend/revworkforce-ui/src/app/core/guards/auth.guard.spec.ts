import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should allow activation when logged in', () => {
    authService.isLoggedIn.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, { url: '/dashboard' } as any));
    expect(result).toBeTrue();
  });

  it('should redirect to login when not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, { url: '/dashboard' } as any));
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], jasmine.any(Object));
  });
});
