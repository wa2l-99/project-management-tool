import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ProjectService } from './project.service';
import { ApiConfiguration } from '../api-configuration';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService, ApiConfiguration],
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should save a project and return its ID', () => {
    const mockParams = {
      body: {
        name: 'New Project',
        description: 'Project Description',
        startDate: '2023-12-01',
      },
    };
    const mockResponse = 123;

    service.saveProject(mockParams).subscribe((response) => {
      expect(response).toBe(mockResponse);
    });

    const expectedUrl = 'http://localhost:8088/api/projects';

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockParams.body);

    req.flush(mockResponse);
  });

  it('should invite a member to a project', () => {
    const mockParams = {
      projectId: 1,
      body: { email: 'member@example.com' },
    };
    const mockResponse = {
      id: 1,
      name: 'Test Project',
      members: [{ email: 'member@example.com' }],
    };

    service.inviteMemberToProject(mockParams).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const expectedUrl = 'http://localhost:8088/api/projects/1/invite';
    const req = httpMock.expectOne(expectedUrl);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockParams.body);

    req.flush(mockResponse);
  });

  it('should fetch project members', () => {
    const mockParams = { projectId: 1 };
    const mockResponse = [
      { id: 1, email: 'member1@example.com' },
      { id: 2, email: 'member2@example.com' },
    ];

    service.getProjectMembers(mockParams).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const expectedUrl = 'http://localhost:8088/api/projects/1/members';
    const req = httpMock.expectOne(expectedUrl);

    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should update a member role', () => {
    const mockParams = {
      projectId: 1,
      body: { email: 'member@example.com', role: 'ADMIN' },
    };
    const mockResponse = 'Member role updated successfully';

    service.updateMemberRole(mockParams).subscribe((response) => {
      expect(response).toBe(mockResponse);
    });

    const expectedUrl = 'http://localhost:8088/api/projects/1/update-role';
    const req = httpMock.expectOne(expectedUrl);

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockParams.body);

    req.flush(mockResponse);
  });

  it('should fetch a project by ID', () => {
    const mockParams = { 'project-id': 1 };
    const mockResponse = {
      id: 1,
      name: 'Test Project',
      description: 'A sample project',
    };

    service.findProjectById(mockParams).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const expectedUrl = 'http://localhost:8088/api/projects/1';
    const req = httpMock.expectOne(expectedUrl);

    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should fetch my projects', () => {
    const mockResponse = {
      content: [
        { id: 1, name: 'My Project 1' },
        { id: 2, name: 'My Project 2' },
      ],
      totalElements: 2,
      totalPages: 1,
    };

    service.getMyProjects().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const expectedUrl = 'http://localhost:8088/api/projects/my-projects';
    const req = httpMock.expectOne(expectedUrl);

    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should assign a role to a project member', () => {
    const mockParams = {
      projectId: 1,
      body: { email: 'member@example.com', role: 'USER' },
    };
    const mockResponse = 'Role assigned successfully';

    service.assignRoleToMember(mockParams).subscribe((response) => {
      expect(response).toBe(mockResponse);
    });

    const expectedUrl = 'http://localhost:8088/api/projects/1/assign-role';
    const req = httpMock.expectOne(expectedUrl);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockParams.body);

    req.flush(mockResponse);
  });

  it('should fetch all projects', () => {
    const mockResponse = {
      content: [
        { id: 1, name: 'Project A' },
        { id: 2, name: 'Project B' },
      ],
      totalElements: 2,
      totalPages: 1,
    };

    service.findAllProjects().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const expectedUrl = 'http://localhost:8088/api/projects/all-Projects';
    const req = httpMock.expectOne(expectedUrl);

    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should delete a project', () => {
    const mockParams = { 'project-id': 1 }; // Correct property name
    const mockResponse = 'Project deleted successfully';

    service.deleteProject(mockParams).subscribe((response) => {
      expect(response).toBe(mockResponse);
    });

    const expectedUrl = 'http://localhost:8088/api/projects/1';
    const req = httpMock.expectOne(expectedUrl);

    expect(req.request.method).toBe('DELETE');

    req.flush(mockResponse);
  });
});
