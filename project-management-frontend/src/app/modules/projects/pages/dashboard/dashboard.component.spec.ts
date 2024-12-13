import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { StorageUserService } from '../../../../services/storageUser/storage-user.service';
import { ProjectService, TaskService } from '../../../../services/services';
import { of, throwError } from 'rxjs';
import { Chart } from 'chart.js';
import {
  PageResponseProjectResponse,
  ProjectResponse,
  TaskResponse,
} from '../../../../services/models';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockStorageUserService: jest.Mocked<StorageUserService>;
  let mockProjectService: jest.Mocked<ProjectService>;
  let mockTaskService: jest.Mocked<TaskService>;

  beforeEach(() => {
    // Création de mock services avec des types spécifiques
    mockStorageUserService = {
      getSavedUser: jest.fn(),
    } as any;

    mockProjectService = {
      findAllProjects: jest.fn(),
    } as any;

    mockTaskService = {
      getAllTasks: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: StorageUserService, useValue: mockStorageUserService },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: TaskService, useValue: mockTaskService },
      ],
    }).compileComponents();

    // Mock Chart.register to prevent errors
    jest.spyOn(Chart, 'register').mockImplementation();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getConnectedUserName', () => {
    it('should return user name when saved user exists', () => {
      mockStorageUserService.getSavedUser.mockReturnValue({ nom: 'John Doe' });

      const userName = component.getConnectedUserName();

      expect(userName).toBe('John Doe');
    });

    it('should return empty string when no saved user', () => {
      mockStorageUserService.getSavedUser.mockReturnValue(null);

      const userName = component.getConnectedUserName();

      expect(userName).toBe('');
    });
  });

  describe('loadProjects', () => {
    it('should set totalProjects correctly on successful load', () => {
      // Mock précis correspondant à PageResponseProjectResponse
      const mockProjectResponse: PageResponseProjectResponse = {
        content: [
          { id: 1, name: 'Project 1' } as ProjectResponse,
          { id: 2, name: 'Project 2' } as ProjectResponse,
        ],
        first: true,
        last: true,
        number: 0,
        size: 2,
        totalElements: 2,
        totalPages: 1,
      };

      mockProjectService.findAllProjects.mockReturnValue(
        of(mockProjectResponse)
      );

      component.loadProjects();

      expect(component.totalProjects).toBe(2);
      expect(mockProjectService.findAllProjects).toHaveBeenCalled();
    });

    it('should handle empty content gracefully', () => {
      const mockProjectResponse: PageResponseProjectResponse = {
        content: [],
        first: true,
        last: true,
        number: 0,
        size: 0,
        totalElements: 0,
        totalPages: 0,
      };

      mockProjectService.findAllProjects.mockReturnValue(
        of(mockProjectResponse)
      );

      component.loadProjects();

      expect(component.totalProjects).toBe(0);
    });

    it('should handle undefined content', () => {
      const mockProjectResponse: PageResponseProjectResponse = {
        first: true,
        last: true,
        number: 0,
        size: 0,
        totalElements: 0,
        totalPages: 0,
      };

      mockProjectService.findAllProjects.mockReturnValue(
        of(mockProjectResponse)
      );

      component.loadProjects();

      expect(component.totalProjects).toBe(0);
    });

    it('should handle error when loading projects', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorResponse = new Error('Load projects error');
      mockProjectService.findAllProjects.mockReturnValue(
        throwError(() => errorResponse)
      );

      component.loadProjects();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erreur lors du chargement des projets:',
        errorResponse
      );
    });
  });

  describe('loadTasks', () => {
    const createMockTask = (status: string): TaskResponse =>
      ({
        status: status,
      } as TaskResponse);

    const mockTasks: TaskResponse[] = [
      createMockTask('TODO'),
      createMockTask('TODO'),
      createMockTask('IN_PROGRESS'),
      createMockTask('DONE'),
      createMockTask('DONE'),
    ];

    it('should correctly count tasks by status', () => {
      mockTaskService.getAllTasks.mockReturnValue(of(mockTasks));

      component.loadTasks();

      expect(component.totalTasks).toBe(5);
      expect(component.totalTodoTasks).toBe(2);
      expect(component.totalInProgressTasks).toBe(1);
      expect(component.totalDoneTasks).toBe(2);
    });

    it('should update pie chart data when tasks are loaded', () => {
      mockTaskService.getAllTasks.mockReturnValue(of(mockTasks));

      component.loadTasks();

      expect(component.pieChartData.datasets[0].data).toEqual([40, 20, 40]);
      expect(component.pieChartData.labels).toEqual([
        'À faire (40%)',
        'En cours (20%)',
        'Terminé (40%)',
      ]);
    });

    it('should handle error when loading tasks', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorResponse = new Error('Load tasks error');
      mockTaskService.getAllTasks.mockReturnValue(
        throwError(() => errorResponse)
      );

      component.loadTasks();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erreur lors du chargement des tâches:',
        errorResponse
      );
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(component.calculatePercentage(2, 5)).toBe(40);
      expect(component.calculatePercentage(0, 5)).toBe(0);
      expect(component.calculatePercentage(5, 0)).toBe(0);
    });
  });

  describe('updatePieChartData', () => {
    beforeEach(() => {
      component.totalTasks = 5;
      component.totalTodoTasks = 2;
      component.totalInProgressTasks = 1;
      component.totalDoneTasks = 2;
    });

    it('should update pie chart data with correct percentages', () => {
      component.updatePieChartData();

      expect(component.pieChartData.labels).toEqual([
        'À faire (40%)',
        'En cours (20%)',
        'Terminé (40%)',
      ]);
      expect(component.pieChartData.datasets[0].data).toEqual([40, 20, 40]);
      expect(component.pieChartData.datasets[0].backgroundColor).toEqual([
        '#f87171',
        '#fbbf24',
        '#34d399',
      ]);
    });
  });
});
