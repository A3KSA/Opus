import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetItemComponent } from './projet-item.component';

describe('ProjetItemComponent', () => {
  let component: ProjetItemComponent;
  let fixture: ComponentFixture<ProjetItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjetItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjetItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
