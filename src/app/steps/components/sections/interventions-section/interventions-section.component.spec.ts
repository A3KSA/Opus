import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterventionsSectionComponent } from './interventions-section.component';

describe('InterventionsSectionComponent', () => {
  let component: InterventionsSectionComponent;
  let fixture: ComponentFixture<InterventionsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterventionsSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterventionsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
