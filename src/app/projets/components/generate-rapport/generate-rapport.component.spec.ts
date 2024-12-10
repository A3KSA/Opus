import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateRapportComponent } from './generate-rapport.component';

describe('GenerateRapportComponent', () => {
  let component: GenerateRapportComponent;
  let fixture: ComponentFixture<GenerateRapportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateRapportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateRapportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
