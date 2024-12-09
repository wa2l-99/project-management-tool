import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';
import { JwtHelperService } from '@auth0/angular-jwt';

describe('TokenService', () => {
  let service: TokenService;
  let jwtHelperSpy: jest.Mocked<JwtHelperService>;

  beforeEach(() => {
    jwtHelperSpy = {
      isTokenExpired: jest.fn(),
    } as unknown as jest.Mocked<JwtHelperService>;

    TestBed.configureTestingModule({
      providers: [
        TokenService,
        { provide: JwtHelperService, useValue: jwtHelperSpy },
      ],
    });

    service = TestBed.inject(TokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('token getter and setter', () => {
    it('should store the token in localStorage', () => {
      service.token = 'test-token';
      expect(localStorage.getItem('token')).toBe('test-token');
    });

    it('should retrieve the token from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      expect(service.token).toBe('test-token');
    });
  });

  describe('isTokenNotValid', () => {
    it('should return true if the token is invalid', () => {
      jest.spyOn(service, 'isTokenValid').mockReturnValue(false);
      expect(service.isTokenNotValid()).toBe(true);
    });

    it('should return false if the token is valid', () => {
      jest.spyOn(service, 'isTokenValid').mockReturnValue(true);
      expect(service.isTokenNotValid()).toBe(false);
    });
  });
});
