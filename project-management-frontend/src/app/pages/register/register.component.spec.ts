import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthenticationService } from '../../services/services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: any;
  let toastrServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = {
      register: jest.fn(),
    };

    toastrServiceMock = {
      success: jest.fn(),
      error: jest.fn(),
    };

    routerMock = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [FormsModule],
      providers: [
        { provide: AuthenticationService, useValue: authServiceMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should bind form fields to registerRequest', () => {
    const compiled = fixture.nativeElement;
    const prenomInput = compiled.querySelector('#prenom');
    const nomInput = compiled.querySelector('#nom');
    const emailInput = compiled.querySelector('#login');
    const passwordInput = compiled.querySelector('#password');

    prenomInput.value = 'John';
    prenomInput.dispatchEvent(new Event('input'));
    nomInput.value = 'Doe';
    nomInput.dispatchEvent(new Event('input'));
    emailInput.value = 'john.doe@example.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input'));

    expect(component.registerRequest.prenom).toBe('John');
    expect(component.registerRequest.nom).toBe('Doe');
    expect(component.registerRequest.email).toBe('john.doe@example.com');
    expect(component.registerRequest.password).toBe('password123');
  });

  it('should call register() and handle success', () => {
    authServiceMock.register.mockReturnValue(of({}));

    component.registerRequest = {
      email: 'john.doe@example.com',
      nom: 'Doe',
      prenom: 'John',
      password: 'password123',
    };

    component.register();

    expect(authServiceMock.register).toHaveBeenCalledWith({
      body: {
        email: 'john.doe@example.com',
        nom: 'Doe',
        prenom: 'John',
        password: 'password123',
      },
    });

    expect(toastrServiceMock.success).toHaveBeenCalledWith(
      'Votre inscription a été réussie ! Vous pouvez maintenant accéder à votre compte.',
      'Succès'
    );

    expect(component.registerRequest).toEqual({
      email: '',
      nom: '',
      prenom: '',
      password: '',
    });
  });

  it('should call register() and handle validation errors', () => {
    authServiceMock.register.mockReturnValue(
      throwError({
        error: {
          validationErrors: [
            "L'email est obligatoire",
            'Le mot de passe est obligatoire',
          ],
        },
      })
    );

    component.register();

    expect(authServiceMock.register).toHaveBeenCalled();
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      "L'email est obligatoire",
      'Erreur de validation'
    );
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      'Le mot de passe est obligatoire',
      'Erreur de validation'
    );
    expect(component.errorMsg).toEqual([
      "L'email est obligatoire",
      'Le mot de passe est obligatoire',
    ]);
  });

  it('should call register() and handle unexpected error', () => {
    const mockErrorResponse = {
      error: {},
    };
    authServiceMock.register.mockReturnValue(throwError(mockErrorResponse));

    component.register();

    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      "Une erreur inattendue s'est produite",
      'Erreur'
    );
  });

  it('should navigate to login when login() is called', () => {
    component.login();
    expect(routerMock.navigate).toHaveBeenCalledWith(['login']);
  });
});
