import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoProjectsComponentComponent } from './no-projects-component.component';

describe('NoProjectsComponentComponent', () => {
  let component: NoProjectsComponentComponent;
  let fixture: ComponentFixture<NoProjectsComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NoProjectsComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoProjectsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
