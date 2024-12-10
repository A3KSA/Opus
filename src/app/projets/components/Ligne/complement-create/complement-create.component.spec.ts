import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplementCreateComponent } from './complement-create.component';

describe('ComplementCreateComponent', () => {
  let component: ComplementCreateComponent;
  let fixture: ComponentFixture<ComplementCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplementCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplementCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
