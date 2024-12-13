import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsListComponent } from './projects-list.component';
import { ProjectService } from '../../../../services/services/project.service';
import { StorageUserService } from '../../../../services/storageUser/storage-user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ProjectsListComponent', () => {
  let component: ProjectsListComponent;
  let fixture: ComponentFixture<ProjectsListComponent>;

  // Mocks
  const mockProjectService = {
    getMyProjects: jest.fn(),
  };

  const mockStorageUserService = {
    hasRole: jest.fn(),
    noRole: jest.fn(),
  };

  const mockToastrService = {
    error: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectsListComponent],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: StorageUserService, useValue: mockStorageUserService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: Router, useValue: mockRouter },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should call findAllUserProjects on init', () => {
      const mockProjects = {
        content: [
          {
            id: 1,
            name: 'Project 1',
            owner: 'John Doe',
            members: [],
            tasks: [],
          },
          {
            id: 2,
            name: 'Project 2',
            owner: 'Jane Doe',
            members: [],
            tasks: [],
          },
        ],
        totalElements: 2,
        totalPages: 1,
      };

      mockProjectService.getMyProjects.mockReturnValue(of(mockProjects));

      fixture.detectChanges();

      expect(mockProjectService.getMyProjects).toHaveBeenCalledWith({
        page: 0,
        size: 4,
      });
      expect(component.projectResponse).toEqual(mockProjects);
    });

    it('should handle error when fetching projects', () => {
      const error = { message: 'Error fetching projects' };
      mockProjectService.getMyProjects.mockReturnValue(throwError(() => error));

      fixture.detectChanges();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        error.message,
        'Erreur'
      );
    });
  });

  describe('No Projects Display', () => {
    it('should display the "no projects" component when no projects are found', () => {
      // Simuler une réponse vide (pas de projets)
      const emptyResponse = {
        content: [],
        totalElements: 0,
        totalPages: 0,
      };
      mockProjectService.getMyProjects.mockReturnValue(of(emptyResponse));

      component.loading = false;
      fixture.detectChanges();

      // Vérifier si le composant est affiché
      const compiled = fixture.nativeElement as HTMLElement;
      const noProjectsComponent = compiled.querySelector(
        'app-no-projects-component'
      );
      expect(noProjectsComponent).toBeTruthy();
    });
  });
  describe('Pagination', () => {
    beforeEach(() => {
      component.projectResponse = {
        content: [],
        totalElements: 20,
        totalPages: 5,
      };
    });

    it('should go to the first page', () => {
      component.page = 2;
      component.goToFirstPage();

      expect(component.page).toBe(0);
      expect(mockProjectService.getMyProjects).toHaveBeenCalledWith({
        page: 0,
        size: 4,
      });
    });

    it('should go to the previous page', () => {
      component.page = 2;
      component.goToPreviousPage();

      expect(component.page).toBe(1);
      expect(mockProjectService.getMyProjects).toHaveBeenCalledWith({
        page: 1,
        size: 4,
      });
    });

    it('should go to a specific page', () => {
      component.goToPage(3);

      expect(component.page).toBe(3);
      expect(mockProjectService.getMyProjects).toHaveBeenCalledWith({
        page: 3,
        size: 4,
      });
    });

    it('should go to the next page', () => {
      component.page = 1;
      component.goToNextPage();

      expect(component.page).toBe(2);
      expect(mockProjectService.getMyProjects).toHaveBeenCalledWith({
        page: 2,
        size: 4,
      });
    });

    it('should go to the last page', () => {
      component.goToLastPage();

      expect(component.page).toBe(4);
      expect(mockProjectService.getMyProjects).toHaveBeenCalledWith({
        page: 4,
        size: 4,
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to create project page', () => {
      component.createProject();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'nouveau-projet']);
    });

    it('should navigate to project details page', () => {
      component.viewProjectDetails(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 1, 'details']);
    });
  });

  describe('Role Checks', () => {
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

    it('should check if user has no role', () => {
      mockStorageUserService.noRole.mockReturnValue(true);
      expect(component.noRole()).toBe(true);

      mockStorageUserService.noRole.mockReturnValue(false);
      expect(component.noRole()).toBe(false);
    });
  });
});
