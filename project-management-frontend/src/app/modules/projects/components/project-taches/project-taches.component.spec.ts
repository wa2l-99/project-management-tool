import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectTachesComponent } from './project-taches.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { TaskService, ProjectService } from '../../../../services/services';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { StorageUserService } from '../../../../services/storageUser/storage-user.service';
import { UserResponse } from '../../../../services/models';
import { NgSelectModule } from '@ng-select/ng-select';

describe('ProjectTachesComponent', () => {
  let component: ProjectTachesComponent;
  let fixture: ComponentFixture<ProjectTachesComponent>;

  // Mocks pour les services
  const mockTaskService = {
    findAllTasksByProject: jest.fn(),
    createTask: jest.fn(),
    deleteTask: jest.fn(),
    updateTask: jest.fn(),
    assignTaskToMember$Response: jest.fn(),
  };

  const mockProjectService = {
    getProjectMembers: jest.fn(),
  };

  const mockToastrService = {
    success: jest.fn(),
    error: jest.fn(),
  };

  const mockStorageUserService = {
    hasRole: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
  };

  const mockActivatedRoute = {
    paramMap: of({
      get: jest.fn().mockReturnValue('1'), // ID de projet simulé
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, NgSelectModule],
      declarations: [ProjectTachesComponent],
      providers: [
        { provide: TaskService, useValue: mockTaskService },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: StorageUserService, useValue: mockStorageUserService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectTachesComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Tests
  describe('Initialisation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load tasks on initialization', () => {
      const mockTasks = [
        { id: 1, name: 'Task 1', status: 'TODO' },
        { id: 2, name: 'Task 2', status: 'IN_PROGRESS' },
      ];

      mockTaskService.findAllTasksByProject.mockReturnValue(of(mockTasks));

      component.ngOnInit();

      expect(mockTaskService.findAllTasksByProject).toHaveBeenCalled();
      expect(component.tasksTodo).toEqual([mockTasks[0]]);
      expect(component.tasksInProgress).toEqual([mockTasks[1]]);
    });
  });

  describe('Add Task', () => {
    beforeEach(() => {
      component.taskForm.setValue({
        name: 'New Task',
        description: 'Task Description',
        startDate: '2023-01-01',
        dueDate: '2023-01-10',
        priority: 'MEDIUM',
        status: 'TODO',
      });
      component.projectId = 1; // Simuler un ID de projet
    });

    it('should add a task when form is valid', () => {
      mockTaskService.createTask.mockReturnValue(of({}));

      component.addTask();

      expect(mockTaskService.createTask).toHaveBeenCalled();
      expect(mockToastrService.success).toHaveBeenCalledWith(
        'Tâche créée avec succès'
      );
    });

    it('should show an error when task creation fails', () => {
      mockTaskService.createTask.mockReturnValue(
        throwError(() => new Error('Erreur'))
      );

      component.addTask();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Erreur lors de la création de la tâche'
      );
    });
  });

  describe('Delete Task', () => {
    it('should delete a task', () => {
      component.selectedTaskId = 1;
      mockTaskService.deleteTask.mockReturnValue(of({}));

      component.ConfirmDeleteTask();

      expect(mockTaskService.deleteTask).toHaveBeenCalledWith({ taskId: 1 });
      expect(mockToastrService.success).toHaveBeenCalledWith(
        'Tâche supprimée avec succès'
      );
    });

    it('should show an error when task deletion fails', () => {
      const errorResponse = {
        error: { error: 'Deletion failed' },
      };

      component.selectedTaskId = 1;
      mockTaskService.deleteTask.mockReturnValue(
        throwError(() => errorResponse)
      );

      component.ConfirmDeleteTask();

      expect(mockToastrService.error).toHaveBeenCalledWith('Deletion failed', 'Erreur');
    });
  });

  describe('Assign Task', () => {
    beforeEach(() => {
      component.selectedTaskId = 1;
      component.membersFormGroup.setValue({ memberEmail: 'user@example.com' });
      component.ProjectMembers = [
        { id: 1, email: 'user@example.com' } as UserResponse,
      ];
    });

    it('should assign a task to a member', () => {
      mockTaskService.assignTaskToMember$Response.mockReturnValue(of({}));

      component.assignTask();

      expect(mockTaskService.assignTaskToMember$Response).toHaveBeenCalled();
      expect(mockToastrService.success).toHaveBeenCalledWith(
        'Tâche assignée avec succès'
      );
    });

    it('should show an error when task assignment fails', () => {
      mockTaskService.assignTaskToMember$Response.mockReturnValue(
        throwError(() => new Error('Erreur'))
      );

      component.assignTask();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        "Erreur lors de l'assignation de la tâche"
      );
    });
  });

  describe('Role Checks', () => {
    it('should return true if user is an admin', () => {
      mockStorageUserService.hasRole.mockReturnValue(true);

      expect(component.isAdmin()).toBe(true);
    });

    it('should return true if user is an observer', () => {
      mockStorageUserService.hasRole.mockReturnValue(true);

      expect(component.isobserver()).toBe(true);
    });
  });
});
