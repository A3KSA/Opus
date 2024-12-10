import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateEmailComponent } from './generate-email.component';

describe('GenerateEmailComponent', () => {
  let component: GenerateEmailComponent;
  let fixture: ComponentFixture<GenerateEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateEmailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
