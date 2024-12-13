import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/services/authentication.service';
import { TokenService } from '../../services/token/token.service';
import { StorageUserService } from '../../services/storageUser/storage-user.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let mockRouter = {
    navigate: jest.fn(),
  };
  let mockAuthService = {
    authenticate: jest.fn(),
  };
  let mockTokenService = {
    token: '',
  };
  let mockStorageUserService = {
    saveUser: jest.fn(),
  };
  let mockToastrService = {
    success: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule], // Import FormsModule for ngModel
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: StorageUserService, useValue: mockStorageUserService },
        { provide: ToastrService, useValue: mockToastrService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty email and password on initialization', () => {
    expect(component.authrequest.email).toBe('');
    expect(component.authrequest.password).toBe('');
  });

  it('should call login method when login button is clicked', () => {
    jest.spyOn(component, 'login');
    const loginButton = fixture.nativeElement.querySelector(
      'button[type="submit"]'
    );
    loginButton.click();
    expect(component.login).toHaveBeenCalled();
  });

  it('should navigate to home and show success toastr on successful login', () => {
    const mockResponse = {
      token: 'fake-token',
      user: { id: 1, name: 'Test User' },
    };
    mockAuthService.authenticate.mockReturnValue(of(mockResponse));

    component.login();

    expect(mockAuthService.authenticate).toHaveBeenCalledWith({
      body: component.authrequest,
    });
    expect(mockTokenService.token).toBe('fake-token');
    expect(mockStorageUserService.saveUser).toHaveBeenCalledWith(
      mockResponse.user
    );
    expect(mockToastrService.success).toHaveBeenCalledWith(
      'Connexion réussie !',
      'Succès'
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle validation errors and display toastr errors', () => {
    const mockErrorResponse = {
      error: {
        validationErrors: [
          'Email est obligatoire',
          'Mot de passe est obligatoire',
        ],
      },
    };
    mockAuthService.authenticate.mockReturnValue(throwError(mockErrorResponse));

    component.login();

    expect(component.errorMsg).toEqual([
      'Email est obligatoire',
      'Mot de passe est obligatoire',
    ]);
    expect(mockToastrService.error).toHaveBeenCalledWith(
      'Email est obligatoire',
      'Erreur de validation'
    );
    expect(mockToastrService.error).toHaveBeenCalledWith(
      'Mot de passe est obligatoire',
      'Erreur de validation'
    );
  });

  it('should handle unexpected errors and display a generic toastr error', () => {
    const mockErrorResponse = {
      error: {},
    };
    mockAuthService.authenticate.mockReturnValue(throwError(mockErrorResponse));

    component.login();

    expect(mockToastrService.error).toHaveBeenCalledWith(
      "Une erreur inattendue s'est produite",
      'Erreur'
    );
  });

  it('should navigate to register page when register button is clicked', () => {
    jest.spyOn(component, 'register');
    const registerButton = fixture.nativeElement.querySelector(
      '.login-footer button'
    );
    registerButton.click();
    expect(component.register).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['register']);
  });

  it('should navigate to dashboard and show success toastr on successful login', () => {
    // Mock the response from the authentication service
    const mockResponse = {
      token: 'fake-token',
      user: { id: 1, name: 'Test User' },
    };
    mockAuthService.authenticate.mockReturnValue(of(mockResponse));

    // Appeler la méthode de connexion
    component.login();

    // Vérifier que le service d'authentification a été appelé avec les données correctes
    expect(mockAuthService.authenticate).toHaveBeenCalledWith({
      body: component.authrequest,
    });

    // Vérifier que le token est stocké
    expect(mockTokenService.token).toBe('fake-token');

    // Vérifier que l'utilisateur est sauvegardé
    expect(mockStorageUserService.saveUser).toHaveBeenCalledWith(
      mockResponse.user
    );

    // Vérifier que le toast de succès est affiché
    expect(mockToastrService.success).toHaveBeenCalledWith(
      'Connexion réussie !',
      'Succès'
    );

    // Vérifier la redirection vers le tableau de bord
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});
