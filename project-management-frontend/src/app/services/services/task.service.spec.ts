import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { TaskResponse } from '../models/task-response';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve a task by ID', () => {
    const mockTask: TaskResponse = {
      id: 1,
      name: 'Test Task',
      description: 'Task description',
      priority: 'HIGH',
      status: 'TODO',
      dueDate: '2024-12-10',
    };

    service.getTaskById({ taskId: 1 }).subscribe((task) => {
      expect(task).toEqual(mockTask);
    });

    const req = httpMock.expectOne('http://localhost:8088/api/tasks/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockTask);
  });

  it('should create a task', () => {
    const mockTaskResponse: TaskResponse = {
      id: 2,
      name: 'New Task',
      description: 'New task description',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      dueDate: '2024-12-15',
    };

    const taskParams = {
      projectId: 1,
      body: {
        name: 'New Task',
        description: 'New task description',
        priority: 'MEDIUM' as 'HIGH' | 'LOW' | 'MEDIUM',
        status: 'IN_PROGRESS' as 'TODO' | 'IN_PROGRESS' | 'DONE',
        dueDate: '2024-12-15',
      },
    };

    service.createTask(taskParams).subscribe((response) => {
      expect(response).toEqual(mockTaskResponse);
    });

    const req = httpMock.expectOne(
      'http://localhost:8088/api/tasks/projectId=1/tasks'
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(taskParams.body);
    req.flush(mockTaskResponse);
  });

  it('should delete a task', () => {
    const mockResponse = 'Task deleted successfully';

    service.deleteTask({ taskId: 1 }).subscribe((response) => {
      expect(response).toBe(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8088/api/tasks/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should assign a task to a member', () => {
    const mockTaskResponse: TaskResponse = {
      id: 1,
      name: 'Assigned Task',
      description: 'Task assigned to member',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: '2024-12-12',
    };

    const params = {
      taskId: 1,
      memberId: 2,
    };

    service.assignTaskToMember(params).subscribe((response) => {
      expect(response).toEqual(mockTaskResponse);
    });

    const req = httpMock.expectOne(
      'http://localhost:8088/api/tasks/1/assign?memberId=2'
    );
    expect(req.request.method).toBe('POST');
    req.flush(mockTaskResponse);
  });

  it('should retrieve tasks by priority', () => {
    const mockTasks: TaskResponse[] = [
      {
        id: 1,
        name: 'High Priority Task',
        description: 'This is a high priority task',
        priority: 'HIGH',
        status: 'TODO',
        dueDate: '2024-12-10',
      },
    ];

    service
      .getTasksByPriority({ projectId: 1, priority: 'HIGH' })
      .subscribe((tasks) => {
        expect(tasks).toEqual(mockTasks);
      });

    const req = httpMock.expectOne(
      'http://localhost:8088/api/tasks/projectId=1/tasksByPriority?priority=HIGH'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });

  it('should retrieve task modifications for user projects', () => {
    const mockHistory = [
      {
        taskId: 1,
        modificationDate: '2024-12-08',
        description: 'Task updated',
      },
    ];

    service.getTaskModificationsForUserProjects().subscribe((history) => {
      expect(history).toEqual(mockHistory);
    });

    const req = httpMock.expectOne(
      'http://localhost:8088/api/tasks/my-projects/history'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockHistory);
  });

  it('should handle an error during task assignment', () => {
    const params = { taskId: 1, memberId: 2 };
    const mockError = new ErrorEvent('Network error');

    service.assignTaskToMember(params).subscribe(
      () => fail('Expected error'),
      (error) => expect(error.error.type).toBe('Network error')
    );

    const req = httpMock.expectOne(
      'http://localhost:8088/api/tasks/1/assign?memberId=2'
    );
    req.error(mockError);
  });

  it('should retrieve all tasks by project ID', () => {
    const mockTasks: TaskResponse[] = [
      {
        id: 1,
        name: 'Task 1',
        description: 'Description 1',
        priority: 'LOW',
        status: 'TODO',
        dueDate: '2024-12-10',
      },
      {
        id: 2,
        name: 'Task 2',
        description: 'Description 2',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: '2024-12-15',
      },
    ];

    const params = { projectId: 1 };

    service.findAllTasksByProject(params).subscribe((tasks) => {
      expect(tasks).toEqual(mockTasks);
    });

    const req = httpMock.expectOne(
      `http://localhost:8088/api/tasks/projectId=1`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });

  it('should update a task and return the updated task', () => {
    const mockTask: TaskResponse = {
      id: 1,
      name: 'Updated Task',
      description: 'Updated Description',
      priority: 'MEDIUM' as 'HIGH' | 'LOW' | 'MEDIUM',
      status: 'DONE' as 'TODO' | 'IN_PROGRESS' | 'DONE',
      dueDate: '2024-12-15',
    };

    const params = {
      taskId: 1,
      body: {
        name: 'Updated Task',
        description: 'Updated Description',
        priority: 'MEDIUM' as 'HIGH' | 'LOW' | 'MEDIUM',
        status: 'DONE' as 'TODO' | 'IN_PROGRESS' | 'DONE',
        dueDate: '2024-12-15',
      },
    };

    service.updateTask(params).subscribe((task) => {
      expect(task).toEqual(mockTask);
    });

    const req = httpMock.expectOne(`http://localhost:8088/api/tasks/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(params.body);
    req.flush(mockTask);
  });

  it('should handle error when updating a task', () => {
    const params = {
      taskId: 1,
      body: {
        name: '',
        description: '',
        priority: 'MEDIUM' as 'HIGH' | 'LOW' | 'MEDIUM',
        status: 'DONE' as 'TODO' | 'IN_PROGRESS' | 'DONE',
        dueDate: '2024-12-15',
      },
    };

    service.updateTask(params).subscribe(
      () => fail('Expected an error'),
      (error) => {
        expect(error.status).toBe(400);
      }
    );
    const req = httpMock.expectOne(`${service.rootUrl}/api/tasks/1`);
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
  });

  it('should handle invalid data during task update', () => {
    const params = {
      taskId: 1,
      body: {
        name: '',
        description: 'Updated Description',
        priority: 'INVALID_PRIORITY' as 'HIGH' | 'LOW' | 'MEDIUM',
        status: 'DONE' as 'TODO' | 'IN_PROGRESS' | 'DONE',
        dueDate: '',
      },
    };

    service.updateTask(params).subscribe(
      () => fail('Expected an error'),
      (error) => {
        expect(error.status).toBe(400);
      }
    );

    const req = httpMock.expectOne(`${service.rootUrl}/api/tasks/1`);
    expect(req.request.method).toBe('PUT');
    req.flush('Invalid data', { status: 400, statusText: 'Bad Request' });
  });

  it('should return an empty array when the project has no tasks', () => {
    const params = { projectId: 1 };

    service.findAllTasksByProject(params).subscribe((response) => {
      expect(response).toEqual([]);
    });

    const req = httpMock.expectOne(`${service.rootUrl}/api/tasks/projectId=1`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
