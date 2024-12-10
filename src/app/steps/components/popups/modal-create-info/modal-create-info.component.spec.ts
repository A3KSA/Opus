import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateInfoComponent } from './modal-create-info.component';

describe('ModalCreateInfoComponent', () => {
  let component: ModalCreateInfoComponent;
  let fixture: ComponentFixture<ModalCreateInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCreateInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCreateInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
