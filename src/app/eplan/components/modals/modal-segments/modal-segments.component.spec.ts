import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSegmentsComponent } from './modal-segments.component';

describe('ModalSegmentsComponent', () => {
  let component: ModalSegmentsComponent;
  let fixture: ComponentFixture<ModalSegmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSegmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalSegmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
