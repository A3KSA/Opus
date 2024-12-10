import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewNavigationBarComponent } from './new-navigation-bar.component';

describe('NewNavigationBarComponent', () => {
  let component: NewNavigationBarComponent;
  let fixture: ComponentFixture<NewNavigationBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewNavigationBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewNavigationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
