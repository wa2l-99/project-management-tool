import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateProjectComponent } from './create-project.component';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProjectService } from '../../../../services/services/project.service';
import { AuthenticationService } from '../../../../services/services';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CreateProjectComponent', () => {
  let component: CreateProjectComponent;
  let fixture: ComponentFixture<CreateProjectComponent>;

  // Mock services
  const mockProjectService = {
    saveProject: jest.fn().mockReturnValue(of({})),
    inviteMemberToProject$Response: jest.fn().mockReturnValue(of({})),
    assignRoleToMember: jest.fn().mockReturnValue(of({})),
    getProjectMembers: jest.fn().mockReturnValue(of([])),
    findProjectById: jest.fn().mockReturnValue(of({})),
  };

  const mockAuthService = {
    findAll: jest.fn().mockReturnValue(of([])),
  };

  const mockToastrService = {
    success: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatStepperModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatListModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        MatButtonModule,
        BrowserAnimationsModule,
      ],
      declarations: [CreateProjectComponent],
      providers: [
        FormBuilder,
        { provide: ProjectService, useValue: mockProjectService },
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: ToastrService, useValue: mockToastrService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProjectComponent);
    component = fixture.componentInstance;

    // Initialisation manuelle des formulaires sans `_formBuilder`
    component.projectForm = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      startDate: new FormControl('', Validators.required),
    });

    component.membersFormGroup = new FormGroup({
      memberEmail: new FormControl('', Validators.required),
    });

    component.rolesFormGroup = new FormGroup({
      member: new FormControl('', Validators.required),
      role: new FormControl('', Validators.required),
    });

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test de l'initialisation du composant
  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load users on init', () => {
      const mockUsers = [{ email: 'user@example.com' }];
      mockAuthService.findAll.mockReturnValue(of(mockUsers));

      component.ngOnInit();
      expect(mockAuthService.findAll).toHaveBeenCalled();
      expect(component.allUsers).toEqual(mockUsers);
    });
  });

  // Test de la création de projet
  describe('Project Creation', () => {
    it('should create a project successfully', () => {
      mockProjectService.saveProject.mockReturnValue(of(1)); // Mock project ID

      component.projectForm.setValue({
        name: 'Test Project',
        description: 'A test project',
        startDate: new Date(),
      });

      component.createProject();

      expect(mockProjectService.saveProject).toHaveBeenCalledWith({
        body: {
          name: 'Test Project',
          description: 'A test project',
          startDate: expect.any(String), // Vérifie que la date est formatée
        },
      });
      expect(component.projectCreated).toBe(true);
    });

    it('should handle project creation error', () => {
      mockProjectService.saveProject.mockReturnValue(
        throwError(() => ({ error: { error: 'Error creating project' } }))
      );

      component.projectForm.setValue({
        name: 'Test Project',
        description: 'A test project',
        startDate: new Date(),
      });

      component.createProject();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Error creating project',
        'Erreur'
      );
      expect(component.projectCreated).toBe(false);
    });
  });

  // Test de l'invitation de membre
  describe('Member Invitation', () => {
    it('should invite a member successfully', () => {
      mockProjectService.inviteMemberToProject$Response.mockReturnValue(of({}));

      component.projectId = 1;
      component.membersFormGroup.setValue({
        memberEmail: 'member@example.com',
      });

      component.inviteMember();

      expect(
        mockProjectService.inviteMemberToProject$Response
      ).toHaveBeenCalledWith({
        projectId: 1,
        body: { email: 'member@example.com' },
      });
      expect(mockToastrService.success).toHaveBeenCalledWith(
        'L\'utilisateur avec l\'email member@example.com a été invité avec succès !'
      );
    });

    it('should handle member invitation error', () => {
      mockProjectService.inviteMemberToProject$Response.mockReturnValue(
        throwError(() => ({ error: { error: 'Error inviting member' } }))
      );

      component.projectId = 1;
      component.membersFormGroup.setValue({
        memberEmail: 'member@example.com',
      });

      component.inviteMember();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Error inviting member',
        'Erreur'
      );
    });
  });

  // Test de l'assignation de rôle
  describe('Role Assignment', () => {
    it('should assign role successfully', () => {
      mockProjectService.assignRoleToMember.mockReturnValue(
        of('Role assigned')
      );

      component.projectId = 1;
      component.rolesFormGroup.setValue({
        member: 'member@example.com',
        role: 'ADMIN',
      });

      component.assignRole();

      expect(mockProjectService.assignRoleToMember).toHaveBeenCalledWith({
        projectId: 1,
        body: { email: 'member@example.com', role: 'ADMIN' },
      });
      expect(mockToastrService.success).toHaveBeenCalledWith('Role assigned');
    });

    it('should handle role assignment error', () => {
      mockProjectService.assignRoleToMember.mockReturnValue(
        throwError(() => ({ error: { error: 'Error assigning role' } }))
      );

      component.projectId = 1;
      component.rolesFormGroup.setValue({
        member: 'member@example.com',
        role: 'ADMIN',
      });

      component.assignRole();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Error assigning role',
        'Erreur'
      );
    });
  });

  // Test de la navigation entre étapes
  describe('Stepper Navigation', () => {
    it('should navigate to the next step', () => {
      component.nextStep();
      expect(component.stepper.selectedIndex).toBe(1);
    });

    it('should navigate to the previous step', () => {
      component.stepper.selectedIndex = 1;
      component.perivousStep();
      expect(component.stepper.selectedIndex).toBe(0);
    });
  });
});
