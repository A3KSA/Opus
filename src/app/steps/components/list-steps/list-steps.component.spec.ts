import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListStepsComponent } from './list-steps.component';

describe('ListStepsComponent', () => {
  let component: ListStepsComponent;
  let fixture: ComponentFixture<ListStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListStepsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
