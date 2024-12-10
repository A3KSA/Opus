import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateDocComponent } from './modal-create-doc.component';

describe('ModalCreateDocComponent', () => {
  let component: ModalCreateDocComponent;
  let fixture: ComponentFixture<ModalCreateDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCreateDocComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCreateDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
