import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUpdateStepComponent } from './modal-update-step.component';

describe('ModalUpdateStepComponent', () => {
  let component: ModalUpdateStepComponent;
  let fixture: ComponentFixture<ModalUpdateStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalUpdateStepComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalUpdateStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
