import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false when not logged in', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should return null token when not logged in', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should clear storage on logout', () => {
    localStorage.setItem('revworkforce_token', 'test-token');
    service.logout();
    expect(localStorage.getItem('revworkforce_token')).toBeNull();
  });
});
