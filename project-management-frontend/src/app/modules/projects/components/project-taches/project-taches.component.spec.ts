import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTachesComponent } from './project-taches.component';

describe('ProjectTachesComponent', () => {
  let component: ProjectTachesComponent;
  let fixture: ComponentFixture<ProjectTachesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectTachesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTachesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
