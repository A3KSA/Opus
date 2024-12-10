import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntiteCreateComponent } from './entite-create.component';

describe('EntiteCreateComponent', () => {
  let component: EntiteCreateComponent;
  let fixture: ComponentFixture<EntiteCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntiteCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntiteCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
