import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksHistoryComponent } from './tasks-history.component';
import { TaskService } from '../../../../services/services';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('TasksHistoryComponent', () => {
  let component: TasksHistoryComponent;
  let fixture: ComponentFixture<TasksHistoryComponent>;
  let mockTaskService: any;

  beforeEach(async () => {
    mockTaskService = {
      getTaskModificationsForUserProjects: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [TasksHistoryComponent],
      providers: [{ provide: TaskService, useValue: mockTaskService }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // Pour gérer les éléments personnalisés
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksHistoryComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load and process task history successfully', () => {
    const mockTaskData = [
      {
        taskName: 'Task 1',
        projectName: 'Project A',
        lastModifiedByName: 'User 1',
        lastModifiedDate: '2023-12-01T10:00:00Z',
        modificationDescription: "'TODO' -> 'DONE'",
      },
      {
        taskName: 'Task 2',
        projectName: 'Project B',
        lastModifiedByName: 'User 2',
        lastModifiedDate: '2023-11-30T12:00:00Z',
        modificationDescription: "'IN_PROGRESS' -> 'DONE'",
      },
    ];

    mockTaskService.getTaskModificationsForUserProjects.mockReturnValue(
      of(mockTaskData)
    );

    fixture.detectChanges();

    expect(component.taskHistory.length).toBe(2);
    expect(component.taskHistory[0].taskName).toBe('Task 1');
    expect(component.taskHistory[0].modificationDescription).toContain(
      "'À faire' -> 'Terminé'"
    );
    expect(component.totalPages).toBe(1);
    expect(component.paginatedTaskHistory.length).toBe(2);
  });

  it('should handle errors while loading task history', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const error = new Error('Error loading tasks');
    mockTaskService.getTaskModificationsForUserProjects.mockReturnValue(
      throwError(() => error)
    );

    fixture.detectChanges(); // Déclenche ngOnInit

    expect(
      mockTaskService.getTaskModificationsForUserProjects
    ).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Erreur lors du chargement de l'historique des tâches:",
      error
    );

    consoleSpy.mockRestore();
  });

  it('should translate statuses in modification descriptions', () => {
    const description = "'TODO' -> 'DONE'";
    const translated = component.translateStatuses(description);

    expect(translated).toBe("'À faire' -> 'Terminé'");
  });
});
