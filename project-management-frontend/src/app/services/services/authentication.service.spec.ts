import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthenticationService } from './authentication.service';
import { ApiConfiguration } from '../api-configuration';
import { AuthenticationResponse } from '../models/authentication-response';
import { UserResponse } from '../models';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthenticationService, ApiConfiguration],
    });

    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('register', () => {
    it('should register a user and return user ID', () => {
      const params = {
        body: {
          email: 'test@example.com',
          password: 'Password123!',
          nom: 'Doe',
          prenom: 'John',
        },
      };

      const mockResponse = 123; // Simulating returned user ID

      service.register(params).subscribe((response) => {
        expect(response).toBe(mockResponse);
      });

      const req = httpMock.expectOne(`${service.rootUrl}/api/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params.body); // Verify the body matches the structure
      req.flush(mockResponse); // Simulate server response
    });

    it('should handle error when registration fails', () => {
      const params = {
        body: {
          email: 'test@example.com',
          password: 'Password123!',
          nom: 'Doe',
          prenom: 'John',
        },
      };

      service.register(params).subscribe(
        () => fail('Expected an error'),
        (error) => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne(`${service.rootUrl}/api/auth/register`);
      expect(req.request.method).toBe('POST');
      req.flush('Registration failed', {
        status: 400,
        statusText: 'Bad Request',
      });
    });
  });

  describe('authenticate (login)', () => {
    it('should authenticate a user and return a token', () => {
      const params = {
        body: {
          email: 'test@example.com',
          password: 'Password123!',
        },
      };

      const mockResponse: AuthenticationResponse = {
        token: 'sample.jwt.token',
      };

      service.authenticate(params).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${service.rootUrl}/api/auth/authenticate`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params.body);
      req.flush(mockResponse);
    });

    it('should handle error when authentication fails', () => {
      const params = {
        body: {
          email: 'test@example.com',
          password: 'wrong-password',
        },
      };

      service.authenticate(params).subscribe(
        () => fail('Expected an error'),
        (error) => {
          expect(error.status).toBe(401);
        }
      );

      const req = httpMock.expectOne(
        `${service.rootUrl}/api/auth/authenticate`
      );
      expect(req.request.method).toBe('POST');
      req.flush('Invalid credentials', {
        status: 401,
        statusText: 'Unauthorized',
      });
    });
  });

  it('should handle missing email during registration', () => {
    const params = {
      body: {
        password: 'Password123!',
        nom: 'Doe',
        prenom: 'John',
        email: '',
      },
    };

    service.register(params).subscribe(
      () => fail('Expected an error'),
      (error) => {
        expect(error.status).toBe(400);
      }
    );

    const req = httpMock.expectOne(`${service.rootUrl}/api/auth/register`);
    req.flush('Email is required', { status: 400, statusText: 'Bad Request' });
  });

  it('should handle weak password during registration', () => {
    const params = {
      body: {
        email: 'test@example.com',
        password: '123',
        nom: 'Doe',
        prenom: 'John',
      },
    };

    service.register(params).subscribe(
      () => fail('Expected an error'),
      (error) => {
        expect(error.status).toBe(400);
      }
    );

    const req = httpMock.expectOne(`${service.rootUrl}/api/auth/register`);
    req.flush('Password is too weak', {
      status: 400,
      statusText: 'Bad Request',
    });
  });
  it('should handle missing credentials during login', () => {
    const params = {
      body: {
        email: '',
        password: '',
      },
    };

    service.authenticate(params).subscribe(
      () => fail('Expected an error'),
      (error) => {
        expect(error.status).toBe(400);
      }
    );

    const req = httpMock.expectOne(`${service.rootUrl}/api/auth/authenticate`);
    req.flush('Email and password are required', {
      status: 400,
      statusText: 'Bad Request',
    });
  });

  it('should handle invalid credentials during login', () => {
    const params = {
      body: {
        email: 'invalid@example.com',
        password: 'WrongPassword',
      },
    };

    service.authenticate(params).subscribe(
      () => fail('Expected an error'),
      (error) => {
        expect(error.status).toBe(401);
      }
    );

    const req = httpMock.expectOne(`${service.rootUrl}/api/auth/authenticate`);
    req.flush('Invalid credentials', {
      status: 401,
      statusText: 'Unauthorized',
    });
  });

  it('should return all users', () => {
    const mockUsers: UserResponse[] = [
      { id: 1, email: 'user1@example.com', nom: 'User', prenom: 'One' },
      { id: 2, email: 'user2@example.com', nom: 'User', prenom: 'Two' },
    ];

    service.findAll().subscribe((response) => {
      expect(response).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(`${service.rootUrl}/api/auth`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });
});
