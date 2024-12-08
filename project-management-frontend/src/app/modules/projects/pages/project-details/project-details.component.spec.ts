import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectDetailsComponent } from './project-details.component';
import { ProjectService } from '../../../../services/services';
import { AuthenticationService } from '../../../../services/services';
import { StorageUserService } from '../../../../services/storageUser/storage-user.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { of, throwError } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { NgSelectModule } from '@ng-select/ng-select';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ProjectDetailsComponent', () => {
  let component: ProjectDetailsComponent;
  let fixture: ComponentFixture<ProjectDetailsComponent>;

  // Mock services
  const mockProjectService = {
    findProjectById: jest.fn().mockReturnValue(of({})),
    inviteMemberToProject$Response: jest.fn().mockReturnValue(of({})),
    updateMemberRole$Response: jest.fn().mockReturnValue(of({})),
    assignRoleToMember: jest.fn().mockReturnValue(of({})),
    deleteProject: jest.fn().mockReturnValue(of({})),
  };

  const mockAuthService = {
    findAll: jest.fn().mockReturnValue(of([])),
  };

  const mockStorageUserService = {
    getSavedUser: jest.fn(),
    hasRole: jest.fn(),
  };

  const mockToastrService = {
    success: jest.fn(),
    error: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jest.fn().mockReturnValue('1'),
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatTableModule,
        NgSelectModule,
        MatPaginator,
        RouterOutlet,
        BrowserAnimationsModule,
      ],
      declarations: [ProjectDetailsComponent],
      providers: [
        FormBuilder,
        { provide: ProjectService, useValue: mockProjectService },
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: StorageUserService, useValue: mockStorageUserService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailsComponent);
    component = fixture.componentInstance;

    // Initialisation des formulaires
    component.membersFormGroup = new FormGroup({
      memberEmail: new FormControl(null, Validators.required),
    });

    component.rolesFormGroup = new FormGroup({
      role: new FormControl(null, Validators.required),
    });

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load project details on initialization', () => {
      const mockProject = {
        name: 'Test Project',
        startDate: '2024-01-01',
        members: [
          {
            nom: 'Doe',
            prenom: 'John',
            email: 'john.doe@example.com',
            role: 'MEMBER',
          },
        ],
        tasks: [],
      };

      mockProjectService.findProjectById.mockReturnValue(of(mockProject));

      component.ngOnInit();

      expect(mockProjectService.findProjectById).toHaveBeenCalled();
      expect(component.project).toEqual(mockProject);
      expect(component.dataSource.data).toEqual(mockProject.members);
    });
  });

  describe('User Filtering', () => {
    it('should filter users by email', () => {
      component.allUsers = [
        { email: 'test1@example.com' },
        { email: 'test2@example.com' },
      ];

      const filtered = component.filterUsers('test1');
      expect(filtered).toEqual([{ email: 'test1@example.com' }]);
    });

    it('should return all users if input is not a string', () => {
      const users = [
        { email: 'test1@example.com' },
        { email: 'test2@example.com' },
      ];
      component.allUsers = users;

      const filtered = component.filterUsers(123 as any);
      expect(filtered).toEqual(users);
    });
  });

  describe('Member Invitation', () => {
    beforeEach(() => {
      mockAuthService.findAll.mockReturnValue(
        of([{ email: 'test@example.com' }])
      );

      component.projectId = 1;
      component.membersFormGroup.setValue({
        memberEmail: { email: 'test@example.com' },
      });
    });

    it('should successfully invite a member', () => {
      mockProjectService.inviteMemberToProject$Response.mockReturnValue(of({}));

      component.inviteMember();

      expect(
        mockProjectService.inviteMemberToProject$Response
      ).toHaveBeenCalled();
      expect(mockToastrService.success).toHaveBeenCalled();
    });

    it('should handle invitation error', () => {
      const errorResponse = {
        error: { error: 'Invitation failed' },
      };
      mockProjectService.inviteMemberToProject$Response.mockReturnValue(
        throwError(() => errorResponse)
      );

      component.inviteMember();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Invitation failed',
        'Erreur'
      );
    });
  });

  describe('Project Deletion', () => {
    beforeEach(() => {
      component.projectId = 1;
      mockStorageUserService.getSavedUser.mockReturnValue({ role: 'ADMIN' });
    });

    it('should delete project successfully', () => {
      mockProjectService.deleteProject.mockReturnValue(of({}));

      component.confirmDeleteProject();

      expect(mockProjectService.deleteProject).toHaveBeenCalled();
      expect(mockToastrService.success).toHaveBeenCalledWith(
        'Projet supprimé avec succès'
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/mes-projets']);
    });

    it('should handle project deletion error', () => {
      const errorResponse = {
        error: { error: 'Deletion failed' },
      };
      mockProjectService.deleteProject.mockReturnValue(
        throwError(() => errorResponse)
      );

      component.confirmDeleteProject();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Deletion failed',
        'Erreur'
      );
    });
  });

  describe('Authorization Checks', () => {
    it('should check if user is admin', () => {
      mockStorageUserService.hasRole.mockReturnValue(true);
      expect(component.isAdmin()).toBe(true);

      mockStorageUserService.hasRole.mockReturnValue(false);
      expect(component.isAdmin()).toBe(false);
    });

    it('should check if user is member', () => {
      mockStorageUserService.hasRole.mockReturnValue(true);
      expect(component.isMember()).toBe(true);

      mockStorageUserService.hasRole.mockReturnValue(false);
      expect(component.isMember()).toBe(false);
    });

    it('should check if user is observer', () => {
      mockStorageUserService.hasRole.mockReturnValue(true);
      expect(component.isobserver()).toBe(true);

      mockStorageUserService.hasRole.mockReturnValue(false);
      expect(component.isobserver()).toBe(false);
    });
  });
});
