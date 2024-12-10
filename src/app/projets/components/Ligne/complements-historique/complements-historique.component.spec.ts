import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplementsHistoriqueComponent } from './complements-historique.component';

describe('ComplementsHistoriqueComponent', () => {
  let component: ComplementsHistoriqueComponent;
  let fixture: ComponentFixture<ComplementsHistoriqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplementsHistoriqueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplementsHistoriqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
