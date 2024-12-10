import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LigneItemComponent } from './ligne-item.component';

describe('LigneItemComponent', () => {
  let component: LigneItemComponent;
  let fixture: ComponentFixture<LigneItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LigneItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LigneItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
