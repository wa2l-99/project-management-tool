import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { TaskDetailsComponent } from './task-details.component';
import { TaskService, ProjectService } from '../../../../services/services';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { StorageUserService } from '../../../../services/storageUser/storage-user.service';

describe('TaskDetailsComponent', () => {
  let component: TaskDetailsComponent;
  let fixture: ComponentFixture<TaskDetailsComponent>;
  let mockTaskService: any;
  let mockProjectService: any;
  let mockToastrService: any;
  let mockRouter: any;
  let mockStorageUserService: any;

  const mockTask = {
    id: 1,
    name: 'Test Task',
    description: 'Test Description',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2024-12-31',
    projectName: 'Test Project',
    assignedTo: 'John Doe (john@example.com)',
  };

  const mockUsers = [
    { id: 1, email: 'john@example.com', fullName: 'John Doe' },
    { id: 2, email: 'jane@example.com', fullName: 'Jane Smith' },
  ];

  beforeEach(async () => {
    mockTaskService = {
      getTaskById: jest.fn().mockReturnValue(of(mockTask)),
      assignTaskToMember$Response: jest.fn().mockReturnValue(of({})),
      deleteTask: jest.fn().mockReturnValue(of({})),
      updateTask: jest.fn().mockReturnValue(of({})),
      assignTaskToMember: jest.fn().mockReturnValue(of({})),
    };

    mockProjectService = {
      getProjectMembers: jest.fn().mockReturnValue(of(mockUsers)),
    };

    mockToastrService = {
      success: jest.fn(),
      error: jest.fn(),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    mockStorageUserService = {
      hasRole: jest.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      declarations: [TaskDetailsComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        RouterTestingModule,
        NgSelectModule,
      ],
      providers: [
        { provide: TaskService, useValue: mockTaskService },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: Router, useValue: mockRouter },
        { provide: StorageUserService, useValue: mockStorageUserService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jest.fn().mockReturnValue('1'),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Task Loading', () => {
    it('should load task details on init', () => {
      expect(mockTaskService.getTaskById).toHaveBeenCalled();
      expect(component.task).toEqual(mockTask);
      expect(component.daysLeft).toBeDefined();
    });

    it('should handle task loading error', () => {
      mockTaskService.getTaskById.mockReturnValue(
        throwError(() => new Error('Load Error'))
      );
      component.ngOnInit();
      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Erreur lors du chargement de la tâche'
      );
    });
  });

  describe('Days Left Calculation', () => {
    it('should calculate days left correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const daysLeft = component.calculateDaysLeft(futureDate.toISOString());
      expect(daysLeft).toBeGreaterThan(0);
    });

    it('should return 0 for undefined due date', () => {
      const daysLeft = component.calculateDaysLeft(undefined);
      expect(daysLeft).toBe(0);
    });
  });

  describe('User Filtering', () => {
    it('should filter users based on email', () => {
      const filteredUsers = component.filterUsers('john');
      expect(filteredUsers.length).toBe(1);
      expect(filteredUsers[0].email).toBe('john@example.com');
    });

    it('should return all users for non-string input', () => {
      const filteredUsers = component.filterUsers(null as any);
      expect(filteredUsers.length).toBe(2);
    });
  });

  describe('Task Assignment', () => {
    beforeEach(() => {
      component.membersFormGroup.patchValue({
        memberEmail: 'john@example.com',
      });
    });

    it('should assign task successfully', () => {
      component.assignTask();
      expect(mockTaskService.assignTaskToMember$Response).toHaveBeenCalled();
      expect(mockToastrService.success).toHaveBeenCalledWith(
        'Tâche assignée avec succès'
      );
    });

    it('should handle task assignment error', () => {
      mockTaskService.assignTaskToMember$Response.mockReturnValue(
        throwError(() => new Error('Assign Error'))
      );
      component.assignTask();
      expect(mockToastrService.error).toHaveBeenCalledWith(
        "Erreur lors de l'assignation de la tâche"
      );
    });
  });

  describe('Task Deletion', () => {
    it('should delete task successfully', () => {
      const mockRemoveBackdrop = jest.spyOn(
        component,
        'removeModalBackdrop' as any
      );
      component.ConfirmDeleteTask();
      expect(mockTaskService.deleteTask).toHaveBeenCalled();
      expect(mockToastrService.success).toHaveBeenCalledWith(
        'Tâche supprimée avec succès'
      );
      expect(mockRemoveBackdrop).toHaveBeenCalled();
    });

    it('should handle task deletion error', () => {
      const errorResponse = {
        error: { error: 'Deletion failed' },
      };
      mockTaskService.deleteTask.mockReturnValue(
        throwError(() => errorResponse)
      );
      component.ConfirmDeleteTask();
      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Deletion failed',
        'Erreur'
      );
    });
  });

  describe('Utility Methods', () => {
    it('should extract name and email correctly', () => {
      const result = component.extractNameAndEmail(
        'John Doe (john@example.com)'
      );
      expect(result).toEqual({
        fullName: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should get priority label correctly', () => {
      expect(component.getPriorityLabel('LOW')).toBe('Faible');
      expect(component.getPriorityLabel('MEDIUM')).toBe('Moyenne');
      expect(component.getPriorityLabel('HIGH')).toBe('Haute');
      expect(component.getPriorityLabel('UNKNOWN')).toBe('Inconnu');
    });

    it('should get status label correctly', () => {
      expect(component.getStatusLabel('TODO')).toBe('À faire');
      expect(component.getStatusLabel('IN_PROGRESS')).toBe('En cours');
      expect(component.getStatusLabel('DONE')).toBe('Terminé');
      expect(component.getStatusLabel('UNKNOWN')).toBe('Inconnu');
    });
  });
});
