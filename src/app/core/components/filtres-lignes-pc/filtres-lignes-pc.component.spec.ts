import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltresLignesPcComponent } from './filtres-lignes-pc.component';

describe('FiltresLignesPcComponent', () => {
  let component: FiltresLignesPcComponent;
  let fixture: ComponentFixture<FiltresLignesPcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiltresLignesPcComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltresLignesPcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
